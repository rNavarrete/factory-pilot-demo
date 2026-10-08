# Factory workspace check: claude/env-check-a1

- Session: https://claude.ai/code/session_01PxBQZsiNtPBZQhih8BMBZt
- Time (UTC): 2026-10-08T01:00:22Z
- Base: `main` @ `7d883133ec2676fb5dde9168e79deeb0acbe6788`

## 1. Setup

- `.factory/setup-status.json`: `sessionId` is `0b42536f-d2d8-56a3-acfe-b1ea01a1f154`, `source: startup`, `status: ok`, `install: cache hit`, `gate: { enforce: true, reason: "FACTORY_SETUP_GATE=enforce" }`. All steps passed: node (v22.22.0, .nvmrc 22), secrets (36 tracked files, no secret-like files or tokens), dependencies (cache hit), tools (typescript, vitest, vite, eslint, prettier, jsdom), services (none needed). Started 2026-10-08T00:59:45.130Z and finished 00:59:46.632Z.
- `FACTORY_SETUP_GATE=enforce`
- `CLAUDE_CODE_REMOTE=true`
- `node --version`: `v22.22.0`
- `pwd`: `/home/user/factory-pilot-demo`
- `git rev-parse HEAD`: `7d883133ec2676fb5dde9168e79deeb0acbe6788`
- `git remote -v`: `origin https://github.com/rNavarrete/factory-pilot-demo` (fetch and push)
- **The session start hook ran in this session.** The file's `sessionId` matches this session's local Claude Code session ID: the transcript is at `~/.claude/projects/-home-user-factory-pilot-demo/0b42536f-...jsonl` and the scratchpad uses the same ID. The file's timestamps also fall about 10 s after the cloud session was created at 00:59:35Z.
- **The guard reports `enforce: true`.**

## 2. Checks

All four passed (exit 0).

| Check | Result | Last lines |
|---|---|---|
| `npm run typecheck` | pass | `> factory-pilot-demo@0.1.0 typecheck` / `> tsc --noEmit` (no errors) |
| `npm test` | pass | `Test Files 1 passed (1)` / `Tests 5 passed (5)` / `Start at 00:59:57` / `Duration 1.04s (...)` |
| `npm run build` | pass | `computing gzip size...` / `dist/index.html 0.78 kB` / `dist/assets/index-C2DkzBMd.css 0.39 kB` / `dist/assets/index-BvcUGXnn.js 2.66 kB` / `✓ built in 147ms` |
| `npm run check` | pass | `tree clean: true` / `contract: (none)` / `outcome: PASS (5831ms)` / `evidence: .../check-evidence.json` / `logs: .../check-logs` |

The working tree stayed clean after the checks, so the check outputs are gitignored.

## 3. Environment variables (names only)

