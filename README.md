# TÖLVA

Learn Icelandic from the oracle in the machine.

TÖLVA is a free, static, grammar-first website for learning Icelandic: a unit path, many exercise types, case and ending practice, audio, spaced repetition, and Norwegian Bokmål as a first-class base language next to English. It is plain HTML, CSS and JavaScript modules with no build step, so it can be served from GitHub Pages.

**Status:** Phase 3. Units 1 and 2 are complete and playable; units 3 to 9 are generated previews. Audio and stories (Phase 4) and streaks, offline use and progress export (Phase 5) come next. See [docs/DECISIONS.md](docs/DECISIONS.md) for what was decided and why, and [docs/api-report.md](docs/api-report.md) for the data-source probe.

## Run it

The site needs only a static file server, because pages load JSON with `fetch`:

```sh
npm run serve            # node scripts/serve.mjs 8080, then open http://localhost:8080/
# or
python3 -m http.server 8080
```

Pages: `index.html` (landing), `learn.html`, `lesson.html` (`?unit=hello&lesson=2`, or `?mode=review`, `mistakes`, `letters` or `placement`), `guide.html?unit=hello`, `practice.html`, `declension.html?lemma=kaffi` (case trainer), `stories.html`, `dictionary.html`, `profile.html`, `settings.html`, `credits.html`, `styleguide.html`.

## Requirements for the scripts

- Node.js 20 or newer. The site itself needs no Node.
- `npm install` once, then `npx playwright install chromium` for the visual QA.
- `bzip2` on the PATH to read Tatoeba exports (included with macOS, Linux and Git for Windows; on Windows, run the scripts from Git Bash).
- Python 3.11 or newer for GreynirCorrect: `python -m venv .venv`, then `.venv/Scripts/pip install reynir-correct` (macOS/Linux: `.venv/bin/pip`) and `.venv/Scripts/python -m icegrams.download` (about 200 MB, stored in your user profile).

## Commands

| Command | What it does |
|---|---|
| `npm test` | Unit tests (`node --test`): grading, spaced repetition, the course model, and the exercise generator against the real data. |
| `npm run smoke` | Playwright plays every lesson of units 1 and 2 and checks that progress is saved. |
| `npm run validate` | Checks every Icelandic word in the content against the DMII Core, and hand-written sentences with GreynirCorrect. |
| `npm run build:data` | Rebuilds `/data` (needs `npm run probe:coverage` first for the bulk files, and GreynirCorrect in `.venv`). |
| `npm run check` | Contrast check, UI string check (English and Norwegian), content validation, unit tests. |
| `npm run qa` | Playwright visual QA: screenshots of every screen and state at 390x844, 768x1024 and 1440x900 into `screenshots/`, axe accessibility checks, and a no-horizontal-scroll test at 320 px. |
| `npm run probe` | Probes every external API and dataset and rewrites `docs/api-report.md`. |
| `npm run probe:coverage` | Also downloads the bulk datasets into `.cache/` (about 150 MB) and measures coverage. |
| `npm run build:tala` | Writes the mascot SVG files in `assets/tala/` from `js/tala.js`. |

To keep the download cache outside the repository (for example when the repo is in a synced folder), set `TOLVA_CACHE`, for example `TOLVA_CACHE=~/tolva-cache npm run probe:coverage`.

## Project layout

```
*.html            one file per screen; all paths are relative (GitHub Pages serves a sub-path)
css/              tokens.css, base.css (reference design, then extensions), components.css, layout.css
js/               app.js (bootstrap), shell.js, i18n.js + i18n/{en,nb}.json, store.js, lexicon.js,
                  normalize.js, audio.js, sfx.js, tala.js (mascot), ui/, pages/ (one module per screen)
assets/           icons.svg (sprite), tala/ (mascot SVGs)
content/          brand.json, case-rules.json, demo/ (Phase 1 lesson and path), NEEDS-NATIVE-REVIEW.md
data/             generated data (CC BY-SA 4.0; see data/LICENSE.md); demo/lexicon.json for Phase 1
scripts/          probe, data builders, checks, dev server, visual QA
tests/            node --test unit tests
docs/             api-report.md, DECISIONS.md
```

## Deploying to GitHub Pages

The site is static and uses only relative paths, and `.nojekyll` is present. In the repository settings, enable Pages and choose "Deploy from a branch", branch `main`, folder `/ (root)`. A GitHub Actions workflow is an option for later.

## License

Code: MIT, see [LICENSE](LICENSE). Generated data in `/data`: CC BY-SA 4.0 and others, see [data/LICENSE.md](data/LICENSE.md).
