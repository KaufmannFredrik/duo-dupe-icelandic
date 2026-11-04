# Decisions log

What was chosen, why, and what failed. Newest phase first. Evidence for every data-source claim is in [api-report.md](api-report.md), which `scripts/probe-apis.mjs` regenerates.

## Phase 3: engine and grammar core (2026-11-04)

### What was built

- **Course**: nine units in `content/units/` (order in `index.json`). Units 1 (Hello) and 2 (At the café) are complete, with hand-grouped lessons and a guidebook (`guide.html`) whose tables are built from DMII Core paradigms and whose examples are Tatoeba sentences. Units 3 to 9 split their theme words into lessons of six automatically and are marked "Preview". Grammar words may appear in sentences from the start.
- **Exercise engine**: `js/engine/generate.js` (pure, tested in Node) turns a lesson's focus words into twelve exercises. One module per type in `js/exercises/`: choice (read a sentence, pick the translation), meaning, listen (human recordings with credit), word bank, type the word, match pairs, fill in the form, which case, and table cells. Sentences come only from the GreynirCorrect-checked Tatoeba pool; forms only from DMII Core paradigms.
- **Grammar-first choices**: "fill in the form" offers only other forms of the same word with the same number and definiteness, so every wrong option is wrong because of its case. "Which case?" is asked only for forms that belong to exactly one case. Hints name the rule when a preposition from `content/case-rules.json` triggers the case (for example *án kaffis*: "án always takes the genitive"). Across the nine units about a third of the exercises are grammar exercises.
- **Sentence choice**: sentences use only words the learner has met (earlier units, this unit so far, grammar words). Reading exercises (choice, fill in the form, which case) fall back to any course word when there is no such sentence; the translation is shown with them. Sentence building stays strict.
- **Form-level spaced repetition**: `js/srs.js` (Leitner boxes: 1, 2, 4, 8, 16, 32 and 64 days; a miss comes back in ten minutes) over IndexedDB (`js/db.js`, with an in-memory fallback). A card is a word's meaning (`kaffi_no|meaning`) or one form (`bjór_no|ÞFETgr`), so review targets the exact form that is weak.
- **Practice**: replay mistakes, review due cards, the special-letters drill, the placement test (adaptive: one or two questions per unit, stops at the first unit with a miss, offers to mark earlier units as done), and the case trainer: the full table of any course noun, adjective, pronoun, numeral or verb (present and past), with three practice levels that hide a third, two thirds or all cells. Every checked cell counts for spaced repetition.
- **Weak spots heatmap**: computed from the learner's own answers (case by number by gender; a cell needs three answers). The sidebar mini heatmap and the HUD's streak and XP are still demo values until Phase 5.
- **Dictionary and stories** use the real data: search any of the 325 words by any form; the dictionary shows recordings with credit, IPA, English and Norwegian glosses, a table, examples and etymology. The stories page is a sample reading until Phase 4.
- The Phase 1 demo lesson, demo path, demo data and its build script were removed.

### Tests

- `node --test`: 35 tests: answer grading, the SRS scheduler, the course model and lesson states, and, against the real data, that every exercise in every lesson of units 1 and 2 uses only known words, real forms of the right word, distinct options and unambiguous case targets.
- `npm run smoke`: Playwright plays the first lesson at phone and desktop size, answering everything correctly, and checks that progress is saved and the next lesson unlocks; then it plays all 14 lessons of units 1 and 2 (168 exercises, all nine types) and fails on any answer not graded correct.
- `npm run qa`: 0 axe violations, no horizontal scroll at 320 px, no page errors.

### Decisions and fixes

- Wiktionary sometimes lists another sense first (*bjór*: "beaver" before "beer"). Glosses that match the intended meaning are now sorted first.
- Lessons are deterministic per attempt (seed: lesson key plus attempt number): a repeated lesson changes, but screenshots and tests are stable.
- A `?qa` URL flag exposes the current exercise to tests; it changes nothing for learners.
- Node.js LTS is now installed system-wide (`C:\Program Files\nodejs`).

## Phase 2: data pipeline (2026-11-03)

### What was built

