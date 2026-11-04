"""Lemma and word class of every word in a sentence, from the Greynir parser (reynir, MIT, Miðeind).

Reads JSON lines {"id": ..., "text": ...} on stdin and writes JSON lines on stdout:
    {"id": ..., "parsed": true,  "tokens": [{"t": "afar", "l": "afar", "c": "eo"}, ...]}
when every sentence in the text parsed, otherwise
    {"id": ..., "parsed": false, "tokens": [{"t": "afar", "m": [["afi", "kk"], ["afar", "ao"]]}, ...]}
where "m" lists every BÍN meaning of the word form (lemma, word class), without choosing one.
scripts/build-tags.mjs turns this into data/tags.json.

Setup: the same .venv as scripts/lint-icelandic.py (pip install reynir-correct installs reynir).
"""

import io
import json
import sys

from reynir import Greynir


def meanings(tok):
    out = set()
    for m in tok.val if isinstance(tok.val, list) else []:
        stofn = getattr(m, "stofn", None)
        ofl = getattr(m, "ordfl", None) or getattr(m, "ofl", None)
        if isinstance(stofn, str) and isinstance(ofl, str):
            out.add((stofn, ofl))
    return sorted(out)


def tag(g, text):
    parsed_tokens, raw_tokens, all_parsed = [], [], True
    for sent in g.submit(text):
        ok = sent.parse()
        if ok and sent.terminals:
            parsed_tokens += [{"t": t.text, "l": t.lemma, "c": t.category} for t in sent.terminals]
        else:
            all_parsed = False
        raw_tokens += [{"t": tok.txt, "m": meanings(tok)} for tok in sent.tokens if tok.txt]
    return {"parsed": True, "tokens": parsed_tokens} if all_parsed else {"parsed": False, "tokens": raw_tokens}


def main() -> None:
    stdin = io.TextIOWrapper(sys.stdin.buffer, encoding="utf-8")
    stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", line_buffering=True)
    g = Greynir()
    for line in stdin:
        if not line.strip():
            continue
        item = json.loads(line)
        try:
            result = tag(g, item["text"])
        except Exception as error:  # a sentence the parser cannot handle is reported, not fatal
            result = {"parsed": False, "tokens": [], "error": str(error)}
        stdout.write(json.dumps({"id": item["id"], **result}, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
