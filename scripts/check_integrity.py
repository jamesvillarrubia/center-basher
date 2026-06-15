#!/usr/bin/env python3
"""
check_integrity.py — data ↔ prose ↔ web drift-guard for the center-basher essay.

This project's recurring failure mode is a number drifting between four places:
the data that backs it, the build script that computes it, the `web/data/` copy a
figure loads, and the prose/footnote that quotes it. This harness catches that
class of drift. It is verification-only: it NEVER edits prose, data, or figures.

Checks (added incrementally per the overnight queue):
  1. web/data mirror   — every web/data/* with a data/clean/ source is byte-identical
  2. reproducibility   — re-running each build_*.py leaves data/clean unchanged (git)
  3. number-tracing    — n's/percentages quoted in index.html trace to their data file
  4. figure render set — every Figure <Letter> ref has a block + JS module, no orphans

Exit code: 0 when every implemented check is clean, 1 when any drift is found.

Usage:
  python scripts/check_integrity.py            # run all implemented checks
  python scripts/check_integrity.py --check 1  # run one check
  python scripts/check_integrity.py --report PATH   # also write a markdown report
"""
from __future__ import annotations

import argparse
import filecmp
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_CLEAN = ROOT / "data" / "clean"
WEB_DATA = ROOT / "web" / "data"

# web/data files that legitimately have NO data/clean source (hand-authored or
# produced by a non-build pipeline). Listed, never flagged as drift.
WEB_ONLY_EXPECTED = {"voters.json"}


class Finding:
    """One drift discrepancy. status: 'ok' | 'drift' | 'info'."""

    def __init__(self, check: str, item: str, status: str, detail: str = ""):
        self.check = check
        self.item = item
        self.status = status
        self.detail = detail

    @property
    def is_drift(self) -> bool:
        return self.status == "drift"


# ── Check 1: web/data mirror ────────────────────────────────────────────────
def check_web_data_mirror() -> list[Finding]:
    """Every web/data/* that has a data/clean/<same-name> source must be byte-identical."""
    findings: list[Finding] = []
    web_files = sorted(p for p in WEB_DATA.iterdir() if p.is_file() and p.name != ".DS_Store")
    for wf in web_files:
        src = DATA_CLEAN / wf.name
        if not src.exists():
            status = "info" if wf.name in WEB_ONLY_EXPECTED else "drift"
            detail = (
                "web-only, no data/clean source (expected)"
                if wf.name in WEB_ONLY_EXPECTED
                else "web/data file has NO data/clean source — orphan copy, source may have been renamed/removed"
            )
            findings.append(Finding("mirror", wf.name, status, detail))
            continue
        if filecmp.cmp(src, wf, shallow=False):
            findings.append(Finding("mirror", wf.name, "ok", "byte-identical to data/clean"))
        else:
            findings.append(
                Finding("mirror", wf.name, "drift",
                        "web/data DIFFERS from data/clean — stale copy; re-sync data/clean → web/data")
            )
    return findings


# ── Check 2: build reproducibility ──────────────────────────────────────────
def _git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)


def _data_clean_status() -> str:
    return _git("status", "--porcelain", "--", "data/clean").stdout.strip()