```
AI_AGENT ANTHROPIC_BASE_URL AWS_ACCESS_KEY_ID AWS_CA_BUNDLE AWS_SECRET_ACCESS_KEY
BUN_FEATURE_FLAG_DISABLE_STANDALONE_MADVISE BUN_INSTALL BUN_OPTIONS CARGO_HTTP_CAINFO
CCR_AGENT_PROXY_CA_WATCH_ENABLED CCR_AGENT_PROXY_ENABLED CCR_AUTO_MODE_USER_ENV_KEYS_FACT
CCR_EGRESS_GATEWAY_ENABLED CCR_ENABLE_TRACING CCR_OTLP_METRICS_INTERVAL_S CCR_PRELOAD_CLAUDE
CCR_SESSION_PROFILE CCR_SPAWN_TIMESTAMP_MS CCR_TEST_GITPROXY CCR_UPSTREAM_PROXY_ENABLED
CLAUDECODE CLAUDE_ADDITIONAL_DIRECTORIES CLAUDE_AFTER_LAST_COMPACT CLAUDE_AUTOCOMPACT_PCT_OVERRIDE
CLAUDE_AUTO_BACKGROUND_TASKS CLAUDE_CODE_ACCOUNT_UUID CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD
CLAUDE_CODE_ARTIFACT_ASSETS CLAUDE_CODE_ARTIFACT_DB CLAUDE_CODE_ARTIFACT_MULTI_FILE
CLAUDE_CODE_ARTIFACT_TYPES CLAUDE_CODE_ARTIFACT_TYPE_CATALOG CLAUDE_CODE_ARTIFACT_TYPE_CLOUD_CREATE
CLAUDE_CODE_BG_TASKS_REPORT_RUNNING CLAUDE_CODE_CHILD_SESSION CLAUDE_CODE_CONTAINER_ID
CLAUDE_CODE_DEBUG CLAUDE_CODE_DIAGNOSTICS_FILE CLAUDE_CODE_DISABLE_BACKGROUND_TASKS
CLAUDE_CODE_DISABLE_BUILTIN_ANTMCP CLAUDE_CODE_DISABLE_TERMINAL_TITLE CLAUDE_CODE_ENTRYPOINT
CLAUDE_CODE_ENVIRONMENT_RUNNER_VERSION CLAUDE_CODE_EXECPATH CLAUDE_CODE_GZIP_REQUEST_BODIES
CLAUDE_CODE_HOLD_UNANSWERED_PARKED_PERMISSION CLAUDE_CODE_INCLUDE_PARTIAL_MESSAGES
CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH
CLAUDE_CODE_MESSAGING_SOCKET CLAUDE_CODE_MESSAGING_TOKEN CLAUDE_CODE_MODEL_CAPABILITIES
CLAUDE_CODE_ORGANIZATION_UUID CLAUDE_CODE_POST_FOR_SESSION_INGRESS_V2
CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST CLAUDE_CODE_PROXY_RESOLVES_HOSTS CLAUDE_CODE_REMOTE
CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE CLAUDE_CODE_REMOTE_HERMETIC_MODE CLAUDE_CODE_REMOTE_SDK_URL
CLAUDE_CODE_REMOTE_SEND_KEEPALIVES CLAUDE_CODE_REMOTE_SESSION_ID CLAUDE_CODE_REMOTE_TOOLS_FORWARD
CLAUDE_CODE_SESSION_ATTENDED CLAUDE_CODE_SESSION_ID CLAUDE_CODE_SYNC_PLUGINS
CLAUDE_CODE_SYNC_SESSION_REFS CLAUDE_CODE_SYNC_SKILLS CLAUDE_CODE_TEE_SDK_STDOUT
CLAUDE_CODE_USER_EMAIL CLAUDE_CODE_USE_CCR_V2 CLAUDE_CODE_VERSION CLAUDE_CODE_WORKER_EPOCH
CLAUDE_EFFORT CLAUDE_ENABLE_STREAM_WATCHDOG CLAUDE_PID CLAUDE_SESSION_INGRESS_TOKEN_FILE
CLOUDSDK_AUTH_ACCESS_TOKEN CLOUDSDK_CORE_CUSTOM_CA_CERTS_FILE CLOUDSDK_PROXY_ADDRESS
CLOUDSDK_PROXY_PORT CLOUDSDK_PROXY_TYPE COREPACK_ENABLE_AUTO_PIN CURL_CA_BUNDLE DEBIAN_FRONTEND
DENO_CERT DENO_TLS_CA_STORE DISABLE_AUTOUPDATER DOCKER_HTTPS_PROXY DOCUMENTS_MCP_SCRATCH_ROOT
ELECTRON_GET_USE_PROXY ENVRUNNER_SKIP_ACK ENV_MANAGER_ENABLE_DIAG_LOGS FACTORY_SETUP_GATE FSSPEC_GCS
GCM_INTERACTIVE GH_NO_UPDATE_NOTIFIER GH_TOKEN GITHUB_TOKEN GIT_ASKPASS GIT_CONFIG_COUNT
GIT_CONFIG_KEY_0 GIT_CONFIG_KEY_1 GIT_CONFIG_KEY_2 GIT_CONFIG_VALUE_0 GIT_CONFIG_VALUE_1
GIT_CONFIG_VALUE_2 GIT_EDITOR GIT_SSL_CAINFO GIT_TERMINAL_PROMPT GLOBAL_AGENT_HTTPS_PROXY
GLOBAL_AGENT_NO_PROXY GRPC_DEFAULT_SSL_ROOTS_FILE_PATH HEX_CACERTS_PATH HOME HTTPLIB2_CA_CERTS
HTTPS_PROXY IS_SANDBOX JAVA_HOME JAVA_TOOL_OPTIONS MATPLOTLIBRC MAX_THINKING_TOKENS
MCP_CONNECTION_NONBLOCKING MCP_TOOL_TIMEOUT NIX_PROFILES NIX_SSL_CERT_FILE NODE_EXTRA_CA_CERTS
NODE_OPTIONS NODE_PATH NO_PROXY NPM_CONFIG_USERCONFIG NoDefaultCurrentDirectoryInExePath OLDPWD
PATH PIP_CERT PIP_CONFIG_FILE PLAYWRIGHT_BROWSERS_PATH PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD PWD
PYTHONUNBUFFERED RBENV_ROOT REQUESTS_CA_BUNDLE RUSTUP_HOME RUST_BACKTRACE SBX_TELEMETRY_SOCKET
SESSION_INGRESS_URL SHELL SHLVL SKIP_PLUGIN_MARKETPLACE SSL_CERT_FILE TERM TRACEPARENT
USE_BUILTIN_RIPGREP USE_SHTTP_MCP UV_NATIVE_TLS XDG_DATA_DIRS YARN_HTTPS_PROXY
YARN_NETWORK_CONCURRENCY _ __ETC_PROFILE_NIX_SOURCED https_proxy no_proxy npm_config_https_proxy
npm_config_noproxy
```

