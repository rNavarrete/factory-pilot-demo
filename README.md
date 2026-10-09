# Reading List (factory pilot demo)

A deliberately small web app used as the pilot repository for the
Software Factory v1 pilot (Linear ENG-137). Tasks live in the Linear
project "Factory Pilot Demo".

- Add books, change their status (to-read, reading, done), delete them.
- Data is kept in the browser's localStorage.

## Develop

```bash
npm ci
npm run dev        # local server
npm test           # Vitest unit tests
npm run typecheck
npm run build      # static site in dist/
```

To run one test file, pass its path to `npm test`:

```bash
npm test -- tests/books.test.ts
```

Cloud sessions set themselves up automatically; see [docs/setup.md](docs/setup.md).

## Before you push

Run the one check command:

```bash
npm run check
```

It checks format, lint, typecheck, tests and build, and passes only when all of
them pass on a clean git tree. See [docs/checks.md](docs/checks.md) for details.

## Checks and release

- **CI** (`.github/workflows/ci.yml`) runs typecheck, tests and build on every
  pull request and on main.
- **Release** (`.github/workflows/release.yml`) publishes `dist/` to the separate
  site repo `rNavarrete/factory-pilot-demo-site`, served at
  https://rnavarrete.github.io/factory-pilot-demo-site/. It only runs when started
  by hand, and the `release` environment needs Rolando's approval before it
  publishes. Only that environment holds the key to the site repo. Merging never
  deploys.