- `content/vocab/core.json`: 325 words in nine themes (Hello, At the café, Family, Getting around, Time, Shopping, Weather and nature, Study and work, Grammar words). Each entry names the lemma, its DMII Core word class and the intended English meaning, plus an optional hint where the DMII Core has two words with the same lemma (a gender, or a form the paradigm must contain).
- `scripts/build-data.mjs` writes `data/lexicon.json` (index: glosses in English and Norwegian, IPA, etymology, frequency rank, sentence ids, recording count), `data/forms/<theme>.json` (DMII Core paradigms, unchanged), `data/sentences.json` (Tatoeba sentences with authors and translations), `data/audio.json` (Commons recordings with speaker and license), `data/SOURCES.json` and `docs/data-report.md`. Total 1.05 MB, 194 KB gzipped.
- `scripts/validate-content.mjs` checks every Icelandic token in the content against the DMII Core (generated paradigms first, then a cached API lookup), accepts clitic forms such as *geturðu*, and allows proper nouns only from `content/allowlist.json`. Hand-written sentences go through GreynirCorrect. A deliberately wrong word makes it fail.
- GreynirCorrect runs locally in `.venv` (`reynir-correct` plus the Icegrams model, about 200 MB in the user profile) through `scripts/lint-icelandic.py`, with results cached by sentence text.

### Coverage (from docs/data-report.md)

All 325 words confirmed (318 in the DMII Core, 7 indeclinable numerals in the full BÍN); Wiktionary gloss matches the intended meaning for all with a gloss; Norwegian Bokmål gloss 89%; IPA 97%; human recording 47% (154 words); one or more example sentences 97%, three or more 91%.

### Decisions

- **Theme lists are written by hand and checked by data.** Frequency alone (the Gigaword Corpus is news-heavy: *milljarður*, *ráðherra*) does not make a beginner course. The pipeline checks each word in the DMII Core and against its Wiktionary gloss, and orders words inside a theme by corpus frequency.
- **Tatoeba sentences are linted.** GreynirCorrect flagged 852 of 10,602 candidate sentences (for example *föðurs* for *föður*, missing accents, *bakvið* for *bak við*, *á morgnanna* for *á morgnana*); flagged sentences are never used. Parse failures (E001), exclamation marks (E007) and unknown foreign words (U001) do not exclude a sentence. Some correct sentences are excluded too; there are enough left.
- **Norwegian glosses** come from English Wiktionary translation tables: when an English entry's translation sense lists the Icelandic lemma, the Bokmål words of the same sense are used.
- **Indeclinable numerals** (*fimm* to *tuttugu*) are not numerals in the DMII Core (*fimm*, *sex*, *sjö* exist only as nouns; *níu*, *tíu*, *tuttugu* not at all). They are confirmed in the full BÍN through the Ylhýra API and stored as single-form words, with no invented paradigm.
- **The DMII Core API answers `{"0": ""}` when nothing matches.** Both the pipeline and the validator treat that as "not found"; an earlier version counted it as found, which a negative test caught.
- **Recordings are linked, not copied:** 156 Commons and Lingua Libre files, each with speaker and license (mostly CC BY 4.0 and CC BY-SA 4.0).

### Gaps

Ten words have no usable Tatoeba sentence (for example *kaffihús*, *króna*, *foss*); their exercises use word-level types. *seint* has no Wiktionary entry. Corpus sentences from Korp could fill gaps later, after a per-subcorpus license check.

## Phase 1: design system and responsive shell (2026-11-03)

### What was built

- Design system: `css/tokens.css` and `css/base.css` start with the Retro-Futurism reference CSS exactly as given, then add the section 5.3 tokens and the extensions. `css/components.css` holds every component and state from 5.7; `css/layout.css` holds the shell, the lesson focus mode and the screen layouts.
- Screens: landing, Learn path, demo lesson (six exercise types, three feedback states, quit dialog, completion screen), declension table with practice mode, Stories sample reader with tap-a-word, Dictionary, Practice hub with the weak-spots heatmap, Profile, Settings, Credits, and `styleguide.html`.
- Mascot Tala (`js/tala.js`): a CRT-monitor head with a pixel face, an antenna staff with a glowing tip and a magenta scarf, with five expressions (neutral, happy, wrong, sleepy, thinking). Faces are 16 x 11 ASCII grids in the code, so they are easy to edit. Static copies are in `assets/tala/`.
- One icon sprite (`assets/icons.svg`, 35 line icons, `currentColor`).
- UI in English and Norwegian Bokmål (`js/i18n/en.json`, `nb.json`, 246 keys). `scripts/check-i18n.mjs` fails if a key is missing in either language.
- Settings that already work: Calm mode (auto, on, off), scanlines (page default, low, off), sound effects (8-bit chimes from the Web Audio API, off by default), browser Icelandic voice and speed, strict or easy checking, app language, gloss language.

