# TÖLVA: API and dataset probe report

Generated 2026-11-03T17:58:28.516Z by `node scripts/probe-apis.mjs` on Node v26.13.0. 43 of 52 checks passed.

Every request sends `Origin: http://localhost:8080`. When a server echoes that origin back, the request is repeated with `Origin: https://kaufmannfredrik.github.io` to see whether a GitHub Pages deployment would also be allowed. POST endpoints also get a CORS preflight (`OPTIONS` with `content-type`).

This file is generated; edit `scripts/probe-apis.mjs` instead. "Findings" were verified by hand on 2026-11-03; the check tables are live results from the run above.

CORS legend: `*` means any origin; `reflects any origin` means the server echoes whatever origin is sent; `none` means no CORS header, so browsers cannot read the response (fine for build-time use); `HTTP only (mixed content)` means a page served over HTTPS cannot call it.

## Summary

| Source | Checks passed | Browser CORS (passing checks) | Recommended strategy |
|---|---|---|---|
| [BÍN, Database of Icelandic Morphology (DMII Core API and bulk data)](#bin) | 11/11 | *, none | Build-time, plus optional live lookups |
| [Ylhýra inflection API (third-party wrapper over BÍN)](#ylhyra) | 2/2 | * | Optional fallback only |
| [Wiktionary via kaikki.org (glosses, IPA, etymology, audio)](#kaikki) | 3/3 | none | Build-time |
| [Tatoeba (example sentences and sentence audio)](#tatoeba) | 7/8 | none, * | Build-time |
| [Tiro TTS (tts.tiro.is)](#tiro) | 0/4 | n/a (nothing passed) | Unavailable: skip |
| [Grammatek TTS endpoint (seen in third-party code)](#grammatek) | 0/1 | n/a (nothing passed) | Unavailable: skip |
| [Piper Icelandic voices (offline TTS, build-time candidate)](#piper) | 4/4 | reflects any origin, none | Build-time (Phase 4 candidate) |
| [Speech recognition (speaking exercises)](#asr) | 2/3 | reflects any origin, none | Browser-only, flagged (Phase 6) |
| [Málvinnsla (Árni Magnússon Institute: tagger, Nefnir lemmatizer, word splitting)](#malvinnsla) | 2/4 | HTTP only (mixed content) | Build-time only; DMII Core as lemma fallback |
| [GreynirCorrect (spelling and grammar checking)](#greynir) | 2/2 | *, none | Build-time |
| [Icelandic corpora in Korp (malheildir.arnastofnun.is)](#korp) | 3/3 | invalid (3 values), reflects any origin | Build-time |
| [Word frequency: Frequency lists for Icelandic 23.06 (CLARIN-IS)](#freq) | 2/2 | none | Build-time |
| [Ordbøkene (Bokmål and Nynorsk dictionaries, University of Bergen and Språkrådet)](#ordbokene) | 3/3 | * | Build-time (Phase 7 stretch) |
| [Wikimedia Commons and Lingua Libre (human word recordings)](#commons) | 2/2 | * | Build-time |

## All checks

| # | Source | Check | HTTP | Time | CORS | Preflight | Result |
|---|---|---|---|---|---|---|---|
| 1 | bin | DMII Core API index | 200 | 367 ms | * | - | **PASS**: endpoints: ord/[orð], ord/[guid], ord/[ofl]/[orð], beygingarmynd/[beygingarmynd], beygingarmynd/[ofl]/[beygingarmynd] |
| 2 | bin | Paradigm by lemma (hestur) | 200 | 567 ms | * | - | **PASS**: hestur (no kk): 16 forms, e.g. NFET=hestur, NFETgr=hesturinn, ÞFET=hest, ÞFETgr=hestinn |
| 3 | bin | Paradigm by inflected form (hestsins) | 200 | 562 ms | * | - | **PASS**: hestur (no kk): 16 forms, e.g. NFET=hestur, NFETgr=hesturinn, ÞFET=hest, ÞFETgr=hestinn |
| 4 | bin | Non-ASCII form in URL (stúlkunni) | 200 | 336 ms | * | - | **PASS**: stúlka (no kvk): 16 forms, e.g. NFET=stúlka, NFETgr=stúlkan, ÞFET=stúlku, ÞFETgr=stúlkuna |
| 5 | bin | Verb by word class (so/koma) | 200 | 82 ms | * | - | **PASS**: koma (so): 80 forms, e.g. GM-NH=koma, GM-FH-NT-1P-ET=kem, GM-FH-NT-2P-ET=kemur, GM-FH-NT-3P-ET=kemur |
| 6 | bin | Ambiguous lemma returns a list (koma) | 200 | 90 ms | * | - | **PASS**: 2 matches: koma (so), koma (no kvk) |
| 7 | bin | Tag set CSV | 200 | 115 ms | none | - | **PASS**: 509 tag rows |
| 8 | bin | Bulk data file list | 200 | 108 ms | * | - | **PASS**: BIN_skst.csv.zip (81 KB), BIN_divs.csv (2 MB), BIN_ordalisti.csv.zip (2 MB), BIN_ordmyndir.txt.zip (9 MB), Storasnid_allt.zip (37 MB), SHsnid.csv.zip (32 MB), K |
| 9 | bin | DMII Core licence page | 200 | 203 ms | * | - | **PASS** |
| 10 | bin | Bulk data conditions page | 200 | 202 ms | * | - | **PASS** |
| 11 | bin | Bulk Download page terms | 200 | 207 ms | * | - | **PASS**: still shows the older restrictive terms (conflict persists) |
| 12 | ylhyra | Exact search (hestur) | 200 | 517 ms | * | - | **PASS**: 2 results: hestur [noun masculine] id 6179; Hestur [noun masculine] id 259304 |
| 13 | ylhyra | Paradigm by id (flat) | 200 | 614 ms | * | - | **PASS** |
| 14 | kaikki | Icelandic JSONL (first 4 KB) | 200 | 411 ms | none | - | **PASS**: 7.5 MB (gzip transfer), last modified Fri, 30 Oct 2026 23:34:36 GMT |
| 15 | kaikki | Icelandic index page | 200 | 302 ms | none | - | **PASS**: per-language file marked DEPRECATED |
| 16 | kaikki | Raw wiktextract dump (fallback) | 200 | 498 ms | none | - | **PASS**: 2939.7 MB |
| 17 | tatoeba | Downloads page | 200 | 1247 ms | none | - | **PASS** |
| 18 | tatoeba | isl_sentences_detailed.tsv.bz2 | 200 | 408 ms | none | - | **PASS**: 249 KB |
| 19 | tatoeba | isl-eng_links.tsv.bz2 | 200 | 413 ms | none | - | **PASS**: 62 KB |
| 20 | tatoeba | isl-nob_links.tsv.bz2 | 200 | 387 ms | none | - | **PASS**: 1 KB |
| 21 | tatoeba | sentences_with_audio.tar.bz2 (all languages) | 200 | 183 ms | none | - | **PASS**: 6.1 MB |
| 22 | tatoeba | Audio, current URL pattern | 200 | 1428 ms | none | - | **PASS** |
| 23 | tatoeba | Audio, old URL pattern (audio.tatoeba.org) | 404 | 431 ms | none | - | **FAIL**: HTTP 404 |
| 24 | tatoeba | Unstable JSON API | 200 | 3283 ms | * | - | **PASS**: sample: Ég vildi gjarnan fá kjúklingasúpu. |
| 25 | tiro | Docs root | 404 | 314 ms | none | - | **FAIL**: HTTP 404 |
| 26 | tiro | Voice list | 404 | 59 ms | none | - | **FAIL**: HTTP 404 |
| 27 | tiro | Synthesize MP3 (Alfur) | 404 | 54 ms | none | fail (HTTP 404, CORS none) | **FAIL**: HTTP 404 |
| 28 | tiro | Speech marks (word timings) | 404 | 46 ms | none | fail (HTTP 404, CORS none) | **FAIL**: HTTP 404 |
| 29 | grammatek | Voice list | - | 108 ms | - | - | **FAIL**: DNS lookup failed (host not found) |
| 30 | piper | Icelandic voices on Hugging Face | 200 | 257 ms | reflects any origin | - | **PASS**: bui, salka, steinn, ugla |
| 31 | piper | Voice config (steinn, medium) | 200 | 169 ms | reflects any origin | - | **PASS** |
| 32 | piper | Voice model card cites Talrómur | 200 | 205 ms | reflects any origin | - | **PASS** |
| 33 | piper | Talrómur licence (CLARIN record) | 200 | 1001 ms | none | - | **PASS** |
| 34 | asr | Tiro Speech (speech.tiro.is) | 404 | 667 ms | none | - | **FAIL**: HTTP 404 |
| 35 | asr | Icelandic Whisper models on Hugging Face | 200 | 202 ms | reflects any origin | - | **PASS**: carlosdanielhernandezmena/whisper-large-icelandic-10k-steps-1000h, language-and-voice-lab/whisper-large-icelandic-30k-steps-1000h, language-and-voice-lab/whispe |
| 36 | asr | Common Voice lists Icelandic | 200 | 647 ms | none | - | **PASS** |
| 37 | malvinnsla | HTTPS root | - | 369 ms | - | - | **FAIL**: TLS certificate does not match the host name |
| 38 | malvinnsla | HTTP root | 200 | 241 ms | * | - | **PASS** |
| 39 | malvinnsla | POST /tag (PoS tags and lemmas) | 500 | 235 ms | * | pass (200) | **FAIL**: HTTP 500 |
| 40 | malvinnsla | POST /ordskipting (Skiptir hyphenation) | 200 | 189 ms | * | - | **PASS**: Þjóð-minja-safn-ið er op-ið. |
| 41 | greynir | reynir-correct on PyPI | 200 | 131 ms | * | - | **PASS**: version 4.2.0, requires Python >=3.11, MIT License |
| 42 | greynir | yfirlestur.is redirect | 301 | 397 ms | none | - | **PASS**: redirects to https://malstadur.mideind.is/malfridur |
| 43 | korp | Web UI | 200 | 683 ms | invalid (3 values) | - | **PASS** |
| 44 | korp | Backend /info (port 1234) | 200 | 336 ms | reflects any origin | - | **PASS**: 485 corpora, 376 IGC/RMH subcorpora |
| 45 | korp | Lemma query [lemma="hestur"] in IGC21_BOOKS | 200 | 220 ms | reflects any origin | - | **PASS**: 2533 hits |
| 46 | freq | CLARIN record 20.500.12537/314 | 200 | 255 ms | none | - | **PASS**: CC BY 4.0 stated on the record |
| 47 | freq | Frequency_lists.zip (first bytes) | 200 | 403 ms | none | - | **PASS**: 65.7 MB |
| 48 | ordbokene | Article search (hus, bm+nn) | 200 | 74 ms | * | - | **PASS**: {"bm":[24627],"nn":[31964]} |
| 49 | ordbokene | Article JSON (bm 24627) | 200 | 325 ms | * | - | **PASS**: lemma: hus |
| 50 | ordbokene | Suggest (hus) | 200 | 56 ms | * | - | **PASS** |
| 51 | commons | Lingua Libre Icelandic recordings | 200 | 395 ms | * | - | **PASS**: 375 files |
| 52 | commons | Category: Icelandic pronunciation | 200 | 422 ms | * | - | **PASS**: 129 files, 12 subcategories |

## Details and recommendations

<a id="bin"></a>
### BÍN, Database of Icelandic Morphology (DMII Core API and bulk data)

**Licence:** CC BY-SA 4.0. The DMII Core may be published on the web free of charge, unmodified, with credit.

**Recommendation: Build-time, plus optional live lookups.** In Phase 2, fetch the paradigm of every course lemma from the DMII Core API (one request at a time, cached in `.cache/`) and store it unmodified (the same forms and tags inside a compact JSON wrapper) in `/data` with the required credit. The dictionary view may also query the API live for words outside the cached set, since CORS is open, with an IndexedDB cache and a polite failure message. Do not build paradigms from the bulk files. The bulk word-form list is optional (validate-content can check tokens against the cached Core paradigms) and would need the owner to request it and accept the conflicting terms.

Findings (2026-11-03):

- The official **DMII Core REST API** (`https://bin.arnastofnun.is/api/`) returns full paradigms as JSON: `ord/{lemma}`, `ord/{guid}`, `ord/{wordclass}/{lemma}`, `beygingarmynd/{form}` and `beygingarmynd/{wordclass}/{form}`, with `*` and `_` as wildcards. When several words match, it returns a list of guids instead of a paradigm.
- The DMII Core (BÍN-kjarninn, about 58,000 words) is the prescriptive subset "designed ... especially for use in schools and for learners" and "created to be used for third party publication". Its licence page (`/DMII/dmii-core/licence/`) says it is open for everyone, that third parties may publish the data on the web free of charge but must not modify it and must give credit, and that it is CC BY-SA 4.0.
- The bulk language-technology files (`BIN_ordmyndir.txt.zip`, `SHsnid.csv.zip` in Sigrún's format, `KRISTINsnid.csv.zip`, `Storasnid_allt.zip` and others, listed at `/django/api/nidurhal/`) cannot be downloaded directly. `/gogn/mimisbrunnur/` is a form (email address plus reCAPTCHA) that emails a download link.
- The bulk files have **conflicting licence texts**. `/DMII/LTdata/conditions/` and `/gogn/skilmalar/` say CC BY-SA 4.0, but the English Download page `/DMII/LTdata/data/` still shows older terms: no distribution to third parties, no publication of paradigms, and no paradigm-producing software without a special contract. The LT overview also says this data "is not suitable for reproduction of the DMII paradigms" and points to the DMII Core API for that.
- Tag set with Icelandic and English explanations: `https://bin.arnastofnun.is/data/tags.csv` (semicolon separated).
- Required credit line: "Beygingarlýsing íslensks nútímamáls. Stofnun Árna Magnússonar í íslenskum fræðum. Höfundur og ritstjóri Kristín Bjarnadóttir." with a link to https://bin.arnastofnun.is, and a note of any changes made.

Checks:

- PASS DMII Core API index: `GET https://bin.arnastofnun.is/api/`
  - HTTP 200, 367 ms, application/json; charset=utf-8, CORS *. endpoints: ord/[orð], ord/[guid], ord/[ofl]/[orð], beygingarmynd/[beygingarmynd], beygingarmynd/[ofl]/[beygingarmynd]
  - Sample: `{"name":"Beygingarlýsing íslensks nútímamáls","description":"Vefþjónusta fyrir beygingarmyndir í BÍN-kjarna.","url":"https://bin.arnastofnun.is/api","about":"https://bin.arnastofnun.is/binkjarni","endpoints":{"ord/[orð]"`
- PASS Paradigm by lemma (hestur): `GET https://bin.arnastofnun.is/api/ord/hestur`
  - HTTP 200, 567 ms, application/json; charset=utf-8, CORS *. hestur (no kk): 16 forms, e.g. NFET=hestur, NFETgr=hesturinn, ÞFET=hest, ÞFETgr=hestinn
  - Sample: `[{"ord":"hestur","guid":"77be2a7ce3867a94536ce574e8b0c5d4","ofl_heiti":"nafnorð","ofl":"no","kyn":"kk","hluti":"Almennt mál","hluti_id":"ALM","skyring":"karlkynsnafnorð","bmyndir":[{"g":"NFET","b":"hestur"},{"g":"NFETgr"`
- PASS Paradigm by inflected form (hestsins): `GET https://bin.arnastofnun.is/api/beygingarmynd/hestsins`
  - HTTP 200, 562 ms, application/json; charset=utf-8, CORS *. hestur (no kk): 16 forms, e.g. NFET=hestur, NFETgr=hesturinn, ÞFET=hest, ÞFETgr=hestinn
  - Sample: `[{"ord":"hestur","guid":"77be2a7ce3867a94536ce574e8b0c5d4","ofl_heiti":"nafnorð","ofl":"no","kyn":"kk","hluti":"Almennt mál","hluti_id":"ALM","skyring":"karlkynsnafnorð","bmyndir":[{"g":"NFET","b":"hestur"},{"g":"NFETgr"`
- PASS Non-ASCII form in URL (stúlkunni): `GET https://bin.arnastofnun.is/api/beygingarmynd/st%C3%BAlkunni`
  - HTTP 200, 336 ms, application/json; charset=utf-8, CORS *. stúlka (no kvk): 16 forms, e.g. NFET=stúlka, NFETgr=stúlkan, ÞFET=stúlku, ÞFETgr=stúlkuna
  - Sample: `[{"ord":"stúlka","guid":"d619e1fc57753d94593b16599813e294","ofl_heiti":"nafnorð","ofl":"no","kyn":"kvk","hluti":"Almennt mál","hluti_id":"ALM","skyring":"kvenkynsnafnorð","bmyndir":[{"g":"NFET","b":"stúlka"},{"g":"NFETgr`
- PASS Verb by word class (so/koma): `GET https://bin.arnastofnun.is/api/ord/so/koma`
  - HTTP 200, 82 ms, application/json; charset=utf-8, CORS *. koma (so): 80 forms, e.g. GM-NH=koma, GM-FH-NT-1P-ET=kem, GM-FH-NT-2P-ET=kemur, GM-FH-NT-3P-ET=kemur
  - Sample: `[{"ord":"koma","guid":"243124e0f0d5f5c5aaec1952540026bc","ofl_heiti":"sagnorð","ofl":"so","kyn":"","hluti":"Almennt mál","hluti_id":"ALM","skyring":"kom komum komið sagnorð","bmyndir":[{"g":"GM-NH","b":"koma"},{"g":"GM-F`
- PASS Ambiguous lemma returns a list (koma): `GET https://bin.arnastofnun.is/api/ord/koma`
  - HTTP 200, 90 ms, application/json; charset=utf-8, CORS *. 2 matches: koma (so), koma (no kvk)
  - Sample: `[{"ord":"koma","guid":"243124e0f0d5f5c5aaec1952540026bc","ofl_heiti":"sagnorð","ofl":"so","kyn":"","hluti":"Almennt mál","hluti_id":"ALM","skyring":"kom komum komið sagnorð"},{"ord":"koma","guid":"cd60a51478845e435b55b75`
- PASS Tag set CSV: `GET https://bin.arnastofnun.is/data/tags.csv`
  - HTTP 200, 115 ms, text/csv, CORS none. 509 tag rows
  - Sample: `Orðflokkur;mark;íslensk skýring;ensk skýring; Word class;tag;Icelandic explanation;English explanation; ao;OBEYGJANLEGT;óbeygjanlegt;uninflected; fs;OBEYGJANLEGT;óbeygjanlegt;uninflected; nhm;OBEYGJANLEGT;óbeygjanlegt;un`
- PASS Bulk data file list: `GET https://bin.arnastofnun.is/django/api/nidurhal/`
  - HTTP 200, 108 ms, application/json, CORS *. BIN_skst.csv.zip (81 KB), BIN_divs.csv (2 MB), BIN_ordalisti.csv.zip (2 MB), BIN_ordmyndir.txt.zip (9 MB), Storasnid_allt.zip (37 MB), SHsnid.csv.zip (32 MB), KRISTINsnid.csv.zip (34 MB)
  - Sample: `{"files": [{"file": "BIN_skst.csv.zip", "size": " 81 KB"}, {"file": "BIN_divs.csv", "size": " 2 MB"}, {"file": "BIN_ordalisti.csv.zip", "size": " 2 MB"}, {"file": "BIN_ordmyndir.txt.zip", "size": " 9 MB"}, {"file": "Stor`
- PASS DMII Core licence page: `GET https://bin.arnastofnun.is/django/api/pages/?url=/DMII/dmii-core/licence/`
  - HTTP 200, 203 ms, application/json, CORS *
  - Sample: `{"count":1,"next":null,"previous":null,"results":[{"id":222,"url":"/DMII/dmii-core/licence/","title":"Licence and Access to the DMII Core","content":"<h3>Licence and Access to the DMII Core</h3>\r\n\r\n<p>The DMII Core A`
- PASS Bulk data conditions page: `GET https://bin.arnastofnun.is/django/api/pages/?url=/DMII/LTdata/conditions/`
  - HTTP 200, 202 ms, application/json, CORS *
  - Sample: `{"count":1,"next":null,"previous":null,"results":[{"id":70,"url":"/DMII/LTdata/conditions/","title":"Conditions","content":"<h2>Conditions on the use, publication and distribution of data from the Database of Icelandic M`
- PASS Bulk Download page terms: `GET https://bin.arnastofnun.is/django/api/pages/?url=/DMII/LTdata/data/`
  - HTTP 200, 207 ms, application/json, CORS *. still shows the older restrictive terms (conflict persists)
  - Sample: `{"count":1,"next":null,"previous":null,"results":[{"id":218,"url":"/DMII/LTdata/data/","title":"Download","content":"<h2>Download</h2>\r\n\r\n<h4>Conditions on the use, publication and distribution of data from the DMII `

<a id="ylhyra"></a>
### Ylhýra inflection API (third-party wrapper over BÍN)

**Licence:** Software MIT; data from BÍN (CC BY-SA 4.0). Terms and rate limits not published.

**Recommendation: Optional fallback only.** Not needed: the official DMII Core API answers the same questions with open CORS. Keep it documented as a fallback for the dictionary view; do not call it from the client by default.

Findings (2026-11-03):

- Results include the BÍN id, a nested or flat paradigm, and a per-form `should_be_taught` flag that may help decide which variants to teach.
- Fuzzy search (`&fuzzy=true`) returned `{"results": null}` for an inflected form (`hesti`) during manual testing.

Checks:

- PASS Exact search (hestur): `GET https://ylhyra.is/api/inflection?search=hestur`
  - HTTP 200, 517 ms, application/json; charset=utf-8, CORS *. 2 results: hestur [noun masculine] id 6179; Hestur [noun masculine] id 259304
  - Sample: `{ "results": [ { "BIN_id": 6179, "urls": { "nested": "https://ylhyra.is/api/inflection?id=6179", "flat": "https://ylhyra.is/api/inflection?id=6179&type=flat", "html": "https://ylhyra.is/api/inflection?id=6179&type=html" `
- PASS Paradigm by id (flat): `GET https://ylhyra.is/api/inflection?id=6179&type=flat`
  - HTTP 200, 614 ms, application/json; charset=utf-8, CORS *
  - Sample: `{ "results": [ { "word_categories": [ "noun", "masculine" ], "inflectional_form_categories": [ "singular", "nominative", "without definite article", 1 ], "original_grammatical_tag": "NFET", "BIN_domain": "alm", "BIN_id":`

<a id="kaikki"></a>
### Wiktionary via kaikki.org (glosses, IPA, etymology, audio)

**Licence:** CC BY-SA 4.0 (and GFDL). Audio files on Wikimedia Commons carry per-file licences.

**Recommendation: Build-time.** Download the per-language file now while it exists, pin its SHA-256 in `data/SOURCES.json`, and extract glosses, IPA, etymology and Commons audio file names for course lemmas. If it disappears, switch to stream-filtering the raw dump. Capture per-file audio licences from Commons for the credits page.

Findings (2026-11-03):

- The per-language Icelandic file (about 69 MB) is still served but marked **DEPRECATED** ("will be removed in the near future", wiktextract issue #1178).
- The fallback is the full raw dump (`https://kaikki.org/dictionary/raw-wiktextract-data.jsonl.gz`, all languages, many gigabytes uncompressed) filtered by `lang_code == "is"`.

Checks:

- PASS Icelandic JSONL (first 4 KB): `GET https://kaikki.org/dictionary/Icelandic/kaikki.org-dictionary-Icelandic.jsonl`
  - HTTP 200, 411 ms, application/octet-stream, CORS none. 7.5 MB (gzip transfer), last modified Fri, 30 Oct 2026 23:34:36 GMT
  - Sample: `{"pos": "character", "forms": [{"form": "a", "tags": ["lowercase"]}], "word": "A", "lang": "Icelandic", "lang_code": "is", "sounds": [{"ipa": "[ˈaː]"}], "senses": [{"links": [["letter", "letter"], ["alphabet", "alphabet"`
- PASS Icelandic index page: `GET https://kaikki.org/dictionary/Icelandic/index.html`
  - HTTP 200, 302 ms, text/html, CORS none. per-language file marked DEPRECATED
  - Sample: `Icelandic dictionary Icelandic machine-readable dictionary Home English edition Icelandic Use the search box on the top right corner to find a particular word. You can also browse words by following the links below. All `
- PASS Raw wiktextract dump (fallback): `GET https://kaikki.org/dictionary/raw-wiktextract-data.jsonl.gz`
  - HTTP 200, 498 ms, application/octet-stream, CORS none. 2939.7 MB
  - Sample: `binary (application/octet-stream), starts with 0x1f8b0800b401`

<a id="tatoeba"></a>
### Tatoeba (example sentences and sentence audio)

**Licence:** Sentence text CC BY 2.0 FR (attribution required). Audio licence varies per recording.

**Recommendation: Build-time.** Use the bulk exports. Keep sentence id and author for every sentence shown (CC BY 2.0 FR attribution), and per-recording username and licence for any audio. Icelandic sentence audio must come from elsewhere (Piper at build time, or browser TTS).

Findings (2026-11-03):

- There is no stable public API. `api.tatoeba.org/unstable/...` answers, but it is explicitly unstable; do not depend on it.
- Per-language exports exist for Icelandic (`isl_sentences.tsv.bz2`, `isl_sentences_detailed.tsv.bz2`, and pair files such as `isl-eng_links.tsv.bz2` and `isl-nob_links.tsv.bz2`). The audio list is only published globally (`sentences_with_audio.tar.bz2`).
- The old audio URL pattern `https://audio.tatoeba.org/sentences/{lang}/{id}.mp3` is dead. The current pattern is `https://tatoeba.org/{ui-lang}/audio/download/{audio_id}`, keyed by audio id (from `sentences_with_audio`), not sentence id.
- Measured with `--coverage` and cross-checked with `comm`: **none** of the Icelandic sentences has a recording in `sentences_with_audio.csv` (1.24 million rows, all languages). Tatoeba is a text source only for Icelandic.

Checks:

- PASS Downloads page: `GET https://tatoeba.org/en/downloads`
  - HTTP 200, 1247 ms, text/html; charset=UTF-8, CORS none
  - Sample: `Download sentences - Tatoeba <link rel="alternate"`
- PASS isl_sentences_detailed.tsv.bz2: `GET https://downloads.tatoeba.org/exports/per_language/isl/isl_sentences_detailed.tsv.bz2`
  - HTTP 200, 408 ms, application/octet-stream, CORS none. 249 KB
  - Sample: `binary (application/octet-stream), starts with 0x425a68393141`
- PASS isl-eng_links.tsv.bz2: `GET https://downloads.tatoeba.org/exports/per_language/isl/isl-eng_links.tsv.bz2`
  - HTTP 200, 413 ms, application/octet-stream, CORS none. 62 KB
  - Sample: `binary (application/octet-stream), starts with 0x425a68393141`
- PASS isl-nob_links.tsv.bz2: `GET https://downloads.tatoeba.org/exports/per_language/isl/isl-nob_links.tsv.bz2`
  - HTTP 200, 387 ms, application/octet-stream, CORS none. 1 KB
  - Sample: `binary (application/octet-stream), starts with 0x425a68393141`
- PASS sentences_with_audio.tar.bz2 (all languages): `GET https://downloads.tatoeba.org/exports/sentences_with_audio.tar.bz2`
  - HTTP 200, 183 ms, application/octet-stream, CORS none. 6.1 MB
  - Sample: `binary (application/octet-stream), starts with 0x425a68393141`
- PASS Audio, current URL pattern: `GET https://tatoeba.org/en/audio/download/1`
  - HTTP 200, 1428 ms, audio/mpeg, CORS none
  - Sample: `binary (audio/mpeg), starts with 0xfffb50c40000`
- FAIL Audio, old URL pattern (audio.tatoeba.org): `GET https://audio.tatoeba.org/sentences/isl/1.mp3`
  - HTTP 404, 431 ms, text/html; charset=UTF-8, CORS none. Problem: HTTP 404
  - Sample: `404 Not Found 404 Not Found Tatoeba`
- PASS Unstable JSON API: `GET https://api.tatoeba.org/unstable/sentences?lang=isl&sort=random&limit=1`
  - HTTP 200, 3283 ms, application/json, CORS *. sample: Ég vildi gjarnan fá kjúklingasúpu.
  - Sample: `{"data":[{"id":475717,"text":"\u00c9g vildi gjarnan f\u00e1 kj\u00faklingas\u00fapu.","lang":"isl","script":null,"license":"CC BY 2.0 FR","owner":"Swift","is_unapproved":false}],"paging":{"total":13392,"has_next":true,"n`

<a id="tiro"></a>
### Tiro TTS (tts.tiro.is)

**Licence:** Server code Apache 2.0 (github.com/icelandic-lt/tiro-tts). Service terms unknown.

**Recommendation: Unavailable: skip.** Do not build on Tiro. Revised audio chain: (1) human recordings (Wiktionary/Commons, Lingua Libre, Tatoeba), (2) static audio pre-generated at build time with the open Piper voices (see below), (3) browser `speechSynthesis` with an `is-IS` voice. Word-level highlighting then needs another timing source (browser `boundary` events where available, or an estimate).

Findings (2026-11-03):

- During manual testing every path on `tts.tiro.is` answered `404 page not found`, including the documented `POST /v0/speech`, `GET /v0/voices`, the OpenAPI docs and the preflight. The public instance looks decommissioned or moved; no notice was found.
- The code can still be self-hosted with Docker, but that needs a server, which this static site does not have.

Checks:

- FAIL Docs root: `GET https://tts.tiro.is/`
  - HTTP 404, 314 ms, text/plain; charset=utf-8, CORS none. Problem: HTTP 404
  - Sample: `404 page not found`
- FAIL Voice list: `GET https://tts.tiro.is/v0/voices`
  - HTTP 404, 59 ms, text/plain; charset=utf-8, CORS none. Problem: HTTP 404
  - Sample: `404 page not found`
- FAIL Synthesize MP3 (Alfur): `POST https://tts.tiro.is/v0/speech`
  - HTTP 404, 54 ms, text/plain; charset=utf-8, CORS none, preflight fail. Problem: HTTP 404
  - Sample: `404 page not found`
- FAIL Speech marks (word timings): `POST https://tts.tiro.is/v0/speech`
  - HTTP 404, 46 ms, text/plain; charset=utf-8, CORS none, preflight fail. Problem: HTTP 404
  - Sample: `404 page not found`

<a id="grammatek"></a>
### Grammatek TTS endpoint (seen in third-party code)

**Licence:** Unknown.

**Recommendation: Unavailable: skip.** The host does not resolve.

Checks:

- FAIL Voice list: `GET https://api.grammatek.com/tts/v0/voices`
  - HTTP -, 108 ms, no content-type, CORS -. Problem: DNS lookup failed (host not found)

<a id="piper"></a>
### Piper Icelandic voices (offline TTS, build-time candidate)

**Licence:** Voices trained on Talrómur (CC BY 4.0). Engine licence to confirm in Phase 4.

**Recommendation: Build-time (Phase 4 candidate).** Pre-generate audio for every course item with one or two Piper voices, at normal and slow speed, as small Opus or MP3 files in `/data/audio`. Credit Talrómur (CC BY 4.0) and the voice. Ask a native speaker to rate a sample before committing to it.

Findings (2026-11-03):

- Not in the original brief; found while looking for a Tiro replacement. `rhasspy/piper-voices` has four Icelandic voices (`is_IS`: bui, salka, steinn, ugla; medium quality, 22.05 kHz). Each model card cites the Talrómur corpus (hdl 20.500.12537/104), which CLARIN lists as CC BY 4.0.
- Piper runs offline on a laptop, so every course sentence and word could be pre-generated into small static audio files at build time: no runtime API, works offline, redistributable with credit. Quality must be judged by ear and by a native speaker.
- The original `rhasspy/piper` engine is MIT; its maintained successor is GPL-3.0. Either way it is only a build tool and is not shipped with the site.

Checks:

- PASS Icelandic voices on Hugging Face: `GET https://huggingface.co/api/models/rhasspy/piper-voices/tree/main/is/is_IS`
  - HTTP 200, 257 ms, application/json; charset=utf-8, CORS reflects any origin. bui, salka, steinn, ugla
  - Sample: `[{"type":"directory","oid":"b13e30c5c4b8bbd06e49830cc6a9318875e206ac","size":0,"path":"is/is_IS/bui"},{"type":"directory","oid":"195517a9b23770e8677fc3dbfa323cca26be2561","size":0,"path":"is/is_IS/salka"},{"type":"direct`
- PASS Voice config (steinn, medium): `GET https://huggingface.co/rhasspy/piper-voices/resolve/main/is/is_IS/steinn/medium/is_IS-steinn-medium.onnx.json (redirected to https://huggingface.co/api/resolve-cache/models/rhasspy/piper-voices/e7229f7d33a10e145e109b886d661984201ac3c4/is%2Fis_IS%2Fsteinn%2Fmedium%2Fis_IS-steinn-medium.onnx.json?%2Frhasspy%2Fpiper-voices%2Fresolve%2Fmain%2Fis%2Fis_IS%2Fsteinn%2Fmedium%2Fis_IS-steinn-medium.onnx.json=&etag=%224f906935e60f44b1d476a1b51dc4e347da0ccf92%22)`
  - HTTP 200, 169 ms, text/plain; charset=utf-8, CORS reflects any origin
  - Sample: `{ "audio": { "sample_rate": 22050, "quality": "medium" }, "espeak": { "voice": "is" }, "inference": { "noise_scale": 0.667, "length_scale": 1, "noise_w": 0.8 }, "phoneme_map": {}, "phoneme_id_map": { "_": [ 0 ], "^": [ 1`
- PASS Voice model card cites Talrómur: `GET https://huggingface.co/rhasspy/piper-voices/resolve/main/is/is_IS/steinn/medium/MODEL_CARD (redirected to https://huggingface.co/api/resolve-cache/models/rhasspy/piper-voices/e7229f7d33a10e145e109b886d661984201ac3c4/is%2Fis_IS%2Fsteinn%2Fmedium%2FMODEL_CARD?%2Frhasspy%2Fpiper-voices%2Fresolve%2Fmain%2Fis%2Fis_IS%2Fsteinn%2Fmedium%2FMODEL_CARD=&etag=%2297ee40854e4a578d493ab7f1260782851716c487%22)`
  - HTTP 200, 205 ms, text/plain; charset=utf-8, CORS reflects any origin
  - Sample: `# Model card for steinn (medium) * Language: is_IS (Icelandic, Iceland) * Speakers: 1 * Quality: medium * Samplerate: 22,050Hz ## Dataset * URL: http://hdl.handle.net/20.500.12537/104 * License: See URL ## Training Train`
- PASS Talrómur licence (CLARIN record): `GET https://repository.clarin.is/repository/xmlui/handle/20.500.12537/104`
  - HTTP 200, 1001 ms, text/html;charset=utf-8, CORS none
  - Sample: `Talrómur 1 (21.02) Home Repository About CLARIN-IS CLARIN Login CLARIN-IS Repository Home View Item Show/Hide Menu What can you do? Browse All of the Repository Issue Date Authors Titles Subjects Publisher Language Type `

<a id="asr"></a>
### Speech recognition (speaking exercises)

**Licence:** Varies.

**Recommendation: Browser-only, flagged (Phase 6).** No hosted public Icelandic ASR was found. Phase 6 can only use browser `SpeechRecognition` where it supports `is-IS` (runtime detection, feature flag, "Did we understand you?" wording). Otherwise skip speaking.

Findings (2026-11-03):

- Browser `SpeechRecognition` cannot be probed from Node. It is effectively Chrome-only and must be detected at runtime, including whether `is-IS` works.
- Icelandic Whisper fine-tunes exist on Hugging Face (for example `language-and-voice-lab/whisper-large-icelandic-*`), but they need a GPU server. Not usable on a static site.
- Common Voice lists Icelandic, and its clips are CC0, but dataset downloads now need an account on the Mozilla Data Collective. Samrómur (CC BY 4.0) is on CLARIN. Neither is a hosted ASR service.

Checks:

- FAIL Tiro Speech (speech.tiro.is): `GET https://speech.tiro.is/`
  - HTTP 404, 667 ms, text/plain; charset=utf-8, CORS none. Problem: HTTP 404
  - Sample: `404 page not found`
- PASS Icelandic Whisper models on Hugging Face: `GET https://huggingface.co/api/models?search=whisper-large-icelandic&limit=10`
  - HTTP 200, 202 ms, application/json; charset=utf-8, CORS reflects any origin. carlosdanielhernandezmena/whisper-large-icelandic-10k-steps-1000h, language-and-voice-lab/whisper-large-icelandic-30k-steps-1000h, language-and-voice-lab/whisper-large-icelandic-30k-steps-1000h-ct2, language-and-voice-lab/whisper-large-icelandic-62640-steps-967h, language-and-voice-lab/whisper-large-icelandic-62640-steps-967h-ct2, sam8000/whisper-large-v3-turbo-icelandic-iceland-0.11-cer-filtered, FredrikKarlssonSpeech/whisper-large-icelandic-62640-steps-967h-mlx, FredrikKarlssonSpeech/whisper-large-icelandic-62640-steps-967h-mlx-4bit, Aalto-Speech-Synthesis/whisper-large-v3-Icelandic-finetuned-ct2, FredrikKarlssonSpeech/whisper-large-icelandic-62640-steps-967h-ggml
  - Sample: `[{"_id":"6427522b8044a068051c9654","id":"carlosdanielhernandezmena/whisper-large-icelandic-10k-steps-1000h","likes":10,"trendingScore":0,"private":false,"downloads":34,"tags":["transformers","pytorch","whisper","automati`
- PASS Common Voice lists Icelandic: `GET https://commonvoice.mozilla.org/api/v1/languages`
  - HTTP 200, 647 ms, application/json; charset=utf-8, CORS none
  - Sample: `[{"id":1,"name":"en","target_sentence_count":5000,"english_name":"English","native_name":"English","is_contributable":1,"is_translated":1,"text_direction":"LTR"},{"id":2,"name":"de","target_sentence_count":5000,"english_`

<a id="malvinnsla"></a>
### Málvinnsla (Árni Magnússon Institute: tagger, Nefnir lemmatizer, word splitting)

**Licence:** Not stated on the site.

**Recommendation: Build-time only; DMII Core as lemma fallback.** For tap-a-word in stories, annotate each token at build time with a DMII Core `beygingarmynd` lookup (lemma, word class and full paradigm) and resolve ambiguous tokens by hand in the story file. Retry `/tag` later for Nefnir lemmas. Skiptir works: optionally pre-compute soft hyphens for long words at build time.

Findings (2026-11-03):

- The HTTPS certificate does not match the host name, so only `http://` works. A page served over HTTPS (GitHub Pages) cannot call an `http://` API: browsers block it as mixed content.
- The OpenAPI spec is embedded in `/docs` (Redoc). It documents `POST /tag` (`{"text", "lemma", "expand_tag"}`: tokens with PoS tag, Nefnir lemma and expanded grammatical features) and `POST /ordskipting` (Skiptir hyphenation: `{"text", "hyphenation_mode": "pattern", "hyphen_type": "hard|soft|custom|split"}`). No auth. Pre-computed soft hyphens could help long compounds wrap on narrow phones.
- During manual testing `POST /tag` returned HTTP 500 for both JSON and form bodies.

Checks:

- FAIL HTTPS root: `GET https://malvinnsla.arnastofnun.is/`
  - HTTP -, 369 ms, no content-type, CORS -. Problem: TLS certificate does not match the host name
- PASS HTTP root: `GET http://malvinnsla.arnastofnun.is/`
  - HTTP 200, 241 ms, text/html; charset=utf-8, CORS *
  - Sample: `The Árni Magnússon Institute's language processing platform // wait for DOM to load document.addEventListener('DOMContentLoaded', function () { document.body.addEventListener('htmx:afterRequest', function (event) { var r`
- FAIL POST /tag (PoS tags and lemmas): `POST http://malvinnsla.arnastofnun.is/tag`
  - HTTP 500, 235 ms, text/html; charset=utf-8, CORS *, preflight pass. Problem: HTTP 500
  - Sample: `500 Internal Server Error Internal Server Error The server encountered an internal error and was unable to complete your request. Either the server is overloaded or there is an error in the application.`
- PASS POST /ordskipting (Skiptir hyphenation): `POST http://malvinnsla.arnastofnun.is/ordskipting`
  - HTTP 200, 189 ms, application/json, CORS *. Þjóð-minja-safn-ið er op-ið.
  - Sample: `{"hyphenated_text":"\u00dej\u00f3\u00f0-minja-safn-i\u00f0 er op-i\u00f0."}`

<a id="greynir"></a>
### GreynirCorrect (spelling and grammar checking)

**Licence:** MIT (Miðeind).

**Recommendation: Build-time.** Run GreynirCorrect from `validate-content` on every hand-authored Icelandic sentence and block on errors. A small self-hosted checking service for free-text answers stays optional for later.

Findings (2026-11-03):

- `yfirlestur.is` now redirects to Málfríður (`malstadur.mideind.is`), whose API access is by agreement with Miðeind. Do not depend on it.
- The library runs locally from PyPI (`pip install reynir-correct`). It needs Python 3.11 or newer.

Checks:

- PASS reynir-correct on PyPI: `GET https://pypi.org/pypi/reynir-correct/json`
  - HTTP 200, 131 ms, application/json, CORS *. version 4.2.0, requires Python >=3.11, MIT License
  - Sample: `{"info":{"author":null,"author_email":"\"Miðeind ehf.\" <mideind@mideind.is>","bugtrack_url":null,"classifiers":["Development Status :: 5 - Production/Stable","Intended Audience :: Developers","Intended Audience :: Scien`
- PASS yfirlestur.is redirect: `GET https://yfirlestur.is/`
  - HTTP 301, 397 ms, text/html; charset=UTF-8, CORS none. redirects to https://malstadur.mideind.is/malfridur
  - Sample: `301 Moved Permanently 301 Moved Permanently cloudflare`

<a id="korp"></a>
### Icelandic corpora in Korp (malheildir.arnastofnun.is)

**Licence:** Varies by subcorpus. Check before republishing any corpus sentence.

**Recommendation: Build-time.** Fetch a few short example sentences per lemma at build time when Tatoeba has none, and record corpus, document and licence for each. Not used live.

Findings (2026-11-03):

- The web UI's real backend is `https://malheildir.arnastofnun.is:1234` (found in the UI bundle; the Gothenburg URL in the same bundle is an inherited default with no Icelandic corpora).
- It hosts about 485 corpora: IGC21, IGC22 and IGC2410EXT (the Icelandic Gigaword Corpus), RMH2017 to RMH2019, MÍM, Old Icelandic sagas (FORN) and others. CQP queries such as `[lemma="hestur"]` work.
- The backend echoes the request origin in `Access-Control-Allow-Origin`. The UI host sends the header several times, which browsers reject, but that host is not an API. Port 1234 may be blocked on some networks.

Checks:

- PASS Web UI: `GET https://malheildir.arnastofnun.is/`
  - HTTP 200, 683 ms, text/html, CORS invalid (3 values)
  - Sample: `Korp You need JavaScript to run Korp.`
- PASS Backend /info (port 1234): `GET https://malheildir.arnastofnun.is:1234/info`
  - HTTP 200, 336 ms, application/json, CORS reflects any origin. 485 corpora, 376 IGC/RMH subcorpora
  - Sample: `{ "version": "8.2.5", "cqp_version": "CQP version 3.4.33", "corpora": [ "FORN_BANDAMANNA_SAGA_KONUNGSBOK", "FORN_BARDAR_SAGA_SNAEFELLSASS", "FORN_BJARNAR_SAGA_HITDAELAKAPPA", "FORN_BRENNU_NJALS_SAGA", "FORN_DROPLAUGARSON`
- PASS Lemma query [lemma="hestur"] in IGC21_BOOKS: `GET https://malheildir.arnastofnun.is:1234/query?corpus=IGC21_BOOKS&cqp=%5Blemma%3D%22hestur%22%5D&start=0&end=1&default_context=1%20sentence`
  - HTTP 200, 220 ms, application/json, CORS reflects any origin. 2533 hits
  - Sample: `{ "kwic": [ { "corpus": "IGC21_BOOKS", "match": { "position": 80206, "start": 45, "end": 46 }, "tokens": [ { "word": "En" }, { "word": "svo" }, { "word": "langar" }, { "word": "mig" }, { "word": "a\u00f0" }, { "word": "m`

<a id="freq"></a>
### Word frequency: Frequency lists for Icelandic 23.06 (CLARIN-IS)

**Licence:** CC BY 4.0.

**Recommendation: Build-time.** Order the core vocabulary by `giga_simple_freq.tsv`, filtered to common nouns, verbs, adjectives and function words, then grouped by theme. Credit CLARIN-IS on the credits page.

Findings (2026-11-03):

- Record hdl 20.500.12537/314 (issued 2023-06-01): `Frequency_lists.zip` (65.7 MB) with `giga_simple_freq.tsv` (Icelandic Gigaword Corpus), `mim_simple_freq.tsv` and `icepahc_simple_freq.tsv`. Columns: lemma, word class (with gender for nouns), frequency, sorted by frequency.
- Word classes are tag-set letters: `s` verb, `nk`/`nv`/`nh` masculine/feminine/neuter noun, `l` adjective, `f` pronoun, `a` adverb or preposition, `c` conjunction (for example `vera s`, `ár nh`, `maður nk`, `góður l`).

Checks:

- PASS CLARIN record 20.500.12537/314: `GET https://repository.clarin.is/repository/xmlui/handle/20.500.12537/314`
  - HTTP 200, 255 ms, text/html;charset=utf-8, CORS none. CC BY 4.0 stated on the record
  - Sample: `Frequency lists for Icelandic 23.06 Home Repository About CLARIN-IS CLARIN Login CLARIN-IS Repository Home View Item Show/Hide Menu What can you do? Browse All of the Repository Issue Date Authors Titles Subjects Publish`
- PASS Frequency_lists.zip (first bytes): `GET https://repository.clarin.is/repository/xmlui/bitstream/handle/20.500.12537/314/Frequency_lists.zip?sequence=1&isAllowed=y`
  - HTTP 200, 403 ms, application/zip, CORS none. 65.7 MB
  - Sample: `binary (application/zip), starts with 0x504b03041400`

<a id="ordbokene"></a>
### Ordbøkene (Bokmål and Nynorsk dictionaries, University of Bergen and Språkrådet)

**Licence:** Not verified here. Check the terms on ordbokene.no before redistributing any content.

**Recommendation: Build-time (Phase 7 stretch).** Build the cognate candidate list at build time: for each core lemma, map letters (þ to t or th, ð to d, ö to ø, æ to ae), look up candidates, store only the Bokmål lemma, its article id and a link, and mark every pair for human review.

Findings (2026-11-03):

- The JSON API at `https://ord.uib.no` works without an API key: article search (`/api/articles?w=&dict=bm,nn&scope=e`), suggestions (`/api/suggest`), and article JSON (`/{dict}/article/{id}.json`). CORS is open.

Checks:

- PASS Article search (hus, bm+nn): `GET https://ord.uib.no/api/articles?w=hus&dict=bm,nn&scope=e`
  - HTTP 200, 74 ms, application/json; charset=utf-8, CORS *. {"bm":[24627],"nn":[31964]}
  - Sample: `{"meta": {"bm": {"total": 1}, "nn": {"total": 1}}, "articles": {"bm": [24627], "nn": [31964]}}`
- PASS Article JSON (bm 24627): `GET https://ord.uib.no/bm/article/24627.json`
  - HTTP 200, 325 ms, application/json, CORS *. lemma: hus
  - Sample: `{"article_id": 24627, "submitted": "2026-04-24 12:40:45", "lemmas": [{"added_norm": false, "final_lexeme": "hus", "hgno": 0, "id": 29045, "inflection_class": "n1", "is_standard": true, "lemma": "hus", "mo_link": 0, "para`
- PASS Suggest (hus): `GET https://ord.uib.no/api/suggest?q=hus&dict=bm&n=5`
  - HTTP 200, 56 ms, application/json; charset=utf-8, CORS *
  - Sample: `{"q": "hus", "cnt": 21, "cmatch": 1, "a": {"exact": [["hus", ["bm"]], ["huse", ["bm"]], ["husj", ["bm"]], ["husk", ["bm"]], ["husar", ["bm"]]], "freetext": [["hus", ["bm"]], ["hús", ["bm"]], ["husa", ["bm"]], ["huse", ["`

<a id="commons"></a>
### Wikimedia Commons and Lingua Libre (human word recordings)

**Licence:** Per file, usually CC BY-SA 4.0 for Lingua Libre.

**Recommendation: Build-time.** Index recordings for course lemmas at build time (many overlap with Wiktionary audio), store the file URL, author and licence, and hotlink from `upload.wikimedia.org`.

Findings (2026-11-03):

- Per-file author and licence are available through the Commons API (`prop=imageinfo&iiprop=extmetadata`), which the credits page needs.

Checks:

- PASS Lingua Libre Icelandic recordings: `GET https://commons.wikimedia.org/w/api.php?action=query&prop=categoryinfo&titles=Category:Lingua_Libre_pronunciation-isl&format=json&origin=*`
  - HTTP 200, 395 ms, application/json; charset=utf-8, CORS *. 375 files
  - Sample: `{"batchcomplete":"","query":{"normalized":[{"from":"Category:Lingua_Libre_pronunciation-isl","to":"Category:Lingua Libre pronunciation-isl"}],"pages":{"115393573":{"pageid":115393573,"ns":14,"title":"Category:Lingua Libr`
- PASS Category: Icelandic pronunciation: `GET https://commons.wikimedia.org/w/api.php?action=query&prop=categoryinfo&titles=Category:Icelandic_pronunciation&format=json&origin=*`
  - HTTP 200, 422 ms, application/json; charset=utf-8, CORS *. 129 files, 12 subcategories
  - Sample: `{"batchcomplete":"","query":{"normalized":[{"from":"Category:Icelandic_pronunciation","to":"Category:Icelandic pronunciation"}],"pages":{"1255174":{"pageid":1255174,"ns":14,"title":"Category:Icelandic pronunciation","cat`

## Coverage of the bulk datasets

Measured 2026-11-03T17:56:39.301Z with `--coverage`. Downloaded files (cached in `.cache/`, never committed):

| File | Size | SHA-256 | Retrieved |
|---|---|---|---|
| `kaikki/kaikki.org-dictionary-Icelandic.jsonl` | 69.1 MB | `709541c6054b3d0b`... | 2026-11-03 |
| `tatoeba/isl_sentences_detailed.tsv.bz2` | 249 KB | `aeb0e4cd9eaa647b`... | 2026-11-03 |
| `tatoeba/isl-eng_links.tsv.bz2` | 62 KB | `5448935a5a12069e`... | 2026-11-03 |
| `tatoeba/isl-nob_links.tsv.bz2` | 1 KB | `39f186accc8175f8`... | 2026-11-03 |
| `tatoeba/sentences_with_audio.tar.bz2` | 6.1 MB | `492eb77db4af8f8f`... | 2026-11-03 |
| `clarin/Frequency_lists.zip` | 65.7 MB | `4407e11877cd2ef9`... | 2026-11-03 |

### Wiktionary (kaikki.org), Icelandic

- Entries: 25404 (23663 distinct words). Parts of speech: noun 15650, verb 3402, adj 2573, name 2092, adv 585, pron 255, num 152, phrase 137, intj 125, suffix 87.
- With IPA: 16631 entries (65.5%), 15310 words.
- With a recorded audio file: 117 entries (0.5%), 92 words, 96 distinct files.
- With an English gloss: 25384 entries (99.9%).
- With etymology text: 12519 entries; 391 mention Norwegian, Bokmål or Nynorsk (cognate hints).
- With inflected forms listed: 17630 entries.

### Tatoeba, Icelandic

- Sentences: 13390 by 68 authors.
- With an English translation: 10802 (80.7%). With a Norwegian Bokmål translation: 144 (1.1%).
- With audio: 0 (0.0%), from 0 speakers. Audio licences: none.
- `sentences_with_audio` columns detected: no Icelandic rows.

### Core vocabulary: frequency list against Wiktionary and Tatoeba

Most frequent lemmas in the Icelandic Gigaword Corpus (`giga_simple_freq.tsv`), lowercase words only (names, numbers and punctuation skipped). Sentence counts match any Wiktionary inflected form as a token, without disambiguation, so they are approximate.

| Top N lemmas | In Wiktionary | IPA | Audio | English gloss | 1+ Tatoeba sentence | 3+ sentences | 1+ sentence with English |
|---|---|---|---|---|---|---|---|
| 100 | 100 (100.0%) | 97 (97.0%) | 7 (7.0%) | 100 (100.0%) | 100 (100.0%) | 100 (100.0%) | 100 (100.0%) |
| 300 | 298 (99.3%) | 277 (92.3%) | 11 (3.7%) | 298 (99.3%) | 298 (99.3%) | 286 (95.3%) | 297 (99.0%) |
| 1000 | 959 (95.9%) | 881 (88.1%) | 29 (2.9%) | 959 (95.9%) | 899 (89.9%) | 784 (78.4%) | 885 (88.5%) |

- Top 300 lemmas with no Tatoeba sentence (2): króna, milljarður.
- Frequency list archive: Frequency lists for Icelandic/mim_simple_freq.tsv (9.6 MB), Frequency lists for Icelandic/icepahc_simple_freq.tsv (642 KB), Frequency lists for Icelandic/giga_simple_freq.tsv (146.1 MB). First rows: `vera	s	103440930` `að	c	93956809` `í	a	77368091` `og	c	77324392` `á	a	54630810`.
- Top 60 lemmas: vera (s), að (c), í (a), og (c), á (a), það (f), ég (f), sem (c), hafa (s), til (a), ekki (a), þessi (f), hann (f), en (c), um (a), með (a), við (a), fyrir (a), sá (f), hún (f), af (a), segja (s), verða (s), koma (s), allur (f), ár (nh), fara (s), þú (f), þá (a), eiga (s), frá (a), gera (s), sig (f), þar (a), svo (a), eftir (a), geta (s), mikill (l), taka (s), annar (f), eða (c), sinn (f), hver (f), þegar (c), fá (s), maður (nk), bara (a), góður (l), enginn (f), dagur (nk), fram (a), einhver (f), ef (c), mál (nh), upp (a), margur (l), nú (a), halda (s), eins (a), hjá (a).

### Sample audio URLs

| Check | HTTP | Time | CORS | Result |
|---|---|---|---|---|
| Wiktionary recording (Commons) `https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9f/LL-Q294_%28isl%29-Stupidmarxon-er.wav/LL-Q294_%28isl%29-Stupidmarxon-er.wav.mp3` | 200 | 329 ms | * | **PASS** (audio/mpeg) |

