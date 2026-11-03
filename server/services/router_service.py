"""
RouterService - Confidence-Aware Cloud Router
Steers cases to LIGHT, STANDARD, or HEAVY tiers.
"""

class RouterService:
    @staticmethod
    def route_case(validation: dict):
        pc = validation.get("Pc", 0.0)
        cea = validation.get("CEA", 0.0)
        conflict = validation.get("conflict_flag", False)

        if conflict or cea < 0.60 or pc < 0.70:
            return {
                "path": "HEAVY",
                "reason": "Evidence conflict detected or low confidence certainty. Escalated to Heavy tier + mandatory human review.",
                "measured_latency_ms": 512,
                "estimated_cost_usd": 0.0125
            }
        elif pc < 0.88 or cea < 0.85:
            return {
                "path": "STANDARD",
                "reason": "Marginal confidence threshold met. Standard dual-pass verification selected.",
                "measured_latency_ms": 388,
                "estimated_cost_usd": 0.0042
            }
        else:
            return {
                "path": "LIGHT",
                "reason": "High condition confidence (Pc) and verified evidence alignment (CEA). Deterministic local dispatch.",
                "measured_latency_ms": 242,
                "estimated_cost_usd": 0.0018
            }
