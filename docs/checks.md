# Checks

## The one command

```sh
npm run check
```

This runs `scripts/check.mjs`. It always runs the same steps, in this order, each with a fixed timeout:

1. format (`prettier --check .`)
2. lint (`eslint .`)
3. typecheck (`tsc --noEmit`)
4. test (`vitest run`)
5. build (`vite build`)

It first checks that Node matches `.nvmrc` (22). Every step runs even if an earlier one fails, so you see all
failures at once. It exits 0 only when every step passes and the git tree is clean. There are no flags to skip
or narrow steps.

## What it records

`check-evidence.json` (gitignored) holds:

- the command (`npm run check`)
- the candidate commit, branch, and whether the tree was clean
- the contract digest (`--contract-digest <sha256>` or `FACTORY_CONTRACT_DIGEST`; `null` if not given)
- the check revision: check version, and SHA-256 hashes of the check script, the CI workflow, and every tracked
  file outside the content folders (see Control changes), so any config or tooling change shows up
- the environment: Node, npm, OS, and runner (`github-actions`, `local` or `cloud-worker`)
- each step's status, exit code, time, timeout and the end of its log
- the outcome: `pass` or `fail`

Full logs go to `check-logs/<step>.log`.

## How CI makes it authoritative

The CI workflow (`.github/workflows/ci.yml`) checks out the exact candidate commit (the PR head, not the merge
commit), runs `node scripts/check.mjs` directly with `NODE_OPTIONS` cleared (so nothing is preloaded into the
run), then runs `scripts/verify-evidence.mjs` against that commit. Verification fails
if the outcome is not `pass`, a required step is missing or did not pass (skipped or neutral count as missing),
the commit does not match (stale evidence), or the tree was dirty. The evidence and logs are uploaded as the
`check-evidence-<sha>` artifact.

Only a clean CI run on the exact candidate commit counts. A local run is useful, but it is not evidence.

CI does not tie the evidence to an approved task. The controller does that: it knows the approved contract digest
and runs `scripts/verify-evidence.mjs --expect-contract-digest <sha256>`. Verification then fails if the
evidence's contract digest is missing, `null` or different (the comparison ignores case). Without that flag a
`null` digest is accepted, so a CI pass on its own says nothing about which task it was for.

## The job to require

ENG-142's ruleset must require the **`verified`** job. It passes only when both `check` and `check-selftest`
succeeded. Skipped, cancelled or neutral counts as a failure.

## Control changes

A control change is any change that could weaken or redefine the check. The rule is deny by default: a changed
file is flagged unless it is in the content allowlist:

- `src/**`, `tests/**`, `docs/**`, `README.md`, `index.html`

So `.github/`, `scripts/`, `package.json`, `CLAUDE.md`, `.gitignore`, `.npmrc`, any root config file and any new
top-level file are all flagged.

Inside the allowlist, files that look like config are still flagged: dotfiles (such as `.prettierrc`, `.npmrc`,
`.eslintrc`), `CODEOWNERS`, `package.json`, `tsconfig*.json`, `*.config.*` (such as `vitest.config.ts`) and
`vitest.workspace*`.

Test and code changes are also flagged when they:

- delete a test file
- change or remove any existing non-blank line in a test file. Only adding lines is safe, so rewriting an
  assertion is flagged even if the number of `expect(` lines stays the same
- rename or move a test file (either side of the rename counts)
- add a test file outside `tests/**/*.test.ts`, such as `src/new.test.ts`, because the suite would never run it
- add `.skip`, `.only`, `.todo`, `.fails`, `skipIf`, `runIf` or `.concurrent.skip` / `.concurrent.only`
- add `@ts-nocheck`, `@ts-ignore`, `@ts-expect-error` or `eslint-disable` in any file

Plain edits to source, docs, `README.md` or `index.html`, and new tests added under `tests/`, are not flagged.

On pull requests, the `control-change` job runs the classifier from the base branch, not from the PR, so a PR
cannot change the rules it is judged by. If the base branch has no classifier yet (true for the first PR that adds
it), the PR is flagged with "no trusted classifier on base branch".

This job only reports. It does not fail CI. It writes a warning and a summary, and Rolando's review of a flagged
PR is the actual gate. That stays true until ENG-142 turns on the ruleset with required code-owner review;
`.github/CODEOWNERS` routes protected paths to him for that.

## Cloud worker parity

A cloud worker proves it gets the same results as CI by running:

```sh
npm ci
node scripts/check-selftest.mjs
```

The selftest runs the unit tests for the evidence and control-change logic, then runs the real check on seeded
copies of the repo in temp dirs: one that should pass, and ones with a format error, a lint error, a type error, a
failing test and a dirty tree that should each fail in the right step. It prints a table, writes
`check-selftest.json`, and exits nonzero on any mismatch. It does not change the repo. CI runs the same script in
the `check-selftest` job.

A local fallback (treating a non-CI run as evidence) stays off until the cloud worker's selftest matches CI.

## Runtime

Measured on a cloud worker (Node 22): `npm run check` about 5 s; full selftest (unit tests plus six seeded cases) about 31 s.

## Governance map

| ID   | Control                                                                 | Where                                                   |
| ---- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| G-B1 | One check command, nonzero on failure, records evidence                 | `scripts/check.mjs`, `check-evidence.json`              |
| G-B2 | Evidence counts only from a clean CI run on the exact commit            | `ci.yml` `check` job, `scripts/verify-evidence.mjs`     |
| G-B3 | Changes to gates, workflows, config or test assertions are flagged      | `scripts/control-change.mjs`, `control-change` job      |
| G-B4 | A candidate cannot quietly redefine its own evidence                    | control-change flag, `CODEOWNERS`, check revision hash  |
| G-B5 | Cloud worker and CI agree on seeded examples; fixed env and timeouts    | `scripts/check-selftest.mjs`, `.nvmrc`, step timeouts   |

## Known limits

- G-B4: the `check` job runs the PR's own copy of the workflow and scripts. A PR could change the check and still
  go green. The classifier runs from the base branch, so such a PR is flagged, but the flag does not block merge.
  Human review of flagged PRs is the real control until ENG-142 turns on the ruleset and code-owner review.
- The classifier works on file paths and diff lines. It can be fooled by a change it does not recognise, for example
  weakening behaviour in `src/` that the tests do not cover.
- The check revision hash shows what ran, but nothing compares it to a trusted baseline in CI yet.
  `verify-evidence.mjs --expect-check-revision` supports that when a baseline is stored outside the PR.
