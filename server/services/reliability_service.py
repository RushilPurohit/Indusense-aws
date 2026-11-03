"""
ReliabilityService - Keeps Pc, Rc, Oc, CEA separate
Computes pluggable aggregate labeled "Hypothetical aggregate (research hypothesis, not validated)"
"""

class ReliabilityService:
    @staticmethod
    def validate(condition: dict, candidates: list, alignments: list):
        pc = float(condition.get("Pc", 0.8))
        
        if not candidates or not alignments:
            return {
                "Pc": pc,
                "Rc": 0.0,
                "Oc": 0.0,
                "CEA": 0.0,
                "aggregate": pc * 0.5,
                "aggregate_label": "Hypothetical Aggregate (Research Hypothesis, Not Validated)",
                "conflict_flag": True,
                "review_required": True,
                "conflict_description": "INSUFFICIENT EVIDENCE: No approved technical manual passages cover this anomaly in the repository."
            }

        # Check for distractor or conflict
        has_conflict = any(a.get("outcome") == "CONFLICT" for a in alignments)
        aligned_cand = [a for a in alignments if a.get("outcome") == "ALIGNED"]

        best_cea = max([a.get("CEA", 0.0) for a in alignments]) if alignments else 0.0
        best_rc = max([c.get("Rc", 0.0) for c in candidates]) if candidates else 0.0
        best_oc = max([c.get("Oc", 0.0) for c in candidates]) if candidates else 0.0

        # Pluggable illustrative fusion default
        aggregate = (0.35 * pc) + (0.25 * best_rc) + (0.15 * best_oc) + (0.25 * best_cea)

        conflict_desc = None
        if has_conflict:
            conflict_desc = "Semantic Proximity Distractor Detected: One or more retrieved candidates matched lexical terms but targeted an unrelated subsystem."

        return {
            "Pc": pc,
            "Rc": best_rc,
            "Oc": best_oc,
            "CEA": best_cea,
            "aggregate": round(aggregate, 4),
            "aggregate_label": "Hypothetical Aggregate (Research Hypothesis, Not Validated)",
            "conflict_flag": has_conflict,
            "review_required": has_conflict or pc < 0.70 or best_cea < 0.60,
            "conflict_description": conflict_desc
        }