- `GH_TOKEN=proxy-injected`
- `GITHUB_TOKEN=proxy-injected`
- Secret-pattern count: **0**. The variable-name listing was not needed.
- Note: names that look like credentials exist (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CLOUDSDK_AUTH_ACCESS_TOKEN`, `CLAUDE_CODE_MESSAGING_TOKEN`, `GIT_CONFIG_VALUE_*`). None of their values matched the secret patterns, including `AKIA...`. Their values were not printed or inspected.

## 4. Network

| Target | Result |
|---|---|
| `https://registry.npmjs.org/vitest` | `200` |
| `https://pypi.org/simple/` | `curl: (6) Could not resolve host: pypi.org` (code `000`) |
| `https://example.com/` | `curl: (56) CONNECT tunnel failed, response 403` (code `000`) |
| `https://www.npmjs.com/` | `curl: (56) CONNECT tunnel failed, response 403` (code `000`) |
| `https://raw.githubusercontent.com/rNavarrete/factory-pilot-demo/main/README.md` | `curl: (56) CONNECT tunnel failed, response 403` (code `000`) |
| `https://api.github.com/repos/rNavarrete/factory-pilot-demo` | `200` |
| `https://api.anthropic.com/` | `404` (reachable; 404 is the API root's response) |
| `npm view vitest version` | `5.0.3` |
| `git ls-remote origin HEAD` | `7d883133ec2676fb5dde9168e79deeb0acbe6788	HEAD` |

pypi.org is blocked differently from the other hosts. It fails at DNS resolution (`Could not resolve host`), while example.com, www.npmjs.com and raw.githubusercontent.com get a proxy 403. Either way the host is blocked.

## 5. Configuration that loaded

- `~/.claude` (= `/root/.claude`) contains `.last-cleanup`, `backups/` (empty), `environment-manager/` (`code-sign`, `codesign-mcp-config.json`), `launcher-settings.json`, `plugins/`, `projects/`, `session-env/`, `sessions/`, `shell-snapshots/`, `skills/`, `stop-hook-git-check.sh`, `stop-hook-reply-gate.py` and `user-prompt-submit-reply-reminder.py`.
- `~/.claude/plugins` contains only `synced/191ff149-..._4d228548-.../`, which is **empty**.
- `~/.claude/skills` contains `session-start-hook/SKILL.md` and `synced/191ff149-..._4d228548-.../`.
- There is no `settings.json` in `~/.claude`. Platform launcher hooks are present: the stop-hook scripts and the user-prompt-submit reminder.

Available in this session:

- **MCP servers / connectors:** `github` (GitHub MCP; scope `rnavarrete/factory-pilot-demo`), `claude-code-remote` (session, trigger and repo management), `Claude_Docs` (docs connector).
- **Plugins:** none installed. The synced plugin directory is empty.
- **Skills:** `session-start-hook`, `dataviz`, `artifact-design`, `artifact-diagramming`, `artifact-capabilities`, `update-config`, `keybindings-help`, `code-review`, `simplify`, `fewer-permission-prompts`, `loop`, `claude-api`, `run`, `plugin-authoring`, `init`, `security-review`, `anthropic-skills:built-in-browser`, `anthropic-skills:chrome-browser`, `anthropic-skills:computer-use`, `anthropic-skills:docs`, `anthropic-skills:docx`, `anthropic-skills:google-workspace`, `anthropic-skills:pdf`, `anthropic-skills:pptx`, `anthropic-skills:xlsx`.

## 6. Repository settings

- `.claude/settings.json` exists. It defines a `SessionStart` hook (`node scripts/session-setup.mjs --hook`, timeout 300) and a `PreToolUse` hook (`node scripts/session-setup.mjs --gate`, timeout 15) matching `Bash|Monitor|PowerShell|Edit|Write|MultiEdit|NotebookEdit|Agent|Task|mcp__.*`.
- **SessionStart is active.** `setup-status.json` was written for this session ID, and the hook's summary was injected into the session context.
- **PreToolUse is active.** With `enforce: true` and `status: ok`, the gate allowed every Bash command in this check. The session context also reported "Setup guard: on". This check did not run a blocked case, so it has no direct proof that the gate *denies* calls.
- **One repository** is in the session: `rNavarrete/factory-pilot-demo`, the only source in session context, and `/home/user` holds only `factory-pilot-demo`.

## 7. Session

- URL: https://claude.ai/code/session_01PxBQZsiNtPBZQhih8BMBZt
- `date -u`: `2026-10-08T01:00:22Z`

## Summary

| Step | Expected | Observed |
|---|---|---|
| 1. Setup hook ran this session | `sessionId` = this session | Match (`0b42536f-...`), status ok |
| 1. Guard | `enforce: true` | `enforce: true`, `FACTORY_SETUP_GATE=enforce` |
| 1. Node | v22 | v22.22.0 |
| 1. HEAD / remote | main @ origin | `7d88313`, origin = rNavarrete/factory-pilot-demo |
| 2. typecheck | pass | pass |
| 2. test | pass | pass (5/5) |
| 2. build | pass | pass |
| 2. check | pass | PASS, tree clean |
| 3. GH_TOKEN / GITHUB_TOKEN | unset or `proxy-injected` | `proxy-injected` / `proxy-injected` |
| 3. Secret-pattern count | 0 | 0 |
| 4. registry.npmjs.org | 200 | 200 |
| 4. pypi.org | blocked | blocked (DNS: could not resolve host) |
| 4. example.com | blocked | blocked (proxy 403) |
| 4. www.npmjs.com | blocked | blocked (proxy 403) |
| 4. raw.githubusercontent.com | record | blocked (proxy 403) |
| 4. api.github.com | record | 200 |
| 4. api.anthropic.com | record | 404 (reachable) |
| 4. npm view vitest | works | 5.0.3 |
| 4. git ls-remote | works | `7d88313… HEAD` |
| 5. User plugins / user MCP | none load | No plugins; MCP = github, claude-code-remote, Claude_Docs (platform-provided) |
| 6. `.claude/settings.json` hooks | active | SessionStart and PreToolUse active |
| 6. Repositories | one | one |
| 7. Session URL | recorded | session_01PxBQZsiNtPBZQhih8BMBZt |
