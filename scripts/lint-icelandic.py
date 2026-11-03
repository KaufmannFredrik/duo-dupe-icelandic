"""Grammar and spelling check for Icelandic sentences with GreynirCorrect (MIT, Miðeind).

Reads JSON lines {"id": ..., "text": ...} on stdin and writes JSON lines
{"id": ..., "annotations": [{"code": ..., "text": ..., "start": ..., "end": ...}]} on stdout.

Setup (once):
    python -m venv .venv
    .venv/Scripts/pip install reynir-correct      (macOS/Linux: .venv/bin/pip)
    .venv/Scripts/python -m icegrams.download
"""

import io
import json
import sys

from reynir_correct import check_single


def main() -> None:
    stdin = io.TextIOWrapper(sys.stdin.buffer, encoding="utf-8")
    stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", line_buffering=True)
    for line in stdin:
        if not line.strip():
            continue
        item = json.loads(line)
        try:
            result = check_single(item["text"])
            annotations = [
                {"code": a.code, "text": a.text, "start": a.start, "end": a.end}
                for a in (result.annotations if result else [])
            ]
        except Exception as error:  # a sentence the parser cannot handle is reported, not fatal
            annotations = [{"code": "LINT-ERROR", "text": str(error), "start": 0, "end": 0}]
        stdout.write(json.dumps({"id": item["id"], "annotations": annotations}, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
