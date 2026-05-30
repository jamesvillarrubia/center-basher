"""
build_all.py — re-run every analysis in the pipeline, in order.

Each step is independent (no dependency between scripts), so a failure in one
step does not block the others. Failures are reported at the end.
"""
import importlib
import sys
import traceback

STEPS = [
    "build_center_breakdown",
    "build_partisan_loyalty",
    "build_within_tent_bolt",
    "build_turnout_hump",
    "build_panel_switch_vsg",
    "build_rr_weight_by_cycle",
    "build_trust_vote_by_cycle",
]


def main():
    failures = []
    for step in STEPS:
        print(f"\n=== {step} ===")
        try:
            mod = importlib.import_module(step)
            mod.main()
        except Exception as e:
            print(f"  ✗ {step} failed: {e}")
            traceback.print_exc()
            failures.append((step, e))
    print()
    if failures:
        print(f"=== {len(failures)} step(s) failed ===")
        for s, e in failures:
            print(f"  ✗ {s}: {e}")
        sys.exit(1)
    print(f"=== {len(STEPS)} steps completed; outputs in data/clean/ ===")


if __name__ == "__main__":
    main()
