#!/usr/bin/env node
// TÖLVA Phase 0 probe.
// Checks every external API and dataset the course may use (HTTP status, latency, a response
// sample, CORS and preflight) and writes docs/api-report.md.
//
//   node scripts/probe-apis.mjs              quick probe, about 50 small requests
//   node scripts/probe-apis.mjs --coverage   also downloads bulk files into .cache/ (about 150 MB)
//                                            and measures IPA, audio, gloss and sentence coverage
//   node scripts/probe-apis.mjs --coverage --refresh   download the bulk files again
//
// TOLVA_CACHE=/some/dir moves the download cache, for example out of a synced folder.
// Reading Tatoeba exports needs a `bzip2` binary (macOS and Linux ship one; Git for Windows too).

import { createReadStream, existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { CACHE, ROOT, bunzipBuffer, bunzipLines, download, openZip } from './lib/bulk.mjs';

const REPORT = path.join(ROOT, 'docs', 'api-report.md');
const COVERAGE_FILE = path.join(CACHE, 'coverage.json');

const ORIGIN = 'http://localhost:8080';
const PAGES_ORIGIN = 'https://kaufmannfredrik.github.io';
const UA = 'TOLVA-probe/0.1 (+https://github.com/KaufmannFredrik/duo-dupe-icelandic)';
const TIMEOUT_MS = 20_000;
const CONCURRENCY = 3;
const FINDINGS_DATE = '2026-11-03';

const args = new Set(process.argv.slice(2));
const WANT_COVERAGE = args.has('--coverage');
const REFRESH = args.has('--refresh');

const TATOEBA = 'https://downloads.tatoeba.org/exports';
const KAIKKI_IS = 'https://kaikki.org/dictionary/Icelandic/kaikki.org-dictionary-Icelandic.jsonl';
const FREQ_ZIP = 'https://repository.clarin.is/repository/xmlui/bitstream/handle/20.500.12537/314/Frequency_lists.zip?sequence=1&isAllowed=y';
const KORP = 'https://malheildir.arnastofnun.is:1234';

const log = (...xs) => console.error(...xs);
const json = (obj) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });
const mb = (bytes) => {
  if (!bytes) return 'unknown size';
  const n = Number(bytes);
  return n < 1_048_576 ? `${Math.ceil(n / 1024)} KB` : `${(n / 1_048_576).toFixed(1)} MB`;
};
// Size as sent; fetch asks for gzip, so a compressed transfer is labeled as such.
const sizeOf = (res) => `${mb(res.headers.get('content-length'))}${res.headers.get('content-encoding') ? ` (${res.headers.get('content-encoding')} transfer)` : ''}`;
const pct = (n, total) => (total ? `${((100 * n) / total).toFixed(1)}%` : 'n/a');
const pass = (rs, re) => rs.some((r) => re.test(r.name) && r.ok);

// ---------------------------------------------------------------------------------------------
// Sources. `findings` are facts verified by hand on FINDINGS_DATE; `checks` are re-run every time;
// `recommend` turns the live results into a strategy.
// ---------------------------------------------------------------------------------------------

function paradigmInfo(text) {
  const d = JSON.parse(text);
  const w = Array.isArray(d) ? d[0] : d;
  if (!w?.bmyndir) return `list of ${d.length} matches`;
  const sample = w.bmyndir.slice(0, 4).map((f) => `${f.g}=${f.b}`).join(', ');
  return `${w.ord} (${w.ofl}${w.kyn ? ` ${w.kyn}` : ''}): ${w.bmyndir.length} forms, e.g. ${sample}`;
}

