# Decisions log

What was chosen, why, and what failed. Newest phase first. Evidence for every data-source claim is in [api-report.md](api-report.md), which `scripts/probe-apis.mjs` regenerates.

## Phase 0: repository and probe (2026-11-03)

### Repository state

- Cloned `https://github.com/KaufmannFredrik/duo-dupe-icelandic` into the working folder. The remote was **empty** (no commits, no files), so there was nothing to summarize or preserve. The project is scaffolded from scratch on `main`.
- Added: `.gitignore`, `.nojekyll`, `LICENSE` (MIT, code only), `data/LICENSE.md` (data licensing split), `package.json` (ES modules, Node 20+, no dependencies yet), `scripts/probe-apis.mjs`, `docs/api-report.md`, this file, and a short `README.md`.
- Nothing is pushed. Commits are local until the owner says otherwise.

### Tooling

- **Node.js is not installed** on the development machine. Phase 0 ran on the official portable Node 26.13.0 LTS zip (SHA-256 checked against nodejs.org) from a temporary folder, without changing the system. Phase 1 needs a permanent Node 20+ install for Playwright and axe.
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
   - New proposal: (1) human word recordings from Commons and Lingua Libre where they exist; (2) **static audio pre-generated at build time with Piper** and its four Icelandic voices (Búi, Salka, Steinn, Ugla), trained on Talrómur (CC BY 4.0); (3) browser `speechSynthesis` with an `is-IS` voice. Slow speed can be a second Piper render or `playbackRate` with `preservesPitch`; decide in Phase 4 against the 20 MB data budget. **Needs owner approval** (see questions).
   - Word-level highlighting loses Tiro's speech marks. Options for Phase 4: Piper phoneme timings if exposed, browser `boundary` events, or proportional estimates.
6. **Lemmatizer for stories: build-time DMII Core lookups.** Málvinnsla (`malvinnsla.arnastofnun.is`) has a broken HTTPS certificate, so a GitHub Pages site cannot call its HTTP endpoints (mixed content), and `POST /tag` returned HTTP 500 throughout. Each story token will be annotated at build time with `beygingarmynd/{form}`, with ambiguous tokens resolved by hand in the story file. Its hyphenation endpoint (Skiptir) does work and can pre-compute soft hyphens for long compounds.
7. **Grammar lint: GreynirCorrect locally** (`pip install reynir-correct`, MIT) inside `validate-content`. `yfirlestur.is` redirects to Málfríður, so no hosted API.
8. **Speaking (Phase 6): browser `SpeechRecognition` only**, behind a flag, if it supports `is-IS` at runtime. No hosted Icelandic ASR exists; Whisper fine-tunes need a GPU server.
9. **Norwegian bridge (Phase 7): Ordbøkene API** at `https://ord.uib.no` works without a key and with CORS `*`. Build the cognate candidate list at build time; check the content licence first.

### Brand facts

- *tölva*: English Wiktionary says "A portmanteau word, coined by Sigurður Nordal in 1965 from tala ('number') + völva ('prophetess')". That is one source. The About page waits for a second one from the Árni Magnússon Institute, as the brief requires.

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

### Open questions for the owner

1. **BÍN bulk licence conflict.** Proceed with the DMII Core API only (recommended), or request the bulk files and ask the Institute which terms apply?
2. **Synthetic audio.** Is build-time Piper audio (Talrómur voices, CC BY 4.0) acceptable as the main sentence audio, with a native speaker spot-checking quality?
3. **Node.js.** Install Node 20+ (for example `winget install OpenJS.NodeJS.LTS`) before Phase 1, or should the scripts keep using a portable copy?
4. **Pushing.** Say when to push `main` to GitHub.
