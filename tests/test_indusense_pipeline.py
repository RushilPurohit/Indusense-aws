import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.services.predictor_service import PredictorService
from server.services.alignment_service import AlignmentService
from server.services.reliability_service import ReliabilityService
from server.services.router_service import RouterService
from server.services.knowledge_index import knowledge_index

def test_predictor_ai4i_hdf():
    telemetry = {
        "Air temperature [K]": 300.6,
        "Process temperature [K]": 308.7,
        "Rotational speed [rpm]": 1320,
        "Torque [Nm]": 52.4,
        "Tool wear [min]": 110
    }
    result = PredictorService.predict_ai4i_fault(telemetry)
    assert result["fault_label"] == "Heat Dissipation Failure (HDF)"
    assert result["Pc"] >= 0.90
    assert result["calibrated"] is True

def test_alignment_cea_and_semantic_distractor():
    condition = {"fault_label": "Heat Dissipation Failure (HDF)", "Pc": 0.94}
    candidates = knowledge_index.hybrid_search("Heat Dissipation Failure", "CNC-M102")
    assert len(candidates) == 2

    alignments = AlignmentService.align_candidates(condition, candidates)
    assert len(alignments) == 2

    # Candidate 1 is the pneumatic chuck distractor
    distractor_alignment = alignments[0]
    assert distractor_alignment["outcome"] == "CONFLICT"
    assert distractor_alignment["CEA"] < 0.30
    assert any("Semantic Proximity Fallacy" in r for r in distractor_alignment["reasons"])

    # Candidate 2 is the true cooling circuit manual
    correct_alignment = alignments[1]
    assert correct_alignment["outcome"] == "ALIGNED"
    assert correct_alignment["CEA"] >= 0.90

def test_reliability_fusion():
    condition = {"Pc": 0.94}
    candidates = [
        {"Rc": 0.88, "Oc": 0.92, "is_distractor": True},
        {"Rc": 0.93, "Oc": 0.96, "is_distractor": False}
    ]
    alignments = [
        {"candidate_id": "c1", "outcome": "CONFLICT", "CEA": 0.21},
        {"candidate_id": "c2", "outcome": "ALIGNED", "CEA": 0.95}
    ]
    val = ReliabilityService.validate(condition, candidates, alignments)
    assert val["conflict_flag"] is True  # Distractor was detected
    assert val["CEA"] == 0.95
    assert val["aggregate"] > 0.85
    assert "Hypothetical" in val["aggregate_label"]

def test_router_escalation():
    # Light path
    val_light = {"Pc": 0.95, "CEA": 0.92, "conflict_flag": False}
    res_light = RouterService.route_case(val_light)
    assert res_light["path"] == "LIGHT"

    # Conflict triggers Heavy path
    val_conflict = {"Pc": 0.95, "CEA": 0.92, "conflict_flag": True}
    res_conflict = RouterService.route_case(val_conflict)
    assert res_conflict["path"] == "HEAVY"

    # Marginal certainty triggers Standard path
    val_standard = {"Pc": 0.78, "CEA": 0.80, "conflict_flag": False}
    res_standard = RouterService.route_case(val_standard)
    assert res_standard["path"] == "STANDARD"

def test_telemetry_csv_columns():
    from server.api.telemetry import validate_telemetry, ValidateTelemetryRequest
    req = ValidateTelemetryRequest(rows=[{"col1": 1, "col2": 2}])
    res = validate_telemetry(req)
    assert res["valid"] is True
    assert "Air temperature [K]" in res["columns"]

def test_turbofan_case_distinctness_and_no_cooling_leakage():
    """Verify Turbofan case is distinct from CNC-M102 and never references 1320 rpm or cooling fan CF-02."""
    from server.services.explain_service import ExplainService
    condition = PredictorService.predict_cmapss_rul({"T30": 1598.2, "P30": 552.1})
    assert condition["fault_label"] == "High-Pressure Compressor Degradation"
    assert condition["rul"] == 42

    candidates = knowledge_index.hybrid_search(condition["fault_label"], "TURBO-TF004")
    assert len(candidates) == 2
    assert any("Turbofan" in c["doc_title"] for c in candidates)

    alignments = AlignmentService.align_candidates(condition, candidates)
    # Distractor check (exhaust nozzle cowl latches rejected)
    distractor = next(a for a in alignments if a["candidate_id"] == "cand-tf004-1")
    assert distractor["outcome"] == "CONFLICT"
    assert any("High-Pressure Compressor" in r for r in distractor["reasons"])

    # Aligned check (HPC overhaul verified)
    aligned = next(a for a in alignments if a["candidate_id"] == "cand-tf004-2")
    assert aligned["outcome"] == "ALIGNED"
    assert aligned["CEA"] >= 0.90

    # Explanation check
    explanation = ExplainService.generate_explanation({
        "asset_id": "TURBO-TF004",
        "condition": condition,
        "evidence_candidates": candidates,
        "alignment": alignments
    })

    gen_text = explanation["generated_text"]
    assert "Turbofan" in gen_text or "TURBO-TF004" in gen_text or "Compressor" in gen_text
    # Strict anti-leakage test: must NOT contain CNC spindle cooling or 1320 rpm
    assert "1320 rpm" not in gen_text
    assert "CF-02" not in gen_text
    assert "Spindle Cooling" not in gen_text

