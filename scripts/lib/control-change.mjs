// Pure control-change classification (ENG-140, G-B3/G-B4). No I/O here so it can
// be unit tested; scripts/control-change.mjs is the CLI wrapper.
//
// Deny by default: a change to ANY path is a control change unless the path is
// plain content under the allowlist below. Even inside the allowlist,
// config-looking files (dotfiles, CODEOWNERS, package.json, tsconfig*.json,
// *.config.*, vitest.workspace*) are control changes. Test-weakening edits and
// added lint/type suppressions are flagged anywhere. Detective only: it never
// blocks, it flags the change for Rolando's explicit review.
//
// The same predicate (isControlPath) decides which files feed the check's
// configSha256, so "would be flagged if changed" == "is part of the check revision".

// Plain content: product source, tests, docs. CLAUDE.md is deliberately absent
// (worker instructions are a control).
export const CONTENT_ALLOWLIST = [
  { re: /^src\//, label: 'src/**' },
  { re: /^tests\//, label: 'tests/**' },
  { re: /^docs\//, label: 'docs/**' },
  { re: /^README\.md$/, label: 'README.md' },
  { re: /^index\.html$/, label: 'index.html' },
];

const CONFIG_BASENAMES = [
  { re: /^\./, label: 'dotfile' },
  { re: /^CODEOWNERS$/, label: 'CODEOWNERS' },
  { re: /^package\.json$/, label: 'package.json' },
  { re: /^tsconfig.*\.json$/, label: 'tsconfig*.json' },
  { re: /\.config\./, label: '*.config.*' },
  { re: /^vitest\.workspace/, label: 'vitest.workspace*' },
];

const ASSERTION_RE = /(?:^|[^\w.$])(?:(?:expect(?:\.soft)?|it|test|assert)\s*\(|assert\.\w+\s*\()/;
const WEAKENING_RE = new RegExp(
  [
    // it.skip / test.only / describe.todo / it.concurrent.skip / describe.skipIf / test.runIf
    String.raw`(?:^|[^\w$])(?:it|test|describe|suite)(?:\.concurrent)?\.(?:skip|only|todo|skipIf|runIf)\b`,
    String.raw`(?:^|[^\w$])(?:it|test)\.fails\b`,
    String.raw`(?:^|[^\w$])(?:xit|xtest|xdescribe|fit|fdescribe)\s*\(`,
  ].join('|'),
);
const SUPPRESSION_RE = /@ts-nocheck|@ts-ignore|@ts-expect-error|eslint-disable/;

export function normalizePath(p) {
  return String(p ?? '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
}

function basename(p) {
  const parts = p.split('/');
  return parts[parts.length - 1];
}

/**
 * Why a path is a control path, or null when it is plain allowlisted content.
 * @param {string} path repo-relative path
 * @returns {string | null}
 */
export function controlPathReason(path) {
  const p = normalizePath(path);
  if (p === '') return 'empty path';
  const allowed = CONTENT_ALLOWLIST.find(({ re }) => re.test(p));
  if (!allowed)
    return 'protected path (not in content allowlist: src/**, tests/**, docs/**, README.md, index.html)';
  const config = CONFIG_BASENAMES.find(({ re }) => re.test(basename(p)));
  if (config) return `protected path (config file ${config.label} inside ${allowed.label})`;
  return null;
}

export function isControlPath(path) {
  return controlPathReason(path) !== null;
}

export function isTestFile(path) {
  const p = normalizePath(path);
  return p.startsWith('tests/') || /\.(test|spec)\.[cm]?[jt]sx?$/.test(p);
}

function isDeleted(status) {
  const s = String(status ?? '').toLowerCase();
  return s === 'd' || s === 'deleted' || s === 'removed';
}

function isRenamed(status) {
  const s = String(status ?? '').toLowerCase();
  return s.startsWith('r') || s === 'renamed';
}

function patchLines(patch) {
  const added = [];
  const removed = [];
  for (const line of String(patch ?? '').split('\n')) {
    if (line.startsWith('+++') || line.startsWith('---')) continue;
    if (line.startsWith('+')) added.push(line.slice(1));
    else if (line.startsWith('-')) removed.push(line.slice(1));
  }
  return { added, removed };
}

/**
 * @param {{ path: string, status?: string, patch?: string, oldPath?: string }[]} files
 * @returns {{ flagged: boolean, reasons: string[] }}
 */
export function classifyDiff(files) {
  const reasons = [];
  for (const file of files ?? []) {
    const path = normalizePath(file?.path);
    const oldPath = file?.oldPath ? normalizePath(file.oldPath) : null;
    const status = file?.status;

    // Either side of a rename counts.
    for (const p of new Set([path, oldPath].filter((x) => x !== null))) {
      const why = controlPathReason(p);
      if (why) reasons.push(`${p || '(empty path)'}: ${why} changed`);
    }

    const { added, removed } = patchLines(file?.patch);

    const suppressions = added.filter((l) => SUPPRESSION_RE.test(l));
    if (suppressions.length > 0) {
      reasons.push(`${path}: adds lint/type suppression (${suppressions.map((l) => l.trim()).join(' | ')})`);
    }

    const testNow = isTestFile(path);
    const testBefore = oldPath ? isTestFile(oldPath) : testNow;
    if ((testNow || testBefore) && isDeleted(status)) {
      reasons.push(`${path}: test file deleted`);
      continue;
    }
    if (oldPath && testBefore && !testNow && isRenamed(status)) {
      reasons.push(`${oldPath} -> ${path}: test file moved out of the test suite`);
    }
    if (!testNow && !testBefore) continue;

    const addedAssertions = added.filter((l) => ASSERTION_RE.test(l)).length;
    const removedAssertions = removed.filter((l) => ASSERTION_RE.test(l)).length;
    if (removedAssertions > addedAssertions) {
      reasons.push(
        `${path}: removes more assertion/test lines than it adds (${removedAssertions} removed, ${addedAssertions} added)`,
      );
    }
    const weakening = added.filter((l) => WEAKENING_RE.test(l));
    if (weakening.length > 0) {
      reasons.push(
        `${path}: adds skip/only/todo/fails/skipIf/runIf (${weakening.map((l) => l.trim()).join(' | ')})`,
      );
    }
  }
  return { flagged: reasons.length > 0, reasons };
}
