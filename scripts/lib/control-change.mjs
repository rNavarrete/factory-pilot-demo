// Pure control-change classification (ENG-140, G-B3/G-B4). No I/O here so it can
// be unit tested; scripts/control-change.mjs is the CLI wrapper.
//
// A "control change" is a diff that touches the gate itself (check scripts,
// workflows, config, ownership) or weakens test assertions. It is detective:
// it never blocks, it flags the change for Rolando's explicit review.

export const PROTECTED_PATTERNS = [
  { re: /^\.github\//, label: '.github/**' },
  { re: /^scripts\//, label: 'scripts/**' },
  { re: /^package\.json$/, label: 'package.json' },
  { re: /^package-lock\.json$/, label: 'package-lock.json' },
  { re: /^eslint\.config\.js$/, label: 'eslint.config.js' },
  { re: /^\.prettierrc\.json$/, label: '.prettierrc.json' },
  { re: /^\.prettierignore$/, label: '.prettierignore' },
  { re: /^tsconfig\.json$/, label: 'tsconfig.json' },
  { re: /^vite\.config\.ts$/, label: 'vite.config.ts' },
  { re: /^\.nvmrc$/, label: '.nvmrc' },
  { re: /^CODEOWNERS$/, label: 'CODEOWNERS' },
];

const ASSERTION_RE = /(?:^|[^\w.$])(?:expect|it|test)\s*\(/;
const WEAKENING_RE =
  /(?:^|[^\w$])(?:(?:it|test|describe)\.(?:skip|only|todo)\b|(?:it|test)\.fails\b|(?:xit|xtest|xdescribe|fit|fdescribe)\s*\()/;

export function normalizePath(p) {
  return String(p ?? '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
}

export function protectedLabel(path) {
  const p = normalizePath(path);
  const hit = PROTECTED_PATTERNS.find(({ re }) => re.test(p));
  return hit ? hit.label : null;
}

export function isTestFile(path) {
  const p = normalizePath(path);
  return p.startsWith('tests/') || /\.test\.ts$/.test(p);
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

    for (const p of new Set([path, oldPath].filter(Boolean))) {
      const label = protectedLabel(p);
      if (label) reasons.push(`${p}: protected path (${label}) changed`);
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

    const { added, removed } = patchLines(file?.patch);
    const addedAssertions = added.filter((l) => ASSERTION_RE.test(l)).length;
    const removedAssertions = removed.filter((l) => ASSERTION_RE.test(l)).length;
    if (removedAssertions > addedAssertions) {
      reasons.push(
        `${path}: removes more assertion/test lines than it adds (${removedAssertions} removed, ${addedAssertions} added)`,
      );
    }
    const weakening = added.filter((l) => WEAKENING_RE.test(l));
    if (weakening.length > 0) {
      reasons.push(`${path}: adds skip/only/todo/fails (${weakening.map((l) => l.trim()).join(' | ')})`);
    }
  }
  return { flagged: reasons.length > 0, reasons };
}
