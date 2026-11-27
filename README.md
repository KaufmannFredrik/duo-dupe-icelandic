# TÖLVA

Learn Icelandic from the oracle in the machine.

TÖLVA is a free, static, grammar-first website for learning Icelandic: a unit path, many exercise types, case and ending practice, audio, spaced repetition, and Norwegian Bokmål as a first-class base language next to English. It is plain HTML, CSS and JavaScript modules with no build step, so it can be served from GitHub Pages.

**Status:** All planned phases are built, and all twenty units are hand-made: each has lessons grouped by hand and a guidebook. Section A1 of the plan from zero to A2 has begun (units 2, *Um mig*, 5, *Tölur*, 8, *Dagurinn minn*, a day from waking up to bedtime, 10, *Matur*, food and cooking, 11, *Heima*, the home, 12, *Föt og fólk*, clothes, looks and feelings, 14, *Líkaminn*, the body, feeling ill and the doctor, 15, *Frítími*, free time, sport and music, 17, *Þjónusta*, the post office, the bank and travel, and 18, *Í gær*, telling what happened, are its new units, 7, *Tími*, has new lessons on the months and 16, *Nám og vinna*, on jobs, shifts and calling in sick; *Tölur* brings numbers by ear: hearing numbers and phone numbers, writing them in digits and building them in words; the *Gata* and *Nám og vinna* reviews end with guided writing, a short text about yourself with gaps graded by what may go in them), and a bonus unit (new words, old roots) shows how Icelandic builds words for modern things. Every hand-written language claim is checked against a published source and listed in `content/CLAIMS.md`. Where Tatoeba has too few sentences for a topic (foods, for one), a few sentences are made from a Tatoeba sentence by replacing one word (`content/sentences-made.json`); the app credits the original and says so. Every sentence has a Norwegian Bokmål translation (most written by hand for TÖLVA, every word checked against Bokmålsordboka). Every word and sentence has audio (human recordings where they exist, otherwise one of four generated voices, which the learner chooses), there are twenty stories (one after each unit) and a minimal-pairs drill, every sentence is tagged with the Greynir parser so that exercises never mistake one word for another with the same spelling and name the case a word really has in its sentence, and XP, streaks with streak freezes, a daily goal, badges, combo bonuses, daily quests, optional hearts, progress export and import, and offline use (installable web app) all work. A cast of seven animated characters hosts the units (each greets the learner with a Tatoeba sentence), speaks in the dialogue stories and cheers in the lessons; finishing a unit a character hosts makes them a friend on the Profile. Speaking practice with the browser's speech recognition is available as an experimental, opt-in setting. The Norwegian bridge (`bridge.html`) links 330 course words to their Bokmål relatives, 279 of them through a shared Old Norse word named by both Bokmålsordboka and Wiktionary. See [docs/PLAN.md](docs/PLAN.md) for the plan from zero to A2 (one path with an A1 and an A2 section, letters and sounds beside it), [docs/DECISIONS.md](docs/DECISIONS.md) for what was decided and why, and [docs/api-report.md](docs/api-report.md) for the data-source probe.

## Run it

The site needs only a static file server, because pages load JSON with `fetch`:

```sh
npm run serve            # node scripts/serve.mjs 8080, then open http://127.0.0.1:8080/
# or
python3 -m http.server 8080
```

Pages: `index.html` (landing), `learn.html`, `lesson.html` (`?unit=hello&lesson=2`, or `?mode=review`, `mistakes`, `letters`, `sounds`, `speak`, `bridge` or `placement`), `guide.html?unit=hello`, `practice.html`, `declension.html?lemma=kaffi` (case trainer), `stories.html` (`?story=cafe` opens the reader), `dictionary.html`, `profile.html`, `settings.html`, `voices.html`, `music.html` (Music lab), `bridge.html`, `credits.html`, `styleguide.html`.

## Requirements for the scripts

