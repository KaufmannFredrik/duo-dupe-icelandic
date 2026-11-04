# TÖLVA

Learn Icelandic from the oracle in the machine.

TÖLVA is a free, static, grammar-first website for learning Icelandic: a unit path, many exercise types, case and ending practice, audio, spaced repetition, and Norwegian Bokmål as a first-class base language next to English. It is plain HTML, CSS and JavaScript modules with no build step, so it can be served from GitHub Pages.

**Status:** All planned phases are built, and the preview units are now being made by hand. Units 1 to 3 are complete, with hand-grouped lessons and a guidebook; units 4 to 10 are generated previews, and unit 10 (new words, old roots) has a guidebook on how Icelandic builds words for modern things. Every word and sentence has audio (human recordings where they exist, otherwise a generated voice), there are five stories and a minimal-pairs drill, every sentence is tagged with the Greynir parser so that exercises never mistake one word for another with the same spelling, and XP, streaks with streak freezes, a daily goal, badges, optional hearts, progress export and import, and offline use (installable web app) all work. Speaking practice with the browser's speech recognition is available as an experimental, opt-in setting. The Norwegian bridge (`bridge.html`) links 169 course words to their Bokmål relatives, 156 of them through a shared Old Norse word named by both Bokmålsordboka and Wiktionary. See [docs/DECISIONS.md](docs/DECISIONS.md) for what was decided and why, and [docs/api-report.md](docs/api-report.md) for the data-source probe.

## Run it

The site needs only a static file server, because pages load JSON with `fetch`:

```sh
npm run serve            # node scripts/serve.mjs 8080, then open http://localhost:8080/
# or
python3 -m http.server 8080
```

Pages: `index.html` (landing), `learn.html`, `lesson.html` (`?unit=hello&lesson=2`, or `?mode=review`, `mistakes`, `letters`, `sounds`, `speak`, `bridge` or `placement`), `guide.html?unit=hello`, `practice.html`, `declension.html?lemma=kaffi` (case trainer), `stories.html` (`?story=cafe` opens the reader), `dictionary.html`, `profile.html`, `settings.html`, `voices.html`, `bridge.html`, `credits.html`, `styleguide.html`.

## Requirements for the scripts

- Node.js 20 or newer. The site itself needs no Node.
- `npm install` once, then `npx playwright install chromium` for the visual QA.
- `bzip2` on the PATH to read Tatoeba exports (included with macOS, Linux and Git for Windows; on Windows, run the scripts from Git Bash).
- Python 3.11 or newer for GreynirCorrect: `python -m venv .venv`, then `.venv/Scripts/pip install reynir-correct` (macOS/Linux: `.venv/bin/pip`) and `.venv/Scripts/python -m icegrams.download` (about 200 MB, stored in your user profile).
- For the audio only: `.venv/Scripts/pip install piper-tts lameenc`. The voice models (about 75 MB each) download into `.cache/piper/` on first use.

## Commands

| Command | What it does |
|---|---|
| `npm test` | Unit tests (`node --test`): grading, spaced repetition, the course model, and the exercise generator against the real data. |
| `npm run smoke` | Playwright plays every lesson of the hand-made units and the sounds and letters drills, checks that progress and XP are saved, that export, reset and import round-trip, that hearts end a lesson, that the site loads offline, plays a speaking round with a stand-in recognizer, and opens a story (word panel, line audio). |
| `npm run validate` | Checks every Icelandic word in the content against the DMII Core, and hand-written sentences with GreynirCorrect. |
| `npm run build:data` | Rebuilds `/data` (needs `npm run probe:coverage` first for the bulk files, and GreynirCorrect in `.venv`). |
| `npm run check` | Contrast check, UI string check (English and Norwegian), content validation, sentence tags up to date, service worker up to date, unit tests. |
| `npm run qa` | Playwright visual QA: screenshots of every screen and state at 390x844, 768x1024 and 1440x900 into `screenshots/`, axe accessibility checks, and a no-horizontal-scroll test at 320 px. |
| `npm run probe` | Probes every external API and dataset and rewrites `docs/api-report.md`. |
| `npm run probe:coverage` | Also downloads the bulk datasets into `.cache/` (about 150 MB) and measures coverage. |
| `npm run build:audio` | Generates the MP3 files for every course word, minimal-pair word and sentence with the Piper voice Steinn (`scripts/build-audio.py`; existing files are kept, unused ones removed). `--samples` rebuilds the four-voice comparison set. |
| `npm run build:bridge` | Rebuilds `data/bridge.json`, the Norwegian relatives, from Bokmålsordboka (ord.uib.no, cached in `.cache/ordbokene/`) and the Wiktionary etymologies in `data/lexicon.json`. |
| `npm run build:tags` | Rewrites `data/tags.json`: which course word each word of each sentence is, from the Greynir parser (`scripts/tag-icelandic.py`, in `.venv`; cached in `.cache/greynir/`). Run it after `npm run build:data`. |
| `npm run build:sw` | Rewrites `sw.js` (the service worker) with the list of files to precache and a version hashed from their contents. Run it after changing any page, script, style or data file; `npm run check` fails while `sw.js` is out of date. |
| `npm run build:icons` | Renders the app icons in `assets/icons/` from the mascot, with Playwright. |
| `npm run build:tala` | Writes the mascot SVG files in `assets/tala/` from `js/tala.js`. |

**Service worker during development.** The site registers `sw.js`, which serves files from its cache. After editing, run `npm run build:sw` and reload twice (or accept the "new version" prompt), or tick "Update on reload" in the browser's developer tools.

To keep the download cache outside the repository (for example when the repo is in a synced folder), set `TOLVA_CACHE`, for example `TOLVA_CACHE=~/tolva-cache npm run probe:coverage`.

## Project layout

```
*.html            one file per screen; all paths are relative (GitHub Pages serves a sub-path)
sw.js             service worker (generated by scripts/build-sw.mjs); manifest.webmanifest
css/              tokens.css, base.css (reference design, then extensions), components.css, layout.css
js/               app.js (bootstrap), shell.js, i18n.js + i18n/{en,nb}.json, store.js, data.js, grammar.js,
                  course.js, progress.js, stats.js, srs.js, db.js, offline.js, normalize.js, audio.js,
                  sfx.js, tala.js (mascot),
                  engine/ (course model, lesson generator), exercises/ (one module per type), ui/, pages/
assets/           icons.svg (sprite), tala/ (mascot SVGs), icons/ (app icons)
content/          brand.json, vocab/, units/, stories/, case-rules.json, minimal-pairs.json, allowlist.json,
                  NEEDS-NATIVE-REVIEW.md
data/             generated data (CC BY-SA 4.0; see data/LICENSE.md); tags.json (sentence word tags); audio/ (generated voice, CC BY 4.0)
scripts/          probe, data builders, checks, dev server, visual QA
tests/            node --test unit tests, smoke.mjs (Playwright)
docs/             api-report.md, DECISIONS.md
```

## Deploying to GitHub Pages

The site is static and uses only relative paths, and `.nojekyll` is present. In the repository settings, enable Pages and choose "Deploy from a branch", branch `main`, folder `/ (root)`. A GitHub Actions workflow is an option for later.

## License

Code: MIT, see [LICENSE](LICENSE). Generated data in `/data`: CC BY-SA 4.0 and others, see [data/LICENSE.md](data/LICENSE.md).
