"""
ExplainService - Evidence-Grounded Explanation Engine
Enforces Strict Guard-Rails:
1. Rejects unverified procedures ("insufficient evidence, escalate").
2. Only cites chunk IDs that genuinely exist in the retrieved and aligned candidate set.
3. Distinguishes between LIGHT (deterministic local procedure) and escalated cases.
"""

from typing import Dict, Any, List

class ExplainService:
    @staticmethod
    def generate_explanation(case_data: dict) -> Dict[str, Any]:
        cond = case_data.get("condition", {})
        cands = case_data.get("evidence_candidates", [])
        alignments = case_data.get("alignment", [])
        fault = cond.get("fault_label", "")
        asset_id = case_data.get("asset_id", "")
        pc = cond.get("Pc", 0.0)

        # Filter candidates that were genuinely ALIGNED
        aligned_cand_ids = {a.get("candidate_id") for a in alignments if a.get("outcome") == "ALIGNED"}
        aligned_cands = [c for c in cands if c.get("id") in aligned_cand_ids]

        # Guard-Rail: If no verified evidence aligns, return strict refusal
        if not aligned_cands:
            return {
                "sourced_facts": [
                    f"Predicted condition: {fault} (Pc = {pc:.2f}).",
                    "Knowledge base query returned 0 verified procedure matches."
                ],
                "generated_text": (
                    f"Warning: Insufficient grounded evidence. While model diagnostics project an anomaly "
                    f"({fault} on {asset_id}), no approved maintenance procedure in the knowledge base aligns "
                    f"with this specific subsystem with verified criteria. Autonomous action suspended — "
                    f"mandatory engineering escalation required."
                ),
                "citations": []
            }

        primary = aligned_cands[0]
        primary_chunk_id = primary.get("chunk_id") or primary.get("id", "chunk-0")

        # Telemetry facts
        top_sensors = cond.get("top_sensors", [])
        sensor_detail = ""
        if top_sensors:
            s0 = top_sensors[0]
            sensor_detail = f"Dominant telemetry symptom: {s0.get('name')} at {s0.get('value')} {s0.get('unit')}."

        sourced_facts = [
            f"Predicted condition is {fault} with Pc = {pc:.2f} (Calibrated).",
            f"Verified evidence from '{primary.get('doc_title')}' confirms operating criteria on page {primary.get('page')}.",
            f"Recommended procedure: {primary.get('action')}."
        ]
        if sensor_detail:
            sourced_facts.insert(1, sensor_detail)

        generated_text = (
            f"InduSense confirmed {fault} on {asset_id}. "
            f"Retrieved passage on page {primary.get('page')} of '{primary.get('doc_title')}' aligns with monitored telemetry. "
            f"Recommended procedure: {primary.get('action')}."
        )

        # Citations are strictly constructed from aligned candidates only
        citations = [
            {
                "doc_id": primary.get("doc_id"),
                "title": primary.get("doc_title"),
                "page": primary.get("page"),
                "passage": primary.get("passage"),
                "chunk_id": primary_chunk_id
            }
        ]

        # Add second aligned candidate if present
        if len(aligned_cands) > 1:
            second = aligned_cands[1]
            citations.append({
                "doc_id": second.get("doc_id"),
                "title": second.get("doc_title"),
                "page": second.get("page"),
                "passage": second.get("passage"),
                "chunk_id": second.get("chunk_id") or second.get("id", "chunk-1")
            })

        return {
            "sourced_facts": sourced_facts,
            "generated_text": generated_text,
            "citations": citations
        }
