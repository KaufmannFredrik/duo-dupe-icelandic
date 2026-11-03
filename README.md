# TÖLVA

Learn Icelandic from the oracle in the machine.

TÖLVA is a free, static, grammar-first website for learning Icelandic: a unit path, many exercise types, case and ending practice, audio, spaced repetition, and Norwegian Bokmål as a first-class base language next to English. It is plain HTML, CSS and JavaScript modules with no build step, so it can be served from GitHub Pages.

**Status:** Phase 1 (design system and responsive shell) with demo content. See [docs/DECISIONS.md](docs/DECISIONS.md) for what was decided and why, and [docs/api-report.md](docs/api-report.md) for the data-source probe.

## Run it

The site needs only a static file server, because pages load JSON with `fetch`:

```sh
npm run serve            # node scripts/serve.mjs 8080, then open http://localhost:8080/
# or
python3 -m http.server 8080
```

Pages: `index.html` (landing), `learn.html`, `lesson.html` (demo lesson; `?step=1` to `6` jumps to an exercise), `practice.html`, `declension.html?lemma=hestur`, `stories.html`, `dictionary.html`, `profile.html`, `settings.html`, `credits.html`, `styleguide.html`.

## Requirements for the scripts

- Node.js 20 or newer. The site itself needs no Node.
- `npm install` once, then `npx playwright install chromium` for the visual QA.
- `bzip2` on the PATH to read Tatoeba exports (included with macOS, Linux and Git for Windows; on Windows, run the scripts from Git Bash).
- Python 3.11 or newer later, for GreynirCorrect content checks.

## Commands

| Command | What it does |
|---|---|
| `npm test` | Unit tests (`node --test`): answer normalization and grading. |
| `npm run check` | Contrast check of the design tokens, UI string check (English and Norwegian), unit tests. |
| `npm run qa` | Playwright visual QA: screenshots of every screen and state at 390x844, 768x1024 and 1440x900 into `screenshots/`, axe accessibility checks, and a no-horizontal-scroll test at 320 px. |
| `npm run probe` | Probes every external API and dataset and rewrites `docs/api-report.md`. |
| `npm run probe:coverage` | Also downloads the bulk datasets into `.cache/` (about 150 MB) and measures coverage. |
| `npm run build:demo` | Rebuilds `data/demo/lexicon.json` from the DMII Core API and the cached Wiktionary and Tatoeba files. Needs `probe:coverage` first, plus `.cache/tatoeba/eng_sentences.tsv.bz2` from `https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2`. |
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
