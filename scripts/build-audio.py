"""Generates static Icelandic audio for TÖLVA with Piper (offline neural TTS).

Every course word and every sentence in data/sentences.json gets a small MP3 file, so the site
needs no speech service at runtime. Human recordings (data/audio.json) are still preferred by
the player; these files fill the gaps.

    .venv/Scripts/python scripts/build-audio.py                 # default voice, skips existing files
    .venv/Scripts/python scripts/build-audio.py --voice salka   # another voice
    .venv/Scripts/python scripts/build-audio.py --samples       # comparison set: every voice, a few sentences

Setup: .venv/Scripts/pip install piper-tts lameenc. Voices (CC BY 4.0, trained on the Talrómur
corpus, hdl.handle.net/20.500.12537/104) download from Hugging Face into .cache/piper/.
Piper itself (GPL-3.0) is only a build tool and is not part of the website.

Word timings for highlighting are estimates: the model gives no alignments, so each sentence's
duration is split over its words in proportion to their phoneme counts.
"""

import argparse
import datetime
import hashlib
import importlib.metadata
import io
import json
import pathlib
import re
import sys
import time
import urllib.request

import lameenc
from piper import PiperVoice, SynthesisConfig

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache' / 'piper'
OUT = ROOT / 'data' / 'audio'
VOICES = {
    'steinn': 'Steinn (male)',
    'salka': 'Salka (female)',
    'bui': 'Búi (male)',
    'ugla': 'Ugla (female)',
}
VOICE_BASE = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/is/is_IS'
BITRATE = 24
SAMPLE_SENTENCES = ['451938', '4171415', '707638', '3838979', '669468', '788039']
WORD = re.compile(r'[^\W\d_]+')
STRESS = re.compile(r'[ˈˌː#]')

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)


def model_path(voice):
    CACHE.mkdir(parents=True, exist_ok=True)
    for ext in ('onnx', 'onnx.json'):
        name = f'is_IS-{voice}-medium.{ext}'
        dest = CACHE / name
        if not dest.exists():
            print(f'downloading {name}')
            urllib.request.urlretrieve(f'{VOICE_BASE}/{voice}/medium/{name}', dest)
    return CACHE / f'is_IS-{voice}-medium.onnx'