### Decisions

- **Real data in the demo, no invented Icelandic.** `scripts/build-demo-data.mjs` builds `data/demo/lexicon.json` from the DMII Core API (paradigms of *hestur*, *bók* and *Ísland*, copied verbatim), the cached Wiktionary extract (glosses, IPA, etymology, one human recording) and Tatoeba (14 sentences with author credits). Every sentence in the lesson, stories and dictionary comes from Tatoeba, and every form from BÍN. Distractors in "fill in the form" are the other forms of the same lemma. Hand-written claims (two case rules, three unit-title words, pronunciation notes) are listed in `content/NEEDS-NATIVE-REVIEW.md` and flagged `reviewed: false`.
- **One shell module.** Navigation, HUD, sidebar and footer are rendered by `js/shell.js` into empty landmarks in each page, so there is one source for them. The pages need JavaScript anyway.
- **Lesson on phones has no frame.** The "monitor frame" starts at 900 px; on phones the lesson fills the screen, as in the section 5.5 sketch.
- **Narrow declension tables** (under 640 px of table width) show the case abbreviation tag (NF, ÞF, ÞGF, EF) in its color, with a legend underneath spelling out the names. The full names stay in the accessibility tree. The same applies to the dictionary's mini table under 400 px.
- **Answer checking** (`js/normalize.js`, unit-tested): NFC, case, punctuation and space normalization; missing acute accents are ALMOST in easy mode and wrong in strict mode; ASCII stand-ins for þ, ð, æ and ö are ALMOST in early units. The ALMOST hint names the exact letters the learner missed (for example "ð ≠ d").
- **IPA** uses the reference font stack too; the browser takes the few IPA symbols Courier New lacks (such as ʏ) from a fallback font.
- **Placeholders, labeled as such:** the placement test opens the demo lesson; Guidebook buttons show a "Phase 3" message; streak, XP and heatmap numbers are demo data and carry a "Demo data" tag; export and import are disabled until Phase 5; audio uses the browser's Icelandic voice when there is one and otherwise explains that audio arrives in Phase 4.
- **Screenshots are not committed.** A full set is about 13 MB per run; `npm run qa` regenerates them into `screenshots/` (gitignored).

### QA results

- `scripts/check-contrast.mjs`: all 26 token pairs pass WCAG AA (ratios match the brief's table), and no CSS uses blue or pink as a text color.
- `scripts/visual-qa.mjs`: 24 screens and states at 390x844, 768x1024 and 1440x900; axe (WCAG 2.0, 2.1 and 2.2 A and AA): 0 violations; no horizontal scroll at 320 px on 14 pages; no JavaScript errors.
- `node --test`: 8 of 8 pass.

### Fixed during QA

Overflow at 320 px from one-column CSS grids sizing to unbreakable content (now `minmax(0, 1fr)`), the lesson's action buttons, the declension table, and the voice selector; the horizon geometry (a 10rem floor at `rotateX(60deg)` projects to about 63 px, so the line, the sun and Tala's feet now sit there); a word panel dimmed below AA contrast; a node whose visible "Start" label was missing from its accessible name.

### Not verified

- Font rendering of þ ð æ ö and the accented vowels was checked in Chromium on Windows only. Courier New ships with macOS and iOS; Android has no Courier New and falls back to its monospace font, which covers these letters but should be checked on a device.
- No browser Icelandic voice was available in the test browser, so speech playback is untested.
- The scanline overlay is not part of axe's contrast calculation; it darkens text slightly. Reading screens use the low setting, and Calm mode removes it.

### Tooling note

The winget install of Node.js was still waiting for the Windows administrator prompt at the end of Phase 1, so Phase 1 also ran on the portable Node 26.13.0. Playwright and axe are dev dependencies in `package.json`.