const SOURCES = [
  {
    id: 'bin',
    title: 'BÍN, Database of Icelandic Morphology (DMII Core API and bulk data)',
    license: 'CC BY-SA 4.0. The DMII Core may be published on the web free of charge, unmodified, with credit.',
    findings: [
      'The official **DMII Core REST API** (`https://bin.arnastofnun.is/api/`) returns full paradigms as JSON: `ord/{lemma}`, `ord/{guid}`, `ord/{wordclass}/{lemma}`, `beygingarmynd/{form}` and `beygingarmynd/{wordclass}/{form}`, with `*` and `_` as wildcards. When several words match, it returns a list of guids instead of a paradigm.',
      'The DMII Core (BÍN-kjarninn, about 58,000 words) is the prescriptive subset "designed ... especially for use in schools and for learners" and "created to be used for third party publication". Its licence page (`/DMII/dmii-core/licence/`) says it is open for everyone, that third parties may publish the data on the web free of charge but must not modify it and must give credit, and that it is CC BY-SA 4.0.',
      'The bulk language-technology files (`BIN_ordmyndir.txt.zip`, `SHsnid.csv.zip` in Sigrún\'s format, `KRISTINsnid.csv.zip`, `Storasnid_allt.zip` and others, listed at `/django/api/nidurhal/`) cannot be downloaded directly. `/gogn/mimisbrunnur/` is a form (email address plus reCAPTCHA) that emails a download link.',
      'The bulk files have **conflicting licence texts**. `/DMII/LTdata/conditions/` and `/gogn/skilmalar/` say CC BY-SA 4.0, but the English Download page `/DMII/LTdata/data/` still shows older terms: no distribution to third parties, no publication of paradigms, and no paradigm-producing software without a special contract. The LT overview also says this data "is not suitable for reproduction of the DMII paradigms" and points to the DMII Core API for that.',
      'Tag set with Icelandic and English explanations: `https://bin.arnastofnun.is/data/tags.csv` (semicolon separated).',
      'Required credit line: "Beygingarlýsing íslensks nútímamáls. Stofnun Árna Magnússonar í íslenskum fræðum. Höfundur og ritstjóri Kristín Bjarnadóttir." with a link to https://bin.arnastofnun.is, and a note of any changes made.',
    ],
    checks: [
      { name: 'DMII Core API index', url: 'https://bin.arnastofnun.is/api/', sampleBytes: 64_000, expect: { contains: /"endpoints"/ }, info: (t) => `endpoints: ${Object.keys(JSON.parse(t).endpoints).join(', ')}` },
      { name: 'Paradigm by lemma (hestur)', url: 'https://bin.arnastofnun.is/api/ord/hestur', sampleBytes: 256_000, expect: { contains: /"bmyndir"/ }, info: paradigmInfo },
      { name: 'Paradigm by inflected form (hestsins)', url: 'https://bin.arnastofnun.is/api/beygingarmynd/hestsins', sampleBytes: 256_000, expect: { contains: /"ord":"hestur"/ }, info: paradigmInfo },
      { name: 'Non-ASCII form in URL (stúlkunni)', url: `https://bin.arnastofnun.is/api/beygingarmynd/${encodeURIComponent('stúlkunni')}`, sampleBytes: 256_000, expect: { contains: /"ord":"stúlka"/ }, info: paradigmInfo },
      { name: 'Verb by word class (so/koma)', url: 'https://bin.arnastofnun.is/api/ord/so/koma', sampleBytes: 256_000, expect: { contains: /"bmyndir"/ }, info: paradigmInfo },
      { name: 'Ambiguous lemma returns a list (koma)', url: 'https://bin.arnastofnun.is/api/ord/koma', sampleBytes: 256_000, expect: { contains: /"guid"/ }, info: (t) => { const d = JSON.parse(t); return d[0]?.bmyndir ? 'single paradigm' : `${d.length} matches: ${d.map((x) => `${x.ord} (${[x.ofl, x.kyn].filter(Boolean).join(' ')})`).join(', ')}`; } },
      { name: 'Tag set CSV', url: 'https://bin.arnastofnun.is/data/tags.csv', sampleBytes: 256_000, text: true, expect: { contains: /Word class;tag/ }, info: (t) => `${t.trim().split('\n').length - 3} tag rows` },
      { name: 'Bulk data file list', url: 'https://bin.arnastofnun.is/django/api/nidurhal/', sampleBytes: 64_000, expect: { contains: /"files"/ }, info: (t) => JSON.parse(t).files.map((f) => `${f.file} (${f.size.trim()})`).join(', ') },
      { name: 'DMII Core licence page', url: 'https://bin.arnastofnun.is/django/api/pages/?url=/DMII/dmii-core/licence/', sampleBytes: 64_000, expect: { contains: /CC BY-SA 4\.0/ } },
      { name: 'Bulk data conditions page', url: 'https://bin.arnastofnun.is/django/api/pages/?url=/DMII/LTdata/conditions/', sampleBytes: 64_000, expect: { contains: /CC BY-SA 4\.0/ } },
      { name: 'Bulk Download page terms', url: 'https://bin.arnastofnun.is/django/api/pages/?url=/DMII/LTdata/data/', sampleBytes: 64_000, info: (t) => (/not allowed/.test(t) ? 'still shows the older restrictive terms (conflict persists)' : 'older restrictive terms no longer shown') },
    ],
    recommend: (rs) =>
      pass(rs, /^Paradigm by lemma/) && pass(rs, /^Paradigm by inflected/)
        ? { strategy: 'Build-time, plus optional live lookups', text: 'In Phase 2, fetch the paradigm of every course lemma from the DMII Core API (one request at a time, cached in `.cache/`) and store it unmodified (the same forms and tags inside a compact JSON wrapper) in `/data` with the required credit. The dictionary view may also query the API live for words outside the cached set, since CORS is open, with an IndexedDB cache and a polite failure message. Do not build paradigms from the bulk files. The bulk word-form list is optional (validate-content can check tokens against the cached Core paradigms) and would need the owner to request it and accept the conflicting terms.' }
        : { strategy: 'Blocked', text: 'The DMII Core API did not answer as expected. Re-run the probe; if it stays down, the form generator cannot be built.' },
  },
  {
    id: 'ylhyra',
    title: 'Ylhýra inflection API (third-party wrapper over BÍN)',
    license: 'Software MIT; data from BÍN (CC BY-SA 4.0). Terms and rate limits not published.',
    findings: [
      'Results include the BÍN id, a nested or flat paradigm, and a per-form `should_be_taught` flag that may help decide which variants to teach.',
      'Fuzzy search (`&fuzzy=true`) returned `{"results": null}` for an inflected form (`hesti`) during manual testing.',
    ],
    checks: [
      { name: 'Exact search (hestur)', url: 'https://ylhyra.is/api/inflection?search=hestur', sampleBytes: 256_000, expect: { contains: /"base_word"/ }, info: (t) => { const r = JSON.parse(t).results ?? []; return `${r.length} results: ${r.map((x) => `${x.base_word} [${x.word_categories.join(' ')}] id ${x.BIN_id}`).join('; ')}`; } },
      { name: 'Paradigm by id (flat)', url: 'https://ylhyra.is/api/inflection?id=6179&type=flat', sampleBytes: 256_000, expect: { contains: /hestur/ } },
    ],
    recommend: (rs) => ({ strategy: rs.some((r) => r.ok) ? 'Optional fallback only' : 'Skip', text: 'Not needed: the official DMII Core API answers the same questions with open CORS. Keep it documented as a fallback for the dictionary view; do not call it from the client by default.' }),
  },
  {
    id: 'kaikki',
    title: 'Wiktionary via kaikki.org (glosses, IPA, etymology, audio)',
    license: 'CC BY-SA 4.0 (and GFDL). Audio files on Wikimedia Commons carry per-file licences.',
    findings: [
      'The per-language Icelandic file (about 69 MB) is still served but marked **DEPRECATED** ("will be removed in the near future", wiktextract issue #1178).',
      'The fallback is the full raw dump (`https://kaikki.org/dictionary/raw-wiktextract-data.jsonl.gz`, all languages, many gigabytes uncompressed) filtered by `lang_code == "is"`.',
    ],
    checks: [
      { name: 'Icelandic JSONL (first 4 KB)', url: KAIKKI_IS, text: true, expect: { contains: /"lang": ?"Icelandic"/ }, info: (_t, res) => `${sizeOf(res)}, last modified ${res.headers.get('last-modified') ?? 'unknown'}` },
      { name: 'Icelandic index page', url: 'https://kaikki.org/dictionary/Icelandic/index.html', sampleBytes: 128_000, info: (t) => (/DEPRECATED/.test(t) ? 'per-language file marked DEPRECATED' : 'no deprecation notice') },
      { name: 'Raw wiktextract dump (fallback)', url: 'https://kaikki.org/dictionary/raw-wiktextract-data.jsonl.gz', expect: { magic: '\x1f\x8b' }, info: (_t, res) => sizeOf(res) },
    ],
    recommend: (rs) =>
      pass(rs, /^Icelandic JSONL/)
        ? { strategy: 'Build-time', text: 'Download the per-language file now while it exists, pin its SHA-256 in `data/SOURCES.json`, and extract glosses, IPA, etymology and Commons audio file names for course lemmas. If it disappears, switch to stream-filtering the raw dump. Capture per-file audio licences from Commons for the credits page.' }
        : { strategy: 'Build-time (raw dump)', text: 'The per-language file is gone. Stream-filter the raw dump by `lang_code == "is"`.' },
  },
  {
    id: 'tatoeba',
    title: 'Tatoeba (example sentences and sentence audio)',
    license: 'Sentence text CC BY 2.0 FR (attribution required). Audio licence varies per recording.',
    findings: [
      'There is no stable public API. `api.tatoeba.org/unstable/...` answers, but it is explicitly unstable; do not depend on it.',
      'Per-language exports exist for Icelandic (`isl_sentences.tsv.bz2`, `isl_sentences_detailed.tsv.bz2`, and pair files such as `isl-eng_links.tsv.bz2` and `isl-nob_links.tsv.bz2`). The audio list is only published globally (`sentences_with_audio.tar.bz2`).',
      'The old audio URL pattern `https://audio.tatoeba.org/sentences/{lang}/{id}.mp3` is dead. The current pattern is `https://tatoeba.org/{ui-lang}/audio/download/{audio_id}`, keyed by audio id (from `sentences_with_audio`), not sentence id.',
      'Measured with `--coverage` and cross-checked with `comm`: **none** of the Icelandic sentences has a recording in `sentences_with_audio.csv` (1.24 million rows, all languages). Tatoeba is a text source only for Icelandic.',
    ],
    checks: [
      { name: 'Downloads page', url: 'https://tatoeba.org/en/downloads' },
      { name: 'isl_sentences_detailed.tsv.bz2', url: `${TATOEBA}/per_language/isl/isl_sentences_detailed.tsv.bz2`, expect: { magic: 'BZh' }, info: (_t, res) => sizeOf(res) },
      { name: 'isl-eng_links.tsv.bz2', url: `${TATOEBA}/per_language/isl/isl-eng_links.tsv.bz2`, expect: { magic: 'BZh' }, info: (_t, res) => sizeOf(res) },
      { name: 'isl-nob_links.tsv.bz2', url: `${TATOEBA}/per_language/isl/isl-nob_links.tsv.bz2`, expect: { magic: 'BZh' }, info: (_t, res) => sizeOf(res) },
      { name: 'sentences_with_audio.tar.bz2 (all languages)', url: `${TATOEBA}/sentences_with_audio.tar.bz2`, expect: { magic: 'BZh' }, info: (_t, res) => sizeOf(res) },
      { name: 'Audio, current URL pattern', url: 'https://tatoeba.org/en/audio/download/1', expect: { type: 'audio/' } },
      { name: 'Audio, old URL pattern (audio.tatoeba.org)', url: 'https://audio.tatoeba.org/sentences/isl/1.mp3', expect: { type: 'audio/' } },
      { name: 'Unstable JSON API', url: 'https://api.tatoeba.org/unstable/sentences?lang=isl&sort=random&limit=1', sampleBytes: 64_000, expect: { contains: /"data"/ }, info: (t) => `sample: ${JSON.parse(t).data?.[0]?.text ?? '?'}` },
    ],
    recommend: (rs) =>
      pass(rs, /^isl_sentences/)
        ? { strategy: 'Build-time', text: 'Use the bulk exports. Keep sentence id and author for every sentence shown (CC BY 2.0 FR attribution), and per-recording username and licence for any audio. Icelandic sentence audio must come from elsewhere (Piper at build time, or browser TTS).' }
        : { strategy: 'Blocked', text: 'The Icelandic export did not download. Re-run later.' },
  },
  {
    id: 'tiro',
    title: 'Tiro TTS (tts.tiro.is)',
    license: 'Server code Apache 2.0 (github.com/icelandic-lt/tiro-tts). Service terms unknown.',
    findings: [
      'During manual testing every path on `tts.tiro.is` answered `404 page not found`, including the documented `POST /v0/speech`, `GET /v0/voices`, the OpenAPI docs and the preflight. The public instance looks decommissioned or moved; no notice was found.',
      'The code can still be self-hosted with Docker, but that needs a server, which this static site does not have.',
    ],
    checks: [
      { name: 'Docs root', url: 'https://tts.tiro.is/' },
      { name: 'Voice list', url: 'https://tts.tiro.is/v0/voices' },
      { name: 'Synthesize MP3 (Alfur)', url: 'https://tts.tiro.is/v0/speech', method: 'POST', preflight: true, ...json({ Engine: 'standard', LanguageCode: 'is-IS', OutputFormat: 'mp3', Text: 'Halló, ég heiti Tala.', VoiceId: 'Alfur' }), expect: { type: 'audio/' } },
      { name: 'Speech marks (word timings)', url: 'https://tts.tiro.is/v0/speech', method: 'POST', preflight: true, ...json({ Engine: 'standard', LanguageCode: 'is-IS', OutputFormat: 'json', SpeechMarkTypes: ['word'], Text: 'Halló, ég heiti Tala.', VoiceId: 'Alfur' }), expect: { contains: /"time"/ } },
    ],
    recommend: (rs) =>
      pass(rs, /^Synthesize/)
        ? { strategy: 'Live, with cache', text: 'Tiro answered. Use it as step 2 of the audio chain with an IndexedDB cache, and re-check terms before pre-generating files.' }
        : { strategy: 'Unavailable: skip', text: 'Do not build on Tiro. Revised audio chain: (1) human recordings (Wiktionary/Commons, Lingua Libre, Tatoeba), (2) static audio pre-generated at build time with the open Piper voices (see below), (3) browser `speechSynthesis` with an `is-IS` voice. Word-level highlighting then needs another timing source (browser `boundary` events where available, or an estimate).' },
  },
  {
    id: 'grammatek',
    title: 'Grammatek TTS endpoint (seen in third-party code)',
    license: 'Unknown.',
    findings: [],
    checks: [{ name: 'Voice list', url: 'https://api.grammatek.com/tts/v0/voices' }],
    recommend: (rs) => (rs[0].ok ? { strategy: 'Investigate', text: 'The host answered; check auth and terms before use.' } : { strategy: 'Unavailable: skip', text: 'The host does not resolve.' }),
  },
  {
    id: 'piper',
    title: 'Piper Icelandic voices (offline TTS, build-time candidate)',
    license: 'Voices trained on Talrómur (CC BY 4.0). Engine licence to confirm in Phase 4.',
    findings: [
      'Not in the original brief; found while looking for a Tiro replacement. `rhasspy/piper-voices` has four Icelandic voices (`is_IS`: bui, salka, steinn, ugla; medium quality, 22.05 kHz). Each model card cites the Talrómur corpus (hdl 20.500.12537/104), which CLARIN lists as CC BY 4.0.',
      'Piper runs offline on a laptop, so every course sentence and word could be pre-generated into small static audio files at build time: no runtime API, works offline, redistributable with credit. Quality must be judged by ear and by a native speaker.',
      'The original `rhasspy/piper` engine is MIT; its maintained successor is GPL-3.0. Either way it is only a build tool and is not shipped with the site.',
    ],
    checks: [
      { name: 'Icelandic voices on Hugging Face', url: 'https://huggingface.co/api/models/rhasspy/piper-voices/tree/main/is/is_IS', sampleBytes: 64_000, expect: { contains: /steinn/ }, info: (t) => JSON.parse(t).map((x) => x.path.split('/').pop()).join(', ') },
      { name: 'Voice config (steinn, medium)', url: 'https://huggingface.co/rhasspy/piper-voices/resolve/main/is/is_IS/steinn/medium/is_IS-steinn-medium.onnx.json', sampleBytes: 64_000, text: true, expect: { contains: /sample_rate/ } },
      { name: 'Voice model card cites Talrómur', url: 'https://huggingface.co/rhasspy/piper-voices/resolve/main/is/is_IS/steinn/medium/MODEL_CARD', text: true, expect: { contains: /20\.500\.12537\/104/ } },
      { name: 'Talrómur licence (CLARIN record)', url: 'https://repository.clarin.is/repository/xmlui/handle/20.500.12537/104', sampleBytes: 1_500_000, expect: { contains: /CC BY 4\.0/ } },
    ],
    recommend: (rs) =>
      rs.every((r) => r.ok)
        ? { strategy: 'Build-time (Phase 4 candidate)', text: 'Pre-generate audio for every course item with one or two Piper voices, at normal and slow speed, as small Opus or MP3 files in `/data/audio`. Credit Talrómur (CC BY 4.0) and the voice. Ask a native speaker to rate a sample before committing to it.' }
        : { strategy: 'Investigate', text: 'Some Piper or Talrómur checks failed; re-check before relying on it.' },
  },
  {
    id: 'asr',
    title: 'Speech recognition (speaking exercises)',
    license: 'Varies.',
    findings: [
      'Browser `SpeechRecognition` cannot be probed from Node. It is effectively Chrome-only and must be detected at runtime, including whether `is-IS` works.',
      'Icelandic Whisper fine-tunes exist on Hugging Face (for example `language-and-voice-lab/whisper-large-icelandic-*`), but they need a GPU server. Not usable on a static site.',
      'Common Voice lists Icelandic, and its clips are CC0, but dataset downloads now need an account on the Mozilla Data Collective. Samrómur (CC BY 4.0) is on CLARIN. Neither is a hosted ASR service.',
    ],
    checks: [
      { name: 'Tiro Speech (speech.tiro.is)', url: 'https://speech.tiro.is/' },
      { name: 'Icelandic Whisper models on Hugging Face', url: 'https://huggingface.co/api/models?search=whisper-large-icelandic&limit=10', sampleBytes: 128_000, expect: { contains: /"id"/ }, info: (t) => JSON.parse(t).map((m) => m.id).join(', ') },
      { name: 'Common Voice lists Icelandic', url: 'https://commonvoice.mozilla.org/api/v1/languages', sampleBytes: 400_000, expect: { contains: /"name":"is"/ } },
    ],
    recommend: (rs) =>
      pass(rs, /^Tiro Speech/)
        ? { strategy: 'Investigate', text: 'speech.tiro.is answered; check its API and terms.' }
        : { strategy: 'Browser-only, flagged (Phase 6)', text: 'No hosted public Icelandic ASR was found. Phase 6 can only use browser `SpeechRecognition` where it supports `is-IS` (runtime detection, feature flag, "Did we understand you?" wording). Otherwise skip speaking.' },
  },
  {
    id: 'malvinnsla',
    title: 'Málvinnsla (Árni Magnússon Institute: tagger, Nefnir lemmatizer, word splitting)',
    license: 'Not stated on the site.',
    findings: [
      'The HTTPS certificate does not match the host name, so only `http://` works. A page served over HTTPS (GitHub Pages) cannot call an `http://` API: browsers block it as mixed content.',
      'The OpenAPI spec is embedded in `/docs` (Redoc). It documents `POST /tag` (`{"text", "lemma", "expand_tag"}`: tokens with PoS tag, Nefnir lemma and expanded grammatical features) and `POST /ordskipting` (Skiptir hyphenation: `{"text", "hyphenation_mode": "pattern", "hyphen_type": "hard|soft|custom|split"}`). No auth. Pre-computed soft hyphens could help long compounds wrap on narrow phones.',
      'During manual testing `POST /tag` returned HTTP 500 for both JSON and form bodies.',
    ],
    checks: [
      { name: 'HTTPS root', url: 'https://malvinnsla.arnastofnun.is/' },
      { name: 'HTTP root', url: 'http://malvinnsla.arnastofnun.is/' },
      { name: 'POST /tag (PoS tags and lemmas)', url: 'http://malvinnsla.arnastofnun.is/tag', method: 'POST', preflight: true, sampleBytes: 64_000, ...json({ text: 'Ég heiti Anna og bý í Reykjavík.', lemma: true, expand_tag: true }), expect: { contains: /"lemma"/ }, info: (t) => JSON.parse(t).sentences.flat().map((x) => `${x.word}/${x.lemma}`).join(' ') },
      { name: 'POST /ordskipting (Skiptir hyphenation)', url: 'http://malvinnsla.arnastofnun.is/ordskipting', method: 'POST', sampleBytes: 64_000, ...json({ text: 'Þjóðminjasafnið er opið.', hyphenation_mode: 'pattern', hyphen_type: 'hard' }), expect: { contains: /"hyphenated_text"/ }, info: (t) => JSON.parse(t).hyphenated_text },
    ],
    recommend: (rs) => {
      const hyphen = pass(rs, /^POST \/ordskipting/) ? ' Skiptir works: optionally pre-compute soft hyphens for long words at build time.' : '';
      return pass(rs, /^POST \/tag/)
        ? { strategy: 'Build-time only', text: `Use \`/tag\` at build time to pre-lemmatize story texts. It cannot be called from the deployed HTTPS site.${hyphen}` }
        : { strategy: 'Build-time only; DMII Core as lemma fallback', text: `For tap-a-word in stories, annotate each token at build time with a DMII Core \`beygingarmynd\` lookup (lemma, word class and full paradigm) and resolve ambiguous tokens by hand in the story file. Retry \`/tag\` later for Nefnir lemmas.${hyphen}` };
    },
  },
  {
    id: 'greynir',
    title: 'GreynirCorrect (spelling and grammar checking)',
    license: 'MIT (Miðeind).',
    findings: [
      '`yfirlestur.is` now redirects to Málfríður (`malstadur.mideind.is`), whose API access is by agreement with Miðeind. Do not depend on it.',
      'The library runs locally from PyPI (`pip install reynir-correct`). It needs Python 3.11 or newer.',
    ],
    checks: [
      { name: 'reynir-correct on PyPI', url: 'https://pypi.org/pypi/reynir-correct/json', sampleBytes: 3_000_000, expect: { contains: /"info"/ }, info: (t) => { const i = JSON.parse(t).info; return `version ${i.version}, requires Python ${i.requires_python}, ${(i.license ?? '').split('\n')[0]}`; } },
      { name: 'yfirlestur.is redirect', url: 'https://yfirlestur.is/', redirect: 'manual', expect: { status: [301, 302, 307, 308] }, info: (_t, res) => `redirects to ${res.headers.get('location')}` },
    ],
    recommend: (rs) => ({ strategy: pass(rs, /PyPI/) ? 'Build-time' : 'Investigate', text: 'Run GreynirCorrect from `validate-content` on every hand-authored Icelandic sentence and block on errors. A small self-hosted checking service for free-text answers stays optional for later.' }),
  },
  {
    id: 'korp',
    title: 'Icelandic corpora in Korp (malheildir.arnastofnun.is)',
    license: 'Varies by subcorpus. Check before republishing any corpus sentence.',
    findings: [
      'The web UI\'s real backend is `https://malheildir.arnastofnun.is:1234` (found in the UI bundle; the Gothenburg URL in the same bundle is an inherited default with no Icelandic corpora).',
      'It hosts about 485 corpora: IGC21, IGC22 and IGC2410EXT (the Icelandic Gigaword Corpus), RMH2017 to RMH2019, MÍM, Old Icelandic sagas (FORN) and others. CQP queries such as `[lemma="hestur"]` work.',
      'The backend echoes the request origin in `Access-Control-Allow-Origin`. The UI host sends the header several times, which browsers reject, but that host is not an API. Port 1234 may be blocked on some networks.',
    ],
    checks: [
      { name: 'Web UI', url: 'https://malheildir.arnastofnun.is/' },
      { name: 'Backend /info (port 1234)', url: `${KORP}/info`, sampleBytes: 1_000_000, expect: { contains: /"corpora"/ }, info: (t) => { const c = JSON.parse(t).corpora; const igc = c.filter((x) => /^(IGC|RMH)/.test(x)).length; return `${c.length} corpora, ${igc} IGC/RMH subcorpora`; } },
      { name: 'Lemma query [lemma="hestur"] in IGC21_BOOKS', url: `${KORP}/query?corpus=IGC21_BOOKS&cqp=${encodeURIComponent('[lemma="hestur"]')}&start=0&end=1&default_context=${encodeURIComponent('1 sentence')}`, sampleBytes: 1_000_000, expect: { contains: /"kwic"/ }, info: (t) => `${JSON.parse(t).hits} hits` },
    ],
    recommend: (rs) =>
      pass(rs, /^Lemma query/)
        ? { strategy: 'Build-time', text: 'Fetch a few short example sentences per lemma at build time when Tatoeba has none, and record corpus, document and licence for each. Not used live.' }
        : { strategy: 'Skip for now', text: 'The Korp backend did not answer; rely on Tatoeba.' },
  },
  {
    id: 'freq',
    title: 'Word frequency: Frequency lists for Icelandic 23.06 (CLARIN-IS)',
    license: 'CC BY 4.0.',
    findings: [
      'Record hdl 20.500.12537/314 (issued 2023-06-01): `Frequency_lists.zip` (65.7 MB) with `giga_simple_freq.tsv` (Icelandic Gigaword Corpus), `mim_simple_freq.tsv` and `icepahc_simple_freq.tsv`. Columns: lemma, word class (with gender for nouns), frequency, sorted by frequency.',
      'Word classes are tag-set letters: `s` verb, `nk`/`nv`/`nh` masculine/feminine/neuter noun, `l` adjective, `f` pronoun, `a` adverb or preposition, `c` conjunction (for example `vera s`, `ár nh`, `maður nk`, `góður l`).',
    ],
    checks: [
      { name: 'CLARIN record 20.500.12537/314', url: 'https://repository.clarin.is/repository/xmlui/handle/20.500.12537/314', sampleBytes: 1_500_000, expect: { contains: /Frequency_lists\.zip/ }, info: (t) => (/CC BY 4\.0|Attribution 4\.0/.test(t) ? 'CC BY 4.0 stated on the record' : 'licence text not found') },
      { name: 'Frequency_lists.zip (first bytes)', url: FREQ_ZIP, expect: { magic: 'PK' }, info: (_t, res) => sizeOf(res) },
    ],
    recommend: (rs) => ({ strategy: rs.every((r) => r.ok) ? 'Build-time' : 'Investigate', text: 'Order the core vocabulary by `giga_simple_freq.tsv`, filtered to common nouns, verbs, adjectives and function words, then grouped by theme. Credit CLARIN-IS on the credits page.' }),
  },
  {
    id: 'ordbokene',
    title: 'Ordbøkene (Bokmål and Nynorsk dictionaries, University of Bergen and Språkrådet)',
    license: 'Not verified here. Check the terms on ordbokene.no before redistributing any content.',
    findings: [
      'The JSON API at `https://ord.uib.no` works without an API key: article search (`/api/articles?w=&dict=bm,nn&scope=e`), suggestions (`/api/suggest`), and article JSON (`/{dict}/article/{id}.json`). CORS is open.',
    ],
    checks: [
      { name: 'Article search (hus, bm+nn)', url: 'https://ord.uib.no/api/articles?w=hus&dict=bm,nn&scope=e', sampleBytes: 64_000, expect: { contains: /"articles"/ }, info: (t) => JSON.stringify(JSON.parse(t).articles) },
      { name: 'Article JSON (bm 24627)', url: 'https://ord.uib.no/bm/article/24627.json', sampleBytes: 256_000, text: true, expect: { contains: /"lemmas"/ }, info: (t) => `lemma: ${JSON.parse(t).lemmas?.[0]?.lemma}` },
      { name: 'Suggest (hus)', url: 'https://ord.uib.no/api/suggest?q=hus&dict=bm&n=5', sampleBytes: 64_000, expect: { contains: /"exact"/ } },
    ],
    recommend: (rs) => ({ strategy: rs.some((r) => r.ok) ? 'Build-time (Phase 7 stretch)' : 'Skip', text: 'Build the cognate candidate list at build time: for each core lemma, map letters (þ to t or th, ð to d, ö to ø, æ to ae), look up candidates, store only the Bokmål lemma, its article id and a link, and mark every pair for human review.' }),
  },
  {
    id: 'commons',
    title: 'Wikimedia Commons and Lingua Libre (human word recordings)',
    license: 'Per file, usually CC BY-SA 4.0 for Lingua Libre.',
    findings: [
      'Per-file author and licence are available through the Commons API (`prop=imageinfo&iiprop=extmetadata`), which the credits page needs.',
    ],
    checks: [
      { name: 'Lingua Libre Icelandic recordings', url: 'https://commons.wikimedia.org/w/api.php?action=query&prop=categoryinfo&titles=Category:Lingua_Libre_pronunciation-isl&format=json&origin=*', sampleBytes: 64_000, expect: { contains: /"files"/ }, info: (t) => { const p = Object.values(JSON.parse(t).query.pages)[0]; return `${p.categoryinfo.files} files`; } },
      { name: 'Category: Icelandic pronunciation', url: 'https://commons.wikimedia.org/w/api.php?action=query&prop=categoryinfo&titles=Category:Icelandic_pronunciation&format=json&origin=*', sampleBytes: 64_000, expect: { contains: /"files"/ }, info: (t) => { const p = Object.values(JSON.parse(t).query.pages)[0]; return `${p.categoryinfo.files} files, ${p.categoryinfo.subcats} subcategories`; } },
    ],
    recommend: (rs) => ({ strategy: rs.some((r) => r.ok) ? 'Build-time' : 'Skip', text: 'Index recordings for course lemmas at build time (many overlap with Wiktionary audio), store the file URL, author and licence, and hotlink from `upload.wikimedia.org`.' }),
  },
];

