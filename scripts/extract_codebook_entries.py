"""Extract codebook entries for every variable used in scripts/.

For each variable, search the appropriate cycle's codebook text file and
print a windowed section showing label + value labels. Output to
data/derived/codebook_entries.txt for review.

Re-run after updating data/raw/anes_codebooks/*.txt or after new variables
are introduced.
"""
import os
import re
import sys
from collections import defaultdict

PATTERN = re.compile(r"\bV[0-9]{6}[a-z]?\b")

CODEBOOKS = {
    2016: "data/raw/anes_codebooks/anes_2016_codebook.txt",
    2020: "data/raw/anes_codebooks/anes_2020_codebook.txt",
    2024: "data/raw/anes_codebooks/anes_2024_codebook.txt",
}


def cycle_of(var):
    if var.startswith(("V160", "V161", "V162")):
        return 2016
    if var.startswith(("V200", "V201", "V202")):
        return 2020
    if var.startswith(("V240", "V241", "V242", "V243")):
        return 2024
    return None


def gather_used_vars():
    used = set()
    for root, _, files in os.walk("scripts"):
        for fn in files:
            if not fn.endswith(".py"):
                continue
            for line in open(os.path.join(root, fn)):
                used.update(PATTERN.findall(line))
    return used


def extract_entry(text, var):
    """Find the codebook entry for `var` and return a windowed slice.

    Strategy: find lines that look like a 'definition' line — either
      'V161126   PRE: 7pt scale ...'  (2016 page-numbered format)
      'V201231x\tPRE: SUMMARY: PARTY ID' (2020/2024 tab-delimited format)
    Then grab ~30 lines after the strongest match.
    """
    # Prefer lines where var is at start-of-line or after a page-number
    lines = text.splitlines()
    candidates = []
    for i, line in enumerate(lines):
        s = line.strip()
        # Match: var followed by whitespace then PRE/POST/SUMMARY/Value Labels/etc.
        if re.match(rf"^(\d+\s+)?{re.escape(var)}\b", s):
            score = 10
            if "PRE:" in s or "POST:" in s or "SUMMARY" in s.upper():
                score += 5
            candidates.append((score, i))
    if not candidates:
        return None
    candidates.sort(reverse=True)
    _, idx = candidates[0]
    # Grab a window: 1 line of header + up to 40 lines of value labels.
    # Stop at next variable definition (line beginning with V######).
    out = [lines[idx]]
    for j in range(idx + 1, min(idx + 60, len(lines))):
        s = lines[j].strip()
        if re.match(r"^(\d+\s+)?V\d{6}[a-z]?\b", s) and j > idx + 1:
            break
        out.append(lines[j])
    return "\n".join(out)


def main():
    used = sorted(gather_used_vars())
    print(f"Total ANES variables used: {len(used)}")
    codebooks = {y: open(p).read() for y, p in CODEBOOKS.items() if os.path.exists(p)}

    os.makedirs("data/derived", exist_ok=True)
    with open("data/derived/codebook_entries.txt", "w") as f:
        for var in used:
            cyc = cycle_of(var)
            if cyc is None or cyc not in codebooks:
                f.write(f"\n\n=== {var} (NO CODEBOOK) ===\n")
                continue
            entry = extract_entry(codebooks[cyc], var)
            f.write(f"\n\n=== {var} [{cyc}] ===\n")
            if entry is None:
                f.write("(NOT FOUND IN CODEBOOK)\n")
            else:
                # Trim absurdly long entries
                lines = entry.split("\n")
                if len(lines) > 40:
                    entry = "\n".join(lines[:40]) + "\n... [truncated]"
                f.write(entry + "\n")
    print(f"Wrote data/derived/codebook_entries.txt")


if __name__ == "__main__":
    main()