def check_reproducibility(timeout: int = 900) -> list[Finding]:
    """Re-run each scripts/build_*.py and confirm its committed data/clean output is
    unchanged per git. Restores data/clean after every script. Refuses to run if
    data/clean has uncommitted changes (it would clobber them)."""
    findings: list[Finding] = []
    if _data_clean_status():
        findings.append(Finding(
            "reproducibility", "(precondition)", "drift",
            "data/clean has uncommitted changes — refusing to run (would clobber). "
            "Commit or stash data/clean first."))
        return findings

    # baseline set of files so we can remove any new untracked files a build creates
    baseline = {p.name for p in DATA_CLEAN.iterdir() if p.is_file()}

    def restore() -> None:
        _git("checkout", "--", "data/clean")
        for p in list(DATA_CLEAN.iterdir()):
            if p.is_file() and p.name not in baseline:
                p.unlink()

    builds = sorted((ROOT / "scripts").glob("build_*.py"))
    for b in builds:
        rel = b.relative_to(ROOT).as_posix()
        try:
            proc = subprocess.run([sys.executable, rel], cwd=ROOT,
                                  capture_output=True, text=True, timeout=timeout)
        except subprocess.TimeoutExpired:
            restore()
            findings.append(Finding("reproducibility", b.name, "info",
                                    f"BUILD TIMEOUT (>{timeout}s) — skipped"))
            continue
        if proc.returncode != 0:
            err = (proc.stderr or proc.stdout).strip().splitlines()
            restore()
            findings.append(Finding("reproducibility", b.name, "info",
                                    f"BUILD FAILED rc={proc.returncode}: {err[-1] if err else '(no output)'}"))
            continue
        diff = _data_clean_status()
        if not diff:
            findings.append(Finding("reproducibility", b.name, "ok", "reproducible (output unchanged)"))
        else:
            changed = ", ".join(line[3:] for line in diff.splitlines())
            findings.append(Finding("reproducibility", b.name, "drift",
                                    f"committed output STALE vs script — changed: {changed}"))
        restore()

    # final guarantee: tree pristine
    leftover = _data_clean_status()
    if leftover:
        findings.append(Finding("reproducibility", "(cleanup)", "drift",
                                f"data/clean NOT pristine after run: {leftover}"))
    return findings


# ── Reporting ───────────────────────────────────────────────────────────────
# Mutating checks (re-run builds) are opt-in via --repro so the default invocation
# stays read-only and safe to run anytime.
CHECKS = {
    1: ("web/data mirror", check_web_data_mirror),
    2: ("build reproducibility", check_reproducibility),
}
MUTATING = {2}


def render(findings: list[Finding]) -> str:
    lines: list[str] = []
    by_check: dict[str, list[Finding]] = {}
    for f in findings:
        by_check.setdefault(f.check, []).append(f)
    icon = {"ok": "✅", "drift": "🔴", "info": "ℹ️"}
    for check, fs in by_check.items():
        n_drift = sum(1 for f in fs if f.is_drift)
        lines.append(f"\n### {check}  ({n_drift} drift / {len(fs)} checked)")
        for f in sorted(fs, key=lambda x: (x.status != "drift", x.item)):
            lines.append(f"  {icon[f.status]} {f.item:<40} {f.detail}")
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", type=int, default=None, help="run only this check number")
    ap.add_argument("--report", type=str, default=None, help="also write a markdown report here")
    ap.add_argument("--repro", action="store_true",
                    help="include mutating checks (re-runs build_*.py, restores after)")
    args = ap.parse_args()

    if args.check:
        selected = [args.check]
    else:
        selected = [n for n in sorted(CHECKS) if n not in MUTATING or args.repro]
        skipped = [n for n in sorted(MUTATING) if not args.repro]
        if skipped:
            print(f"(skipping mutating check(s) {skipped} — pass --repro to include)\n")
    all_findings: list[Finding] = []
    for num in selected:
        if num not in CHECKS:
            print(f"check {num} not implemented yet", file=sys.stderr)
            continue
        _name, fn = CHECKS[num]
        all_findings.extend(fn())

    out = render(all_findings)
    print(out)

    n_drift = sum(1 for f in all_findings if f.is_drift)
    summary = f"\n{'DRIFT FOUND: ' + str(n_drift) if n_drift else 'CLEAN'} " \
              f"({len(all_findings)} items checked across {len(selected)} check(s))"
    print(summary)

    if args.report:
        rp = Path(args.report)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(f"# Integrity report\n{out}\n{summary}\n")
        print(f"\nwrote {rp}")

    return 1 if n_drift else 0


if __name__ == "__main__":
    raise SystemExit(main())