// ---------------------------------------------------------------------------------------------
// HTTP checks
// ---------------------------------------------------------------------------------------------

function request(check, origin) {
  return fetch(check.url, {
    method: check.method ?? 'GET',
    headers: { 'User-Agent': UA, Origin: origin, ...check.headers },
    body: check.body,
    redirect: check.redirect ?? 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

// Reads at most `max` bytes and cancels the rest, so multi-gigabyte files are never downloaded.
async function readSome(res, max) {
  if (!res.body) return Buffer.alloc(0);
  const reader = res.body.getReader();
  const chunks = [];
  let n = 0;
  try {
    while (n < max) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      n += value.length;
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  return Buffer.concat(chunks).subarray(0, max);
}

function corsLabel(headers, origin) {
  const acao = headers.get('access-control-allow-origin');
  if (!acao) return 'none';
  const values = acao.split(',').map((v) => v.trim());
  if (values.length > 1) return `invalid (${values.length} values)`;
  if (values[0] === '*') return '*';
  if (values[0] === origin) return 'reflects origin';
  return `other origin (${values[0]})`;
}

function errorText(e) {
  if (e?.name === 'TimeoutError') return `timeout after ${TIMEOUT_MS / 1000} s`;
  const code = e?.cause?.code;
  if (code === 'ENOTFOUND') return 'DNS lookup failed (host not found)';
  if (code === 'ERR_TLS_CERT_ALTNAME_INVALID') return 'TLS certificate does not match the host name';
  if (code) return `${code}${e.cause.message ? `: ${e.cause.message}` : ''}`;
  return e?.message ?? String(e);
}

function evaluate(expect, res, buf, text) {
  const statusOk = expect.status ? [expect.status].flat().includes(res.status) : res.ok;
  if (!statusOk) return `HTTP ${res.status}`;
  if (expect.magic && buf.subarray(0, expect.magic.length).toString('latin1') !== expect.magic) return 'unexpected file signature';
  const type = res.headers.get('content-type') ?? '';
  if (expect.type && !type.startsWith(expect.type)) return `content-type is ${type || 'missing'}`;
  if (expect.contains && !expect.contains.test(text)) return `response does not match ${expect.contains}`;
  return null;
}

function sample(buf, type, forceText) {
  if (!buf.length) return '(empty body)';
  if (!forceText && !/json|text|xml|csv|javascript|html/i.test(type)) {
    return `binary (${type || 'no content-type'}), starts with 0x${buf.subarray(0, 6).toString('hex')}`;
  }
  let s = buf.toString('utf8');
  if (/html/i.test(type)) s = s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');
  return s.replace(/\s+/g, ' ').trim().slice(0, 220);
}

async function preflight(check) {
  try {
    const res = await fetch(check.url, {
      method: 'OPTIONS',
      headers: { 'User-Agent': UA, Origin: ORIGIN, 'Access-Control-Request-Method': check.method, 'Access-Control-Request-Headers': 'content-type' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    await res.body?.cancel();
    const cors = corsLabel(res.headers, ORIGIN);
    const methods = res.headers.get('access-control-allow-methods') ?? '';
    const allowHeaders = res.headers.get('access-control-allow-headers') ?? '';
    const ok = res.ok && (cors === '*' || cors === 'reflects origin') && /\*|POST/i.test(methods) && /\*|content-type/i.test(allowHeaders);
    return { ok, status: res.status, cors };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}

// A server that echoes the origin might do so only for an allowlist; try the GitHub Pages origin.
async function recheckOrigin(check) {
  try {
    const res = await request(check, PAGES_ORIGIN);
    await res.body?.cancel();
    return corsLabel(res.headers, PAGES_ORIGIN) === 'reflects origin' ? 'reflects any origin' : 'localhost only';
  } catch {
    return 'reflects origin';
  }
}

async function runCheck(check, sourceId) {
  const r = { source: sourceId, name: check.name, method: check.method ?? 'GET', url: check.url, ok: false };
  const t0 = performance.now();
  try {
    const res = await request(check, ORIGIN);
    r.ms = Math.round(performance.now() - t0);
    r.status = res.status;
    if (res.redirected) r.finalUrl = res.url;
    r.contentType = res.headers.get('content-type') ?? '';
    r.cors = corsLabel(res.headers, ORIGIN);
    const buf = await readSome(res, check.sampleBytes ?? 4096);
    const text = buf.toString('utf8');
    r.sample = sample(buf, r.contentType, check.text);
    r.problem = evaluate(check.expect ?? {}, res, buf, text);
    r.ok = !r.problem;
    if (r.ok && check.info) {
      try {
        r.info = check.info(text, res);
      } catch (e) {
        r.info = `could not read details: ${e.message}`;
      }
    }
    if (r.cors === 'reflects origin') r.cors = await recheckOrigin(check);
    if (check.preflight) r.preflight = await preflight(check);
  } catch (e) {
    r.ms = Math.round(performance.now() - t0);
    r.problem = errorText(e);
  }
  return r;
}

async function mapPool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

// ---------------------------------------------------------------------------------------------
// Coverage (--coverage): bulk downloads into .cache/, then measurements
// ---------------------------------------------------------------------------------------------

const BULK = [
  { key: 'kaikki', rel: 'kaikki/kaikki.org-dictionary-Icelandic.jsonl', url: KAIKKI_IS },
  { key: 'sentences', rel: 'tatoeba/isl_sentences_detailed.tsv.bz2', url: `${TATOEBA}/per_language/isl/isl_sentences_detailed.tsv.bz2` },
  { key: 'eng', rel: 'tatoeba/isl-eng_links.tsv.bz2', url: `${TATOEBA}/per_language/isl/isl-eng_links.tsv.bz2` },
  { key: 'nob', rel: 'tatoeba/isl-nob_links.tsv.bz2', url: `${TATOEBA}/per_language/isl/isl-nob_links.tsv.bz2` },
  { key: 'audio', rel: 'tatoeba/sentences_with_audio.tar.bz2', url: `${TATOEBA}/sentences_with_audio.tar.bz2` },
  { key: 'freq', rel: 'clarin/Frequency_lists.zip', url: FREQ_ZIP },
];

function* tarEntries(buf) {
  const field = (start, len) => buf.toString('utf8', start, start + len).replace(/\0[\s\S]*$/, '');
  for (let p = 0; p + 512 <= buf.length; ) {
    const name = field(p, 100);
    if (!name) break;
    const size = parseInt(field(p + 124, 12).trim(), 8) || 0;
    const prefix = field(p + 345, 155);
    yield { name: prefix ? `${prefix}/${name}` : name, data: buf.subarray(p + 512, p + 512 + size) };
    p += 512 + Math.ceil(size / 512) * 512;
  }
}

async function wiktionaryCoverage(file) {
  const words = new Map();
  const pos = {};
  const audioFiles = new Set();
  const s = { entries: 0, ipaEntries: 0, audioEntries: 0, glossEntries: 0, etymologyEntries: 0, norwegianInEtymology: 0, formEntries: 0, sampleAudioUrl: null };
  for await (const line of createInterface({ input: createReadStream(file), crlfDelay: Infinity })) {
    if (!line.trim()) continue;
    const e = JSON.parse(line);
    s.entries++;
    pos[e.pos] = (pos[e.pos] ?? 0) + 1;
    const w = words.get(e.word) ?? { ipa: false, audio: false, gloss: false, forms: new Set() };
    const sounds = e.sounds ?? [];
    if (sounds.some((x) => x.ipa)) {
      s.ipaEntries++;
      w.ipa = true;
    }
    const recordings = sounds.filter((x) => x.ogg_url || x.mp3_url);
    if (recordings.length) {
      s.audioEntries++;
      w.audio = true;
      for (const x of recordings) audioFiles.add(x.audio ?? x.ogg_url ?? x.mp3_url);
      s.sampleAudioUrl ??= recordings[0].mp3_url ?? recordings[0].ogg_url;
    }
    if (e.senses?.some((x) => x.glosses?.length)) {
      s.glossEntries++;
      w.gloss = true;
    }
    if (e.etymology_text) {
      s.etymologyEntries++;
      if (/Norwegian|Bokmål|Nynorsk/.test(e.etymology_text)) s.norwegianInEtymology++;
    }
    const forms = (e.forms ?? []).map((f) => f.form).filter((f) => /^\p{L}+$/u.test(f ?? ''));
    if (forms.length) s.formEntries++;
    for (const f of forms) w.forms.add(f.toLowerCase());
    words.set(e.word, w);
  }
  const count = (k) => [...words.values()].filter((w) => w[k]).length;
  Object.assign(s, { distinctWords: words.size, ipaWords: count('ipa'), audioWords: count('audio'), glossWords: count('gloss'), audioFiles: audioFiles.size });
  s.topPos = Object.entries(pos).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return { stats: s, words };
}

async function tatoebaCoverage(files) {
  const sentences = new Map();
  const authors = new Set();
  for await (const line of bunzipLines(files.sentences)) {
    const [id, lang, text, user] = line.split('\t');
    if (lang !== 'isl') continue;
    sentences.set(id, text);
    if (user && user !== '\\N') authors.add(user);
  }
  const linked = async (file) => {
    const ids = new Set();
    for await (const line of bunzipLines(file)) {
      const [a] = line.split('\t');
      if (sentences.has(a)) ids.add(a);
    }
    return ids;
  };
  const eng = await linked(files.eng);
  const nob = await linked(files.nob);

  const audio = new Map();
  const licences = {};
  const speakers = new Set();
  let columns = null;
  for (const entry of tarEntries(await bunzipBuffer(files.audio))) {
    if (!/\.(csv|tsv)$/.test(entry.name)) continue;
    for (const line of entry.data.toString('utf8').split('\n')) {
      const c = line.replace(/\r$/, '').split('\t');
      if (!sentences.has(c[0])) continue;
      // Current format: sentence_id, audio_id, username, license, attribution_url. Older: no audio_id.
      const hasAudioId = /^\d+$/.test(c[1] ?? '');
      columns ??= hasAudioId ? 'sentence_id, audio_id, username, license, attribution_url' : 'sentence_id, username, license, attribution_url';
      const rec = hasAudioId ? { audioId: c[1], user: c[2], licence: c[3] } : { audioId: null, user: c[1], licence: c[2] };
      const licence = rec.licence && rec.licence !== '\\N' ? rec.licence : '(blank)';
      licences[licence] = (licences[licence] ?? 0) + 1;
      speakers.add(rec.user);
      if (!audio.has(c[0])) audio.set(c[0], rec);
    }
  }
  const firstAudio = [...audio.values()].find((r) => r.audioId);
  return {
    sentences,
    eng,
    stats: {
      sentences: sentences.size,
      authors: authors.size,
      withEnglish: eng.size,
      withBokmal: nob.size,
      withAudio: audio.size,
      audioSpeakers: speakers.size,
      audioLicences: licences,
      audioColumns: columns,
      sampleAudioId: firstAudio?.audioId ?? null,
    },
  };
}

async function frequencyTop(file, n) {
  const zip = await openZip(file);
  const entry = zip.entries.find((e) => e.name.endsWith('giga_simple_freq.tsv'));
  if (!entry) throw new Error(`giga_simple_freq.tsv not found (entries: ${zip.entries.map((e) => e.name).join(', ')})`);
  const head = [];
  const lemmas = [];
  const seen = new Set();
  const input = zip.stream(entry);
  const rl = createInterface({ input, crlfDelay: Infinity });
  for await (const line of rl) {
    if (head.length < 5) head.push(line);
    const [lemma, cat, freq] = line.split('\t');
    // Lowercase letters only: skips names, numbers, punctuation and any header row.
    if (!lemma || !/^\p{Ll}+$/u.test(lemma) || !Number.isFinite(Number(freq)) || seen.has(lemma)) continue;
    seen.add(lemma);
    lemmas.push({ lemma, cat, freq: Number(freq) });
    if (lemmas.length >= n) break;
  }
  rl.close();
  input.destroy();
  const files = zip.entries.filter((e) => !e.name.endsWith('/'));
  return { entries: files.map((e) => `${e.name} (${mb(e.size)})`), head, lemmas };
}

// Approximate: a lemma "has a sentence" when any of its Wiktionary inflected forms appears as a
// token in a Tatoeba sentence. No disambiguation, so homographs inflate the counts slightly.
function coreCoverage(lemmas, wikt, tat) {
  const index = new Map();
  for (const [id, text] of tat.sentences) {
    for (const tok of new Set(text.toLowerCase().split(/[^\p{L}]+/u))) {
      if (!tok) continue;
      if (!index.has(tok)) index.set(tok, []);
      index.get(tok).push(id);
    }
  }
  const rows = lemmas.map(({ lemma }) => {
    const w = wikt.words.get(lemma);
    const ids = new Set();
    for (const f of new Set([lemma, ...(w?.forms ?? [])])) for (const id of index.get(f) ?? []) ids.add(id);
    return { lemma, wikt: Boolean(w), ipa: Boolean(w?.ipa), audio: Boolean(w?.audio), gloss: Boolean(w?.gloss), sentences: ids.size, withEnglish: [...ids].filter((id) => tat.eng.has(id)).length };
  });
  const summarize = (n) => {
    const r = rows.slice(0, n);
    const c = (f) => r.filter(f).length;
    return { n: r.length, wiktionary: c((x) => x.wikt), ipa: c((x) => x.ipa), audio: c((x) => x.audio), gloss: c((x) => x.gloss), sentence1: c((x) => x.sentences >= 1), sentence3: c((x) => x.sentences >= 3), sentenceEnglish: c((x) => x.withEnglish >= 1) };
  };
  return {
    top100: summarize(100),
    top300: summarize(300),
    top1000: summarize(1000),
    top300NoSentence: rows.slice(0, 300).filter((x) => !x.sentences).map((x) => x.lemma),
    top300NoAudio: rows.slice(0, 300).filter((x) => !x.audio).length,
  };
}

async function measureCoverage() {
  await mkdir(CACHE, { recursive: true });
  const files = {};
  const manifest = [];
  for (const b of BULK) {
    manifest.push(await download(b.url, b.rel, { refresh: REFRESH }));
    files[b.key] = path.join(CACHE, b.rel);
  }
  log('measuring Wiktionary coverage');
  const wikt = await wiktionaryCoverage(files.kaikki);
  log('measuring Tatoeba coverage');
  const tat = await tatoebaCoverage(files);
  log('reading the frequency list');
  const freq = await frequencyTop(files.freq, 1000);
  const core = coreCoverage(freq.lemmas, wikt, tat);
  const audioChecks = [];
  if (wikt.stats.sampleAudioUrl) audioChecks.push({ name: 'Wiktionary recording (Commons)', url: wikt.stats.sampleAudioUrl, expect: { type: 'audio/' } });
  if (tat.stats.sampleAudioId) audioChecks.push({ name: 'Tatoeba Icelandic recording', url: `https://tatoeba.org/en/audio/download/${tat.stats.sampleAudioId}`, expect: { type: 'audio/' } });
  return {
    generated: new Date().toISOString(),
    files: manifest,
    wiktionary: wikt.stats,
    tatoeba: tat.stats,
    frequency: { entries: freq.entries, head: freq.head, top: freq.lemmas.slice(0, 60).map((x) => `${x.lemma} (${x.cat})`) },
    core,
    audioChecks: await mapPool(audioChecks, 2, (c) => runCheck(c, 'coverage')),
  };
}

// ---------------------------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------------------------

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ');
const code = (s) => `\`${String(s).replace(/`/g, "'")}\``;

function corsSummary(rs) {
  const live = rs.filter((r) => r.ok);
  if (!live.length) return 'n/a (nothing passed)';
  return [...new Set(live.map((r) => (r.url.startsWith('http:') ? 'HTTP only (mixed content)' : r.cors)))].join(', ');
}

function resultCell(r) {
  if (!r.ok) return `**FAIL**: ${cell(r.problem)}`;
  return r.info ? `**PASS**: ${cell(r.info).slice(0, 160)}` : '**PASS**';
}

function renderCoverage(cov) {
  const L = [];
  const w = cov.wiktionary;
  const t = cov.tatoeba;
  L.push('## Coverage of the bulk datasets', '');
  L.push(`Measured ${cov.generated} with \`--coverage\`. Downloaded files (cached in \`.cache/\`, never committed):`, '');
  L.push('| File | Size | SHA-256 | Retrieved |', '|---|---|---|---|');
  for (const f of cov.files) L.push(`| ${code(f.file)} | ${mb(f.bytes)} | ${code(f.sha256.slice(0, 16))}... | ${f.retrieved.slice(0, 10)} |`);
  L.push('', '### Wiktionary (kaikki.org), Icelandic', '');
  L.push(`- Entries: ${w.entries} (${w.distinctWords} distinct words). Parts of speech: ${w.topPos.map(([p, n]) => `${p} ${n}`).join(', ')}.`);
  L.push(`- With IPA: ${w.ipaEntries} entries (${pct(w.ipaEntries, w.entries)}), ${w.ipaWords} words.`);
  L.push(`- With a recorded audio file: ${w.audioEntries} entries (${pct(w.audioEntries, w.entries)}), ${w.audioWords} words, ${w.audioFiles} distinct files.`);
  L.push(`- With an English gloss: ${w.glossEntries} entries (${pct(w.glossEntries, w.entries)}).`);
  L.push(`- With etymology text: ${w.etymologyEntries} entries; ${w.norwegianInEtymology} mention Norwegian, Bokmål or Nynorsk (cognate hints).`);
  L.push(`- With inflected forms listed: ${w.formEntries} entries.`, '');
  L.push('### Tatoeba, Icelandic', '');
  L.push(`- Sentences: ${t.sentences} by ${t.authors} authors.`);
  L.push(`- With an English translation: ${t.withEnglish} (${pct(t.withEnglish, t.sentences)}). With a Norwegian Bokmål translation: ${t.withBokmal} (${pct(t.withBokmal, t.sentences)}).`);
  L.push(`- With audio: ${t.withAudio} (${pct(t.withAudio, t.sentences)}), from ${t.audioSpeakers} speakers. Audio licences: ${Object.entries(t.audioLicences).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}.`);
  L.push(`- \`sentences_with_audio\` columns detected: ${t.audioColumns ?? 'no Icelandic rows'}.`, '');
  L.push('### Core vocabulary: frequency list against Wiktionary and Tatoeba', '');
  L.push('Most frequent lemmas in the Icelandic Gigaword Corpus (`giga_simple_freq.tsv`), lowercase words only (names, numbers and punctuation skipped). Sentence counts match any Wiktionary inflected form as a token, without disambiguation, so they are approximate.', '');
  L.push('| Top N lemmas | In Wiktionary | IPA | Audio | English gloss | 1+ Tatoeba sentence | 3+ sentences | 1+ sentence with English |', '|---|---|---|---|---|---|---|---|');
  for (const k of ['top100', 'top300', 'top1000']) {
    const r = cov.core[k];
    const c = (n) => `${n} (${pct(n, r.n)})`;
    L.push(`| ${r.n} | ${c(r.wiktionary)} | ${c(r.ipa)} | ${c(r.audio)} | ${c(r.gloss)} | ${c(r.sentence1)} | ${c(r.sentence3)} | ${c(r.sentenceEnglish)} |`);
  }
  L.push('', `- Top 300 lemmas with no Tatoeba sentence (${cov.core.top300NoSentence.length}): ${cov.core.top300NoSentence.slice(0, 60).join(', ') || 'none'}${cov.core.top300NoSentence.length > 60 ? ', ...' : ''}.`);
  L.push(`- Frequency list archive: ${cov.frequency.entries.join(', ')}. First rows: ${cov.frequency.head.map(code).join(' ')}.`);
  L.push(`- Top 60 lemmas: ${cov.frequency.top.join(', ')}.`, '');
  if (cov.audioChecks.length) {
    L.push('### Sample audio URLs', '', '| Check | HTTP | Time | CORS | Result |', '|---|---|---|---|---|');
    for (const r of cov.audioChecks) L.push(`| ${cell(r.name)} ${code(r.url)} | ${r.status ?? '-'} | ${r.ms ?? '-'} ms | ${cell(r.cors ?? '-')} | ${resultCell(r)} (${cell(r.contentType)}) |`);
    L.push('');
  }
  return L;
}

function renderReport(results, coverage) {
  const L = [];
  const bySource = (id) => results.filter((r) => r.source === id);
  const passed = results.filter((r) => r.ok).length;
  L.push('# TÖLVA: API and dataset probe report', '');
  L.push(`Generated ${new Date().toISOString()} by \`node scripts/probe-apis.mjs\` on Node ${process.version}. ${passed} of ${results.length} checks passed.`, '');
  L.push(`Every request sends \`Origin: ${ORIGIN}\`. When a server echoes that origin back, the request is repeated with \`Origin: ${PAGES_ORIGIN}\` to see whether a GitHub Pages deployment would also be allowed. POST endpoints also get a CORS preflight (\`OPTIONS\` with \`content-type\`).`, '');
  L.push(`This file is generated; edit \`scripts/probe-apis.mjs\` instead. "Findings" were verified by hand on ${FINDINGS_DATE}; the check tables are live results from the run above.`, '');
  L.push('CORS legend: `*` means any origin; `reflects any origin` means the server echoes whatever origin is sent; `none` means no CORS header, so browsers cannot read the response (fine for build-time use); `HTTP only (mixed content)` means a page served over HTTPS cannot call it.', '');

  L.push('## Summary', '', '| Source | Checks passed | Browser CORS (passing checks) | Recommended strategy |', '|---|---|---|---|');
  const recs = new Map(SOURCES.map((s) => [s.id, s.recommend(bySource(s.id))]));
  for (const s of SOURCES) {
    const rs = bySource(s.id);
    L.push(`| [${cell(s.title)}](#${s.id}) | ${rs.filter((r) => r.ok).length}/${rs.length} | ${cell(corsSummary(rs))} | ${cell(recs.get(s.id).strategy)} |`);
  }

  L.push('', '## All checks', '', '| # | Source | Check | HTTP | Time | CORS | Preflight | Result |', '|---|---|---|---|---|---|---|---|');
  results.forEach((r, i) => {
    const pre = r.preflight ? (r.preflight.ok ? `pass (${r.preflight.status})` : `fail (${r.preflight.error ?? `HTTP ${r.preflight.status}, CORS ${r.preflight.cors}`})`) : '-';
    L.push(`| ${i + 1} | ${r.source} | ${cell(r.name)} | ${r.status ?? '-'} | ${r.ms ?? '-'} ms | ${cell(r.cors ?? '-')} | ${cell(pre)} | ${resultCell(r)} |`);
  });

  L.push('', '## Details and recommendations', '');
  for (const s of SOURCES) {
    const rec = recs.get(s.id);
    L.push(`<a id="${s.id}"></a>`, `### ${s.title}`, '');
    L.push(`**Licence:** ${s.license}`, '');
    L.push(`**Recommendation: ${rec.strategy}.** ${rec.text}`, '');
    if (s.findings.length) {
      L.push(`Findings (${FINDINGS_DATE}):`, '');
      for (const f of s.findings) L.push(`- ${f}`);
      L.push('');
    }
    L.push('Checks:', '');
    for (const r of bySource(s.id)) {
      const where = `${r.method} ${r.url}${r.finalUrl ? ` (redirected to ${r.finalUrl})` : ''}`;
      L.push(`- ${r.ok ? 'PASS' : 'FAIL'} ${cell(r.name)}: ${code(where)}`);
      L.push(`  - HTTP ${r.status ?? '-'}, ${r.ms ?? '-'} ms, ${r.contentType || 'no content-type'}, CORS ${r.cors ?? '-'}${r.preflight ? `, preflight ${r.preflight.ok ? 'pass' : 'fail'}` : ''}${r.problem ? `. Problem: ${r.problem}` : ''}${r.info ? `. ${r.info}` : ''}`);
      if (r.sample) L.push(`  - Sample: ${code(r.sample)}`);
    }
    L.push('');
  }

  if (coverage) L.push(...renderCoverage(coverage));
  else L.push('## Coverage of the bulk datasets', '', 'Not measured yet. Run `node scripts/probe-apis.mjs --coverage` (downloads about 150 MB into `.cache/`).', '');
  return `${L.join('\n')}\n`;
}

// ---------------------------------------------------------------------------------------------

async function main() {
  const work = SOURCES.flatMap((s) => s.checks.map((c) => ({ c, id: s.id })));
  log(`probing ${work.length} endpoints, ${CONCURRENCY} at a time`);
  const results = await mapPool(work, CONCURRENCY, async ({ c, id }) => {
    const r = await runCheck(c, id);
    log(`${r.ok ? 'PASS' : 'FAIL'}  ${id.padEnd(11)} ${c.name}${r.ok ? '' : `: ${r.problem}`}`);
    return r;
  });

  await mkdir(CACHE, { recursive: true });
  let coverage = null;
  if (WANT_COVERAGE) {
    coverage = await measureCoverage();
    await writeFile(COVERAGE_FILE, JSON.stringify(coverage, null, 2));
  } else if (existsSync(COVERAGE_FILE)) {
    coverage = JSON.parse(await readFile(COVERAGE_FILE, 'utf8'));
  }

  await writeFile(path.join(CACHE, 'probe-results.json'), JSON.stringify(results, null, 2));
  await mkdir(path.dirname(REPORT), { recursive: true });
  await writeFile(REPORT, renderReport(results, coverage));
  log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed. Report written to ${path.relative(ROOT, REPORT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
