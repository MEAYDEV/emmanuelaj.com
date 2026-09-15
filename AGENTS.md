# AGENTS.md

## Cursor Cloud specific instructions

This repo is a fully static personal website (plain HTML/CSS/JS). There is no
build step, no package manager, no dependencies, no linter, and no automated
tests. See `README.md` for the canonical file overview and run instructions.

Key files: `index.html` (content), `styles.css` (design/themes), `script.js`
(theme/nav, scroll reveal, and the Beats audio player), and `beats/` (audio
files consumed by the player).

### Running

Serve the folder over HTTP from the repo root, e.g.:

- `python3 -m http.server 3000` (no network needed), or
- `npx serve .` (as documented in `README.md`).

Do NOT test via `file://` — the Beats player fetches audio from `beats/...`
relative URLs, so it must be served over HTTP for the audio and metadata
(durations) to load.

### Lint / test / build

None exist. There is nothing to lint, test, or build; "running" just means
serving the static files and opening the page in a browser.