def test_audit_trail_and_technician_review():
    """Test Case Audit Trail (Feature A) and Technician Review (Feature C)."""
    from server.api.cases import create_and_run_case, record_case_review, get_case, CreateCaseRequest, ReviewCaseRequest
    
    # Create new case
    req = CreateCaseRequest(asset_id="TURBO-TF004", dataset_source="NASA C-MAPSS", head="cmapss_rul")
    new_case = create_and_run_case(req)
    case_id = new_case["id"]

    assert "audit_trail" in new_case
    assert len(new_case["audit_trail"]) >= 6
    events = [e["event_type"] for e in new_case["audit_trail"]]
    assert "CASE_INITIALIZED" in events
    assert "PREDICTION_EXECUTED" in events
    assert "EVIDENCE_RETRIEVED" in events
    assert "ALIGNMENT_EVALUATED" in events
    assert "VALIDATION_COMPLETED" in events
    assert "ROUTING_ASSIGNED" in events

    # Record technician review
    rev_req = ReviewCaseRequest(outcome="Accepted", reviewer="Chief Engineer Vance", notes="Borescope confirmed.")
    updated = record_case_review(case_id, rev_req)
    assert updated["review"]["outcome"] == "Accepted"
    assert updated["review"]["reviewer"] == "Chief Engineer Vance"
    
    # Check that audit trail recorded the technician review
    latest_evt = updated["audit_trail"][-1]
    assert latest_evt["event_type"] == "TECHNICIAN_REVIEW"
    assert "Chief Engineer Vance" in latest_evt["actor"]
    assert "Accepted" in latest_evt["details"]

def test_document_quality_checks_feature_d():
    """Test Maintenance Document Quality Checks (Feature D)."""
    docs = knowledge_index.documents
    assert len(docs) >= 5

    ready_docs = [d for d in docs if d.get("quality_status") == "Ready for retrieval"]
    warning_docs = [d for d in docs if d.get("quality_status") == "Processed with warnings"]
    failed_docs = [d for d in docs if d.get("quality_status") == "Extraction failed"]

    assert len(ready_docs) >= 3
    assert len(warning_docs) >= 1
    assert len(failed_docs) >= 1

    # Check that quality metrics exist
    for d in docs:
        assert "quality_checks" in d
        qc = d["quality_checks"]
        assert "ocr_confidence" in qc
        assert "missing_page_refs" in qc
        assert "status_message" in qc

def test_nominal_telemetry_returns_no_fault_evidence():
    """Verify nominal telemetry produces Nominal Operation, retrieves zero fault evidence, and never fabricates citations."""
    from server.services.explain_service import ExplainService
    telemetry = {
        "Air temperature [K]": 298.5,
        "Process temperature [K]": 308.2, # delta_t = 9.7 K > 8.6 K
        "Rotational speed [rpm]": 1520,   # > 1380 rpm
        "Torque [Nm]": 38.0,
        "Tool wear [min]": 45             # < 200 min
    }
    condition = PredictorService.predict_ai4i_fault(telemetry)
    assert condition["fault_label"] == "Nominal Operation (No Fault Detected)"
    assert condition["Pc"] >= 0.90

    # Hybrid search for nominal machine MUST return empty list
    candidates = knowledge_index.hybrid_search(condition["fault_label"], "CNC-M205")
    assert candidates == []

    # Alignment and reliability over empty candidates
    alignments = AlignmentService.align_candidates(condition, candidates)
    assert alignments == []

    val = ReliabilityService.validate(condition, candidates, alignments)
    assert val["CEA"] == 0.0
    assert val["Rc"] == 0.0
    assert val["conflict_flag"] is True  # Flags insufficient evidence / no procedure needed
    assert "INSUFFICIENT EVIDENCE" in val["conflict_description"]

    # Explanation service must refuse and return 0 citations
    explanation = ExplainService.generate_explanation({
        "asset_id": "CNC-M205",
        "condition": condition,
        "evidence_candidates": candidates,
        "alignment": alignments
    })
    assert explanation["citations"] == []
    assert "Insufficient" in explanation["generated_text"] or "escalation" in explanation["generated_text"]

