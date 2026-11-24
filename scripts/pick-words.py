"""Helps choose the words of a new unit (docs/PLAN.md): for candidate lemmas, or for the lemmas that
would open up the most sentences, how common they are and how many Tatoeba sentences they bring.

    .venv/Scripts/python -I scripts/pick-words.py janúar febrúar sturta      # candidates
    .venv/Scripts/python -I scripts/pick-words.py --top 40                   # suggestions
    .venv/Scripts/python -I scripts/pick-words.py --max-words 14 --top 40    # A2: longer sentences
    npm run pick-words -- --top 40

For each word: its word classes in BÍN, its rank in the Icelandic Gigaword Corpus frequency list
(CLARIN-IS, cached in .cache/clarin), the Tatoeba sentences with an English translation that use it
(up to --max-words words), and how many of them it completes: sentences every other word of which
is a course word (data/lexicon.json) or a name. --top lists the words that complete the most, chosen
one after another, so each count is what the word adds after the ones above it.

Estimates: the real pool also drops sentences GreynirCorrect flags (about a sixth) and tells
homographs apart with the parser. Needs the .venv with GreynirCorrect (it brings the islenska
package, BÍN offline) and the downloads of npm run probe:coverage.
"""

import argparse
import bz2
import collections
import io
import json
import pathlib
import re
import sys
import zipfile

from islenska import Bin

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache'
WORD = re.compile(r'[^\W\d_]+')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)


def frequency_ranks(limit=60000):
    rank = {}
    with zipfile.ZipFile(CACHE / 'clarin/Frequency_lists.zip') as z:
        name = next(n for n in z.namelist() if n.endswith('giga_simple_freq.tsv'))
        with z.open(name) as f:
            for i, line in enumerate(io.TextIOWrapper(f, encoding='utf-8')):
                if i >= limit:
                    break
                parts = line.rstrip('\n').split('\t')
                if len(parts) >= 3:
                    rank.setdefault(parts[0].lower(), i + 1)
    return rank


def tatoeba_with_english():
    with_en = set()
    with bz2.open(CACHE / 'tatoeba/isl-eng_links.tsv.bz2', 'rt', encoding='utf-8') as f:
        for line in f:
            with_en.add(line.split('\t')[0])
    excluded = set(json.loads((ROOT / 'content/sentence-exclude.json').read_text(encoding='utf-8'))['sentences'])
    out = {}
    with bz2.open(CACHE / 'tatoeba/isl_sentences_detailed.tsv.bz2', 'rt', encoding='utf-8') as f:
        for line in f:
            p = line.rstrip('\n').split('\t')
            if len(p) >= 3 and p[0] in with_en and p[0] not in excluded:
                out[p[0]] = p[2]
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('words', nargs='*', help='candidate lemmas')
    ap.add_argument('--top', type=int, default=0, help='suggest this many words')
    ap.add_argument('--max-words', type=int, default=10, help='longest sentence, in words (10 for A1, 14 for A2)')
    ap.add_argument('--max-rank', type=int, default=15000, help='suggest only words this common')
    args = ap.parse_args()

    bin_ = Bin()
    lexicon = json.loads((ROOT / 'data/lexicon.json').read_text(encoding='utf-8'))
    known = {l['lemma'].lower() for l in lexicon['lemmas'].values()}
    names = {n.lower() for n in json.loads((ROOT / 'content/allowlist.json').read_text(encoding='utf-8'))['names']}
    rank = frequency_ranks()
    cache = {}

    def lemmas(form):
        if form not in cache:
            cache[form] = frozenset(m.ord.lower() for m in bin_.lookup(form)[1])
        return cache[form]

    rows = []
    for sid, text in tatoeba_with_english().items():
        toks = [(m.group(0), m.start()) for m in WORD.finditer(text)]
        if not toks or len(toks) > args.max_words:
            continue
        need = []
        for w, i in toks:
            low = w.lower()
            if low in names or (i > 0 and w[0].isupper()):
                continue
            ls = lemmas(low)
            if not ls:
                need = None
                break
            need.append(ls)
        if need is not None:
            rows.append((sid, text, need))

    def missing(need, have):
        return [ls for ls in need if not ls & have]

    print(f'{len(known)} course words by spelling ({len(lexicon["lemmas"])} in all); {sum(1 for _, _, need in rows if not missing(need, known))} of {len(rows)} Tatoeba sentences (up to {args.max_words} words) are readable now.\n')

    if args.words:
        print('| word | classes | frequency rank | sentences using it | it completes | example |')
        print('|---|---|---|---|---|---|')
        for w in args.words:
            lw = w.lower()
            classes = sorted({m.ofl for m in bin_.lookup(lw)[1] if m.ord.lower() == lw}) or ['not in BÍN']
            using = [(sid, text, need) for sid, text, need in rows if any(lw in ls for ls in need)]
            completes = [(sid, text) for sid, text, need in using if not missing(need, known | {lw})]
            example = f'{completes[0][1]} (#{completes[0][0]})' if completes else ''
            known_note = ' (course word)' if lw in known else ''
            print(f'| {w}{known_note} | {", ".join(classes)} | {rank.get(lw, "-")} | {len(using)} | {len(completes)} | {example} |')

    if args.top:
        have = set(known)
        print(f'\nSuggestions: the {args.top} words (among the {args.max_rank} most common) that complete the most sentences, one after another')
        print('| # | word | completes | frequency rank |')
        print('|---|---|---|---|')
        for n in range(1, args.top + 1):
            gain = collections.Counter()
            for _, _, need in rows:
                miss = missing(need, have)
                if len(miss) == 1:
                    for lm in miss[0]:
                        if rank.get(lm, 10**9) <= args.max_rank:
                            gain[lm] += 1
            if not gain:
                break
            best, g = gain.most_common(1)[0]
            have.add(best)
            print(f'| {n} | {best} | {g} | {rank.get(best)} |')


if __name__ == '__main__':
    main()
