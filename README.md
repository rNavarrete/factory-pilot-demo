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

## Checks and release

- **CI** (`.github/workflows/ci.yml`) runs typecheck, tests and build on every
  pull request and on main.
- **Release** (`.github/workflows/release.yml`) deploys `dist/` to GitHub Pages.
  It only runs when started by hand, and the `github-pages` environment needs
  Rolando's approval before it deploys. Merging never deploys.