def test_different_cases_produce_distinct_evidence_and_explanations():
    """Verify two different asset fault conditions produce mutually distinct candidate IDs and explanations."""
    from server.services.explain_service import ExplainService

    # Case 1: Spindle HDF
    cond1 = PredictorService.predict_ai4i_fault({
        "Air temperature [K]": 300.6,
        "Process temperature [K]": 308.7,
        "Rotational speed [rpm]": 1320,
        "Torque [Nm]": 52.4,
        "Tool wear [min]": 110
    })
    cands1 = knowledge_index.hybrid_search(cond1["fault_label"], "CNC-M102")
    align1 = AlignmentService.align_candidates(cond1, cands1)
    exp1 = ExplainService.generate_explanation({
        "asset_id": "CNC-M102",
        "condition": cond1,
        "evidence_candidates": cands1,
        "alignment": align1
    })

    # Case 2: Bearing Degradation
    cond2 = PredictorService.predict_femto_bearing({"kurtosis": 5.82, "fft_peak": 108.4})
    cands2 = knowledge_index.hybrid_search(cond2["fault_label"], "BRG-301")
    align2 = AlignmentService.align_candidates(cond2, cands2)
    exp2 = ExplainService.generate_explanation({
        "asset_id": "BRG-301",
        "condition": cond2,
        "evidence_candidates": cands2,
        "alignment": align2
    })

    # Evidence candidate IDs must be completely disjoint
    ids1 = {c["id"] for c in cands1}
    ids2 = {c["id"] for c in cands2}
    assert ids1.isdisjoint(ids2)

    # Generated text must be distinct and specific
    assert exp1["generated_text"] != exp2["generated_text"]
    assert "Heat Dissipation Failure" in exp1["generated_text"]
    assert "Bearing" in exp2["generated_text"]
    assert "CF-02" not in exp2["generated_text"]

def test_dynamic_distractor_detection_without_stored_flag():
    """Verify AlignmentService dynamically detects semantic proximity distractors without relying on stored flags."""
    cands = knowledge_index.hybrid_search("Heat Dissipation Failure", "CNC-M102")
    assert len(cands) >= 2

    # Verify no candidate has 'is_distractor' in stored metadata
    for c in cands:
        assert "is_distractor" not in c

    cond = {"fault_label": "Heat Dissipation Failure (HDF)", "top_sensors": [{"name": "Air Temp [K]", "value": 300.6}, {"name": "Process Temp [K]", "value": 308.7}, {"name": "Speed [rpm]", "value": 1320}]}
    alignments = AlignmentService.align_candidates(cond, cands)

    chuck_align = next(a for a in alignments if a["candidate_id"] == "cand-m102-1")
    assert chuck_align["outcome"] == "CONFLICT"
    assert chuck_align["sub_scores"]["component"] == 0.0
    assert any("Semantic Proximity Fallacy" in r for r in chuck_align["reasons"])

    cooling_align = next(a for a in alignments if a["candidate_id"] == "cand-m102-2")
    assert cooling_align["outcome"] == "ALIGNED"
    assert cooling_align["sub_scores"]["component"] == 1.0

def test_versioned_technician_reviews_preserve_history():
    """Verify technician reviews are versioned and preserved across multiple submissions (Feature C)."""
    from server.api.cases import create_and_run_case, record_case_review, get_case, CreateCaseRequest, ReviewCaseRequest
    from server.services.db_service import db_service

    req = CreateCaseRequest(asset_id="CNC-M102", dataset_source="UCI AI4I 2020", head="ai4i_fault")
    new_case = create_and_run_case(req)
    case_id = new_case["id"]

    # Review 1
    rev1 = ReviewCaseRequest(outcome="Needs Further Review", reviewer="Engineer Alice", notes="Awaiting coolant flow check.")
    record_case_review(case_id, rev1)

    # Review 2
    rev2 = ReviewCaseRequest(outcome="Accepted", reviewer="Senior Lead Bob", notes="Coolant pump confirmed obstructed. Cleared.")
    record_case_review(case_id, rev2)

    history = db_service.get_reviews(case_id)
    assert len(history) >= 2
    assert history[-2]["outcome"] == "Needs Further Review"
    assert history[-2]["reviewer"] == "Engineer Alice"
    assert history[-1]["outcome"] == "Accepted"
    assert history[-1]["reviewer"] == "Senior Lead Bob"

