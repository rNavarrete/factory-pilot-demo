// Pure helpers for workspace setup (ENG-141). No process spawning here so they can be
// unit tested; scripts/session-setup.mjs is the CLI that the cloud session hooks run.

import { createHash } from 'node:crypto';

export const STATUS_SCHEMA_VERSION = 1;

export function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Decide whether installed dependencies can be reused.
 * The stamp is written into node_modules after a successful install, so a stale or
 * partial node_modules (lockfile changed, Node major changed, install interrupted)
 * never counts as a cache hit.
 * @param {{ stamp: any, lockSha256: string, nodeMajor: string }} input
 * @returns {{ action: 'reuse' | 'install', reason: string }}
 */
export function decideInstall({ stamp, lockSha256, nodeMajor }) {
  if (!stamp || typeof stamp !== 'object') return { action: 'install', reason: 'no install stamp' };
  if (stamp.lockSha256 !== lockSha256)
    return { action: 'install', reason: 'package-lock.json changed since last install' };
  if (String(stamp.nodeMajor) !== String(nodeMajor))
    return { action: 'install', reason: `installed under Node ${stamp.nodeMajor}` };
  return { action: 'reuse', reason: 'node_modules matches package-lock.json (cache hit)' };
}

// Files that should never be committed to this repo. `.env.example` is allowed because
// it documents variable names without values.
const SECRET_PATH_RES = [
  /(^|\/)\.env(\.(?!example$)[^/]+)?$/,
  /\.(pem|key|p12|pfx)$/,
  /(^|\/)id_(rsa|dsa|ecdsa|ed25519)$/,
  /(^|\/)\.npmrc$/,
];

// Token shapes for the credentials this project could plausibly hold.
export const SECRET_CONTENT_RES = [
  { name: 'Anthropic API or OAuth token', re: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: 'GitHub token', re: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/ },
  { name: 'npm token', re: /\bnpm_[A-Za-z0-9]{30,}/ },
  { name: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'private key', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

/** Tracked paths that look like secret files. */
export function secretLikePaths(paths) {
  return paths.filter((p) => SECRET_PATH_RES.some((re) => re.test(p)));
}

/** Secret-looking strings in one file's text, as `name` labels (never the value). */
export function secretLikeContent(text) {
  return SECRET_CONTENT_RES.filter(({ re }) => re.test(text)).map(({ name }) => name);
}

/**
 * Should a tool call go ahead? Used by the PreToolUse gate in cloud sessions.
 * Fails closed: no status, a status from another session, a setup still marked
 * running (the hook was killed by its timeout) or a failed setup all block.
 * @param {{ remote: boolean, status: any, sessionId: string | undefined }} input
 * @returns {{ allow: boolean, reason: string }}
 */
export function gateDecision({ remote, status, sessionId }) {
  if (!remote) return { allow: true, reason: 'not a cloud session; gate is cloud-only' };
  if (!status || typeof status !== 'object')
    return { allow: false, reason: 'workspace setup has not run in this session' };
  if (status.schemaVersion !== STATUS_SCHEMA_VERSION)
    return { allow: false, reason: 'workspace setup status has an unknown format' };
  if (!sessionId || status.sessionId !== sessionId)
    return { allow: false, reason: 'workspace setup status belongs to a different session' };
  if (status.status === 'running')
    return { allow: false, reason: 'workspace setup did not finish (timed out or was killed)' };
  if (status.status !== 'ok')
    return {
      allow: false,
      reason: `workspace setup failed${status.failedStep ? ` at step "${status.failedStep}"` : ''}`,
    };
  return { allow: true, reason: 'workspace setup succeeded in this session' };
}

/**
 * Poll `probe` until it returns true or the deadline passes. For per-session services:
 * a service counts as started only once its readiness probe passes.
 * @param {() => Promise<boolean> | boolean} probe
 * @param {{ timeoutMs: number, intervalMs?: number, now?: () => number, sleep?: (ms: number) => Promise<void> }} opts
 * @returns {Promise<{ ready: boolean, attempts: number, waitedMs: number }>}
 */
export async function waitForReady(probe, opts) {
  const now = opts.now ?? (() => Date.now());
  const sleep = opts.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  const intervalMs = opts.intervalMs ?? 250;
  const start = now();
  let attempts = 0;
  for (;;) {
    attempts += 1;
    let ok;
    try {
      ok = (await probe()) === true;
    } catch {
      ok = false;
    }
    if (ok) return { ready: true, attempts, waitedMs: now() - start };
    if (now() - start + intervalMs > opts.timeoutMs)
      return { ready: false, attempts, waitedMs: now() - start };
    await sleep(intervalMs);
  }
}

/** Text Claude sees at session start. A failure tells the worker to stop. */
export function sessionContext(status) {
  const steps = (status.steps ?? [])
    .map((s) => `- ${s.name}: ${s.status}${s.detail ? ` (${s.detail})` : ''}`)
    .join('\n');
  if (status.status === 'ok')
    return `Workspace setup succeeded (${status.install ?? 'install unknown'}).\n${steps}`;
  return [
    `INFRASTRUCTURE FAILURE: workspace setup failed at step "${status.failedStep}".`,
    'Do not work on the task. File edits and shell commands are blocked in this session.',
    'End the attempt and report this as an infrastructure failure, not a task failure.',
    steps,
  ].join('\n');
}
