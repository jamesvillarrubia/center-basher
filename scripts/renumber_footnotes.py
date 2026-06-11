#!/usr/bin/env python3
"""Shift global footnote numbers >= THRESHOLD by DELTA in an HTML file.

Footnotes live in three places that must stay in sync:
  - inline refs:  <a ... class="fnref" id="fnref-S-K"><sup>N</sup></a>
  - list items:   <li id="fn-S-K" value="N">
  - block starts: <ol class="footnotes" start="M">

Use this when inserting or removing a footnote: shift everything at/after the
insertion point, then drop the new footnote into the freed number.

Usage:
    python scripts/renumber_footnotes.py THRESHOLD DELTA [path]
e.g. python scripts/renumber_footnotes.py 48 1            # insert one fn at 48
     python scripts/renumber_footnotes.py 48 -1           # remove the fn at 48
"""
import re
import sys
from pathlib import Path


def main():
    threshold = int(sys.argv[1])
    delta = int(sys.argv[2])
    path = Path(sys.argv[3]) if len(sys.argv) > 3 else Path('web/index.html')
    html = path.read_text()
    changed = {'refs': 0, 'lis': 0, 'ols': 0}

    def bumper(key):
        def repl(m):
            n = int(m.group(2))
            if n >= threshold:
                changed[key] += 1
                n += delta
            return f'{m.group(1)}{n}{m.group(3)}'
        return repl

    html = re.sub(r'(class="fnref" id="fnref-[0-9]+-[0-9]+"><sup>)(\d+)(</sup>)',
                  bumper('refs'), html)
    html = re.sub(r'(<li id="fn-[0-9]+-[0-9]+" value=")(\d+)(")',
                  bumper('lis'), html)
    html = re.sub(r'(<ol class="footnotes" start=")(\d+)(")',
                  bumper('ols'), html)

    path.write_text(html)
    print(f"threshold>={threshold} delta={delta:+d} -> "
          f"refs shifted={changed['refs']} lis shifted={changed['lis']} "
          f"ols shifted={changed['ols']}")


if __name__ == '__main__':
    main()