def provenance(voice_id):
    """Where the voice model came from, for the manifest (as data/SOURCES.json does for data)."""
    files = []
    for ext in ('onnx', 'onnx.json'):
        name = f'is_IS-{voice_id}-medium.{ext}'
        path = CACHE / name
        files.append({
            'url': f'{VOICE_BASE}/{voice_id}/medium/{name}',
            'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        })
    return {
        'model': files,
        'corpus': 'Talrómur, Reykjavík University, hdl.handle.net/20.500.12537/104 (CC BY 4.0)',
        'tool': f'piper-tts {importlib.metadata.version("piper-tts")} (GPL-3.0, build tool only), lameenc {importlib.metadata.version("lameenc")}',
        'settings': f'MP3 {BITRATE} kbps mono',
        'generated': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
    }


def encode_mp3(pcm, rate):
    enc = lameenc.Encoder()
    enc.set_bit_rate(BITRATE)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm) + enc.flush()


def synthesize(voice, text):
    pcm = b''
    phonemes = []
    rate = 22050
    for chunk in voice.synthesize(text, SynthesisConfig()):
        pcm += chunk.audio_int16_bytes
        rate = chunk.sample_rate
        phonemes.extend(chunk.phonemes or [])
    return pcm, rate, ''.join(phonemes)


def word_timings(text, phonemes, duration):
    """[start, end] per word of the text, in seconds, from phoneme counts per word."""
    words = WORD.findall(text)
    groups = [g for g in STRESS.sub('', phonemes).replace('?', ' ').replace('.', ' ').replace(',', ' ').replace('!', ' ').split() if g]
    weights = [len(g) for g in groups] if len(groups) == len(words) else [len(w) for w in words]
    pause = 0.08 * duration
    usable = max(duration - pause, 0.1)
    total = sum(weights) or 1
    out, t = [], pause / 2
    for wgt in weights:
        span = usable * wgt / total
        out.append([round(t, 2), round(t + span, 2)])
        t += span
    return out


def file_key(kind, ident):
    return f'{kind}/{hashlib.sha1(ident.encode("utf-8")).hexdigest()[:12]}.mp3'


def build(voice_id, force=False, limit=None):
    voice = PiperVoice.load(str(model_path(voice_id)))
    lexicon = json.loads((ROOT / 'data/lexicon.json').read_text(encoding='utf-8'))
    sentences = json.loads((ROOT / 'data/sentences.json').read_text(encoding='utf-8'))['sentences']
    pairs = json.loads((ROOT / 'content/minimal-pairs.json').read_text(encoding='utf-8'))['pairs'] if (ROOT / 'content/minimal-pairs.json').exists() else []
    items = {}
    for lid, entry in lexicon['lemmas'].items():
        items[entry['lemma']] = ('w', lid)
    for pair in pairs:
        for w in pair['words']:
            items.setdefault(w, ('w', f'pair:{w}'))
    for sid, s in sentences.items():
        items[s['is']] = ('s', sid)
    manifest_path = OUT / f'tts-{voice_id}.json'
    old = json.loads(manifest_path.read_text(encoding='utf-8'))['texts'] if manifest_path.exists() else {}
    texts = {}
    done = 0
    started = time.time()
    for text, (kind, ident) in list(items.items())[: limit or None]:
        rel = f'tts/{voice_id}/{file_key(kind, ident)}'
        dest = OUT / rel
        if not force and dest.exists() and text in old:
            texts[text] = old[text]
            continue
        pcm, rate, phonemes = synthesize(voice, text)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(encode_mp3(pcm, rate))
        duration = round(len(pcm) / 2 / rate, 2)
        entry = {'f': rel, 'd': duration}
        if kind == 's':
            entry['w'] = word_timings(text, phonemes, duration)
        texts[text] = entry
        done += 1
        if done % 100 == 0:
            print(f'  {done} new files, {time.time() - started:.0f} s')
    manifest = {
        'version': 1,
        'voice': voice_id,
        'name': VOICES[voice_id],
        'engine': 'Piper (rhasspy/piper-voices, is_IS medium)',
        'license': 'CC BY 4.0 (voice trained on the Talrómur corpus)',
        'credit': f'Synthetic voice {VOICES[voice_id]}: Piper, trained on Talrómur (Reykjavík University, CC BY 4.0, hdl.handle.net/20.500.12537/104).',
        'note': 'Word timings (w) are estimates from phoneme counts. Sentence audio speaks Tatoeba sentences (CC BY 2.0 FR); their authors are listed in data/sentences.json.',
        'source': provenance(voice_id),
        'bytes': 0,
        'texts': texts,
    }
    # A short hash of each file's bytes, which the player adds to the file's URL (?v=), so a file
    # rendered again under the same name (a new model, --force) is not served from an old cache.
    for entry in texts.values():
        entry['v'] = hashlib.sha1((OUT / entry['f']).read_bytes()).hexdigest()[:8]
    removed = 0
    if not limit:
        used = {e['f'] for e in texts.values()}
        for f in (OUT / 'tts' / voice_id).rglob('*.mp3'):
            if f.relative_to(OUT).as_posix() not in used:
                f.unlink()
                removed += 1
    size = sum(p.stat().st_size for p in (OUT / 'tts' / voice_id).rglob('*.mp3'))
    manifest['bytes'] = size
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f'{voice_id}: {len(texts)} texts, {done} generated now, {removed} unused files removed, {size / 1e6:.1f} MB of audio')


def samples():
    sentences = json.loads((ROOT / 'data/sentences.json').read_text(encoding='utf-8'))['sentences']
    out = {'sentences': [], 'voices': {}}
    for sid in SAMPLE_SENTENCES:
        if sid in sentences:
            out['sentences'].append({'id': sid, 'is': sentences[sid]['is'], 'en': sentences[sid]['en'][0], 'author': sentences[sid]['author']})
    for voice_id, name in VOICES.items():
        voice = PiperVoice.load(str(model_path(voice_id)))
        files = []
        for s in out['sentences']:
            pcm, rate, _ = synthesize(voice, s['is'])
            rel = f'samples/{voice_id}-{s["id"]}.mp3'
            (OUT / rel).parent.mkdir(parents=True, exist_ok=True)
            (OUT / rel).write_bytes(encode_mp3(pcm, rate))
            files.append(rel)
        out['voices'][voice_id] = {'name': name, 'files': files}
        print(f'samples for {voice_id} done')
    (OUT / 'samples.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--voice', default='steinn', choices=list(VOICES))
    ap.add_argument('--samples', action='store_true')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--limit', type=int)
    a = ap.parse_args()
    if a.samples:
        samples()
    else:
        build(a.voice, a.force, a.limit)