## Phase 0: repository and probe (2026-11-03)

### Repository state

- Cloned `https://github.com/KaufmannFredrik/duo-dupe-icelandic` into the working folder. The remote was **empty** (no commits, no files), so there was nothing to summarize or preserve. The project is scaffolded from scratch on `main`.
- Added: `.gitignore`, `.nojekyll`, `LICENSE` (MIT, code only), `data/LICENSE.md` (data licensing split), `package.json` (ES modules, Node 20+, no dependencies yet), `scripts/probe-apis.mjs`, `docs/api-report.md`, this file, and a short `README.md`.
- Commits are pushed to `origin/main` after each phase (owner decision, see below).

### Tooling

- **Node.js is not installed** on the development machine. Phase 0 ran on the official portable Node 26.13.0 LTS zip (SHA-256 checked against nodejs.org) from a temporary folder, without changing the system. A system-wide Node.js LTS install with winget was started afterwards (see the Phase 1 tooling note).
- The `gh` CLI is not installed. Python 3.11.9 is available, which is enough for GreynirCorrect (needs 3.11+).
- The probe uses only Node built-ins (`fetch`, `zlib`, `readline`). Tatoeba exports are bzip2, so the script calls the `bzip2` binary (ships with macOS, Linux and Git for Windows) instead of adding an npm dependency. A minimal zip reader handles the CLARIN frequency archive.
- The repo lives inside OneDrive. `.cache/` (about 150 MB of downloads, gitignored) would still be synced by OneDrive; set `TOLVA_CACHE` to a folder outside OneDrive to avoid that.

### Data-source decisions

1. **Inflections: the official DMII Core API, not the bulk files and not Ylhýra.**
   - `https://bin.arnastofnun.is/api/` returns full prescriptive paradigms as JSON with `Access-Control-Allow-Origin: *`. The DMII Core is the subset made "especially for use in schools and for learners" and "for third party publication". Licence: CC BY-SA 4.0; may be published on the web free of charge if **unmodified** and credited.
   - Phase 2 caches the paradigm of every course lemma from this API into `/data`. "Unmodified" is honored by storing exactly the forms and tags the API returns (only the JSON wrapper is compacted) and showing every variant it lists. The credits page will say so.
   - The bulk files are rejected for now: they sit behind an email plus reCAPTCHA form, and their licence text conflicts (CC BY-SA 4.0 on two pages, the older "no redistribution, no paradigm publication" terms still on the English Download page). The site itself says the bulk data is not meant for reproducing paradigms.
   - Ylhýra's wrapper works (CORS `*`) but adds nothing the official API lacks; documented as a fallback only.
2. **Glosses, IPA, etymology: Wiktionary via kaikki.org**, the per-language Icelandic file. It is marked deprecated, so Phase 2 pins its SHA-256 in `data/SOURCES.json`; fallback is filtering the 2.9 GB raw dump. IPA covers 92% of the 300 most frequent lemmas; English glosses 99%.
3. **Example sentences: Tatoeba bulk exports.** 13,390 Icelandic sentences, 81% with an English translation, but only 144 with Norwegian Bokmål. Korp (`https://malheildir.arnastofnun.is:1234`) is the backup for lemmas without sentences, with the subcorpus licence checked per sentence.
4. **Vocabulary order: CLARIN-IS "Frequency lists for Icelandic 23.06"** (`giga_simple_freq.tsv`, CC BY 4.0).
5. **Audio chain revised, because two planned sources are empty:**
   - The public **Tiro TTS instance is gone**: every path on `tts.tiro.is` (including `POST /v0/speech` and the preflight) returns 404. `speech.tiro.is` too. `api.grammatek.com` does not resolve.
   - **Tatoeba has no Icelandic audio at all** (0 of 13,390 sentences, cross-checked two ways).
   - Wiktionary has recordings for only 117 entries (3.7% of the top 300 lemmas); Lingua Libre on Commons has 375 Icelandic word recordings.
   - New proposal: (1) human word recordings from Commons and Lingua Libre where they exist; (2) **static audio pre-generated at build time with Piper** and its four Icelandic voices (Búi, Salka, Steinn, Ugla), trained on Talrómur (CC BY 4.0); (3) browser `speechSynthesis` with an `is-IS` voice. Slow speed can be a second Piper render or `playbackRate` with `preservesPitch`; decide in Phase 4 against the 20 MB data budget. Approved by the owner as "the best audio you can"; see owner decisions.
   - Word-level highlighting loses Tiro's speech marks. Options for Phase 4: Piper phoneme timings if exposed, browser `boundary` events, or proportional estimates.