- Node.js 20 or newer. The site itself needs no Node.
- `npm install` once, then `npx playwright install chromium` for the visual QA.
- `bzip2` on the PATH to read Tatoeba exports (included with macOS, Linux and Git for Windows; on Windows, run the scripts from Git Bash).
- Python 3.11 or newer for GreynirCorrect: `python -m venv .venv`, then `.venv/Scripts/pip install reynir-correct` (macOS/Linux: `.venv/bin/pip`) and `.venv/Scripts/python -m icegrams.download` (about 200 MB, stored in your user profile).
- For the audio only: `.venv/Scripts/pip install piper-tts lameenc`. The voice models (about 75 MB each) download into `.cache/piper/` on first use.

## Commands

| Command | What it does |
|---|---|
| `npm test` | Unit tests (`node --test`): grading, spaced repetition, the course model, the exercise generator against the real data, and the music theory of the menu music. |
| `npm run smoke` | Playwright plays every lesson of the hand-made units and the sounds and letters drills, checks that progress and XP (with combo bonuses) are saved, that the unit host closes a lesson, that a lesson counts toward the daily quests, that export, reset and import round-trip, that hearts end a lesson, that the site loads offline, plays a speaking round with a stand-in recognizer, plays a host's greeting in the chosen voice, opens a story (word panel, line audio, the dialogue's cast) and checks that all seven characters become friends. |
| `npm run validate` | Checks every Icelandic word in the content against the DMII Core, and hand-written sentences with GreynirCorrect. |
| `npm run build:data` | Rebuilds `/data` (needs `npm run probe:coverage` first for the bulk files, and GreynirCorrect in `.venv`). |
| `npm run check` | Contrast check, UI string check (English and Norwegian), content validation, sentence tags up to date, service worker up to date, unit tests. |
| `npm run pick-words` | Helps choose a new unit's words (`scripts/pick-words.py`, in `.venv`): for the words given (`npm run pick-words -- janúar sturta`), or the words that would open up the most sentences (`-- --top 40`; `--max-words 14` for A2), how common each is in the Icelandic Gigaword Corpus and how many Tatoeba sentences it brings. |
| `npm run hooks` | Turns on the pre-push check in this clone (`git config core.hooksPath .githooks`): every `git push` runs `npm run check` first and stops if it fails (`git push --no-verify` skips it once). |
| `npm run qa` | Playwright visual QA: screenshots of every screen and state at 390x844, 768x1024 and 1440x900 into `screenshots/`, axe accessibility checks, and a no-horizontal-scroll test at 320 px. |
| `npm run probe` | Probes every external API and dataset and rewrites `docs/api-report.md`. |
| `npm run probe:coverage` | Also downloads the bulk datasets into `.cache/` (about 150 MB) and measures coverage. |
| `npm run build:audio` | Generates the MP3 files for every course word, minimal-pair word, sentence, letter name and number the number exercises say (`data/numbers.json`, written by `node scripts/build-numbers.mjs` from `js/engine/numbers.js`) with one Piper voice (`--voice steinn`, the default, or `salka`, `bui`, `ugla`; run it once per voice, since the learner can choose any of the four). Existing files are kept and unused ones removed (`scripts/build-audio.py`). `--samples` rebuilds the comparison set on the Voices page. |
| `npm run build:bridge` | Rebuilds `data/bridge.json`, the Norwegian relatives, from Bokmålsordboka (ord.uib.no, cached in `.cache/ordbokene/`) and the Wiktionary etymologies in `data/lexicon.json`. |
| `npm run build:tags` | Rewrites `data/tags.json`: which course word each word of each sentence is, and its case, from the Greynir parser (`scripts/tag-icelandic.py`, in `.venv`; cached in `.cache/greynir/`) with the corrections in `content/tag-fixes.json`. Run it after `npm run build:data`. |
| `npm run build:translations` | Writes the hand-made Bokmål into `/data`: sentence translations (`content/translations-nb.json`) into `data/sentences.json` where Tatoeba has none, word glosses (`content/glosses-nb.json`) into `data/lexicon.json` where Wiktionary has none (`glosses`) or a wrong one (`fixes`, which keep Wiktionary's list as `nbWas`). `npm run validate` checks every word of every Bokmål gloss the app shows, and of the translations, against Bokmålsordboka. |
| `npm run build:writing` | Writes `data/writing.json`, the guided-writing tasks of `content/writing.json` with the forms each gap accepts, from the DMII Core (course words from `data/forms`, places and languages from its API), after checking every model, filled in, with GreynirCorrect. `npm run check` fails when it is out of date. |
| `npm run build:sw` | Rewrites `sw.js` (the service worker) with the list of files to precache (all but the cast's pictures and the voice manifests other than Steinn's, which are cached when first used) and a version hashed from their contents. Run it after changing any page, script, style or data file; `npm run check` fails while `sw.js` is out of date. |
| `npm run build:icons` | Renders the app icons in `assets/icons/` from the mascot, with Playwright. |
| `npm run build:tala` | Writes the mascot SVG files in `assets/tala/` from `js/tala.js`. |
| `npm run build:characters` | Writes the cast in `assets/characters/` from `scripts/characters/*.mjs`: four expressions per character, animated, and a still copy of each for Calm mode. Who hosts which unit is in the unit files (`"host"`), who speaks in a dialogue in the story files (`"cast"`). |

**Service worker during development.** The site registers `sw.js`, which serves files from its cache. After editing, run `npm run build:sw` and reload twice (or accept the "new version" prompt), or tick "Update on reload" in the browser's developer tools.

To keep the download cache outside the repository (for example when the repo is in a synced folder), set `TOLVA_CACHE`, for example `TOLVA_CACHE=~/tolva-cache npm run probe:coverage`.

## Project layout

```
*.html            one file per screen; all paths are relative (GitHub Pages serves a sub-path)
sw.js             service worker (generated by scripts/build-sw.mjs); manifest.webmanifest
css/              tokens.css, base.css (reference design, then extensions), components.css, layout.css
js/               app.js (bootstrap), shell.js, i18n.js + i18n/{en,nb}.json, store.js, data.js, grammar.js,
                  course.js, progress.js, stats.js, srs.js, db.js, offline.js, normalize.js, audio.js,
                  sfx.js, tala.js (mascot), characters.js (the cast, hosts and friends),
                  engine/ (course model, lesson generator), exercises/ (one module per type), ui/, pages/
                  music/ (generated menu music: theory, composer, moods, Web Audio synthesizer, player)
assets/           icons.svg (sprite), tala/ (mascot SVGs), characters/ (the cast, built by npm run build:characters), icons/ (app icons)
content/          brand.json, vocab/, units/, stories/, case-rules.json, minimal-pairs.json, allowlist.json,
                  sentence-exclude.json (Tatoeba sentences never shown), tag-fixes.json (hand corrections of the parser),
                  sentences-made.json (sentences made from a Tatoeba sentence by replacing one word),
                  translations-nb.json and glosses-nb.json (Bokmål written for TÖLVA),
                  CLAIMS.md (every hand-written language claim and its source)
data/             generated data (CC BY-SA 4.0; see data/LICENSE.md); tags.json (sentence word tags and cases); audio/ (generated voice, CC BY 4.0)
scripts/          probe, data builders, checks, dev server, visual QA
tests/            node --test unit tests, smoke.mjs (Playwright)
docs/             PLAN.md (zero to A2), api-report.md, DECISIONS.md
```

## Deploying to GitHub Pages

The site is static and uses only relative paths, and `.nojekyll` is present. In the repository settings, enable Pages and choose "Deploy from a branch", branch `main`, folder `/ (root)`. A GitHub Actions workflow is an option for later.

## License

Code: MIT, see [LICENSE](LICENSE). Generated data in `/data`: CC BY-SA 4.0 and others, see [data/LICENSE.md](data/LICENSE.md).