6. **Lemmatizer for stories: build-time DMII Core lookups.** Málvinnsla (`malvinnsla.arnastofnun.is`) has a broken HTTPS certificate, so a GitHub Pages site cannot call its HTTP endpoints (mixed content), and `POST /tag` returned HTTP 500 throughout. Each story token will be annotated at build time with `beygingarmynd/{form}`, with ambiguous tokens resolved by hand in the story file. Its hyphenation endpoint (Skiptir) does work and can pre-compute soft hyphens for long compounds.
7. **Grammar lint: GreynirCorrect locally** (`pip install reynir-correct`, MIT) inside `validate-content`. `yfirlestur.is` redirects to Málfríður, so no hosted API.
8. **Speaking (Phase 6): browser `SpeechRecognition` only**, behind a flag, if it supports `is-IS` at runtime. No hosted Icelandic ASR exists; Whisper fine-tunes need a GPU server.
9. **Norwegian bridge (Phase 7): Ordbøkene API** at `https://ord.uib.no` works without a key and with CORS `*`. Build the cognate candidate list at build time; check the content licence first.

### Brand facts

- *tölva*: English Wiktionary says "A portmanteau word, coined by Sigurður Nordal in 1965 from tala ('number') + völva ('prophetess')". That is one source. The owner decided not to contact the Institute, so the About page cites Wiktionary by name.

### What failed (for the record)

| Item | Result |
|---|---|
| `tts.tiro.is` (all routes, GET and POST) | 404 |
| `speech.tiro.is` | 404 |
| `api.grammatek.com` | DNS lookup fails |
| `https://malvinnsla.arnastofnun.is` | TLS certificate does not match the host |
| `http://malvinnsla.arnastofnun.is/tag` | 500 for JSON and form bodies |
| `audio.tatoeba.org/sentences/{lang}/{id}.mp3` | 404; replaced by `tatoeba.org/en/audio/download/{audio_id}` |
| Korp URL `spraakbanken3.it.gu.se/korp` in the malheildir bundle | Answers but has no Icelandic corpora; the real backend is port 1234 |
| BÍN bulk files | Not scriptable (email form); licence text conflicts |

### Owner decisions (2026-11-03)

1. **BÍN: DMII Core API only.** No bulk files and no contact with the Institute. This also means the About page cannot wait for an Institute source on the *tölva* etymology; it will cite Wiktionary and say so.
2. **Audio: "get the best audio you can."** Human recordings first, then the best-sounding open TTS, rendered at build time. Phase 4 renders the same test sentences with every usable candidate into a comparison page so the owner can pick by ear (the build tooling cannot judge audio quality). Candidates found so far:
   - Piper `is_IS` voices bui, salka, steinn, ugla (VITS, Talrómur, CC BY 4.0): the default.
   - ESPnet Talrómur FastSpeech2 and Tacotron2 models (`espnet/GunnarThor_talromur_*`, `language-and-voice-lab/talromur_*`, CC BY 4.0): older architectures, likely lower quality.
   - `facebook/mms-tts-isl`: CC BY-NC 4.0, non-commercial only. Excluded, because it would restrict reuse of `/data`.
   - Commercial neural voices (Azure is-IS Guðrún and Gunnar) probably sound best but need an account and key held by the owner. Only if the owner opts in.
3. **Node.js:** installed with `winget install OpenJS.NodeJS.LTS`.
4. **Pushing:** allowed. Push `main` to `origin` after each phase commit.
5. **AI conversation practice (Phase 7): skipped.** No LLM features, so no API keys anywhere.
6. **GitHub Pages: not yet.** No workflow file; publishing waits for the owner.
7. **Working mode:** keep building phase after phase without stopping for review, and only ask when something truly needs the owner.
