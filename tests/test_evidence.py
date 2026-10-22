"""Tests for evidence models, pillar categorization, and demo data consistency."""

from archon.evidence import EvidenceItem, InvestigationResult, PillarType
from archon.demo_data import get_demo_investigation, DEMO_SYMBOLS, DEMO_QUESTIONS


def test_evidence_item_creation_and_dict():
    item = EvidenceItem(
        id="TEST-001",
        pillar=PillarType.TEMPORAL_GIT,
        title="Commit 12345 — Bugfix",
        location="src/test.py:L10",
        summary="Test summary",
        verifiable_payload="def foo(): pass",
    )
    d = item.to_dict()
    assert d["id"] == "TEST-001"
    assert d["pillar"] == PillarType.TEMPORAL_GIT.value
    assert d["is_verified"] is True


def test_investigation_result_filtering():
    result = InvestigationResult(
        query="Why was this function introduced?",
        target_symbol="foo",
        repository_path="mock/path",
        is_demo=True,
        status_label="DEMO DATA",
        synthesis="Test synthesis",
        items=[
            EvidenceItem("1", PillarType.TEMPORAL_GIT, "Title1", "loc1", "sum1", "payload1"),
            EvidenceItem("2", PillarType.VERIFICATION_TEST, "Title2", "loc2", "sum2", "payload2"),
            EvidenceItem("3", PillarType.TEMPORAL_GIT, "Title3", "loc3", "sum3", "payload3"),
        ],
    )
    assert result.total_evidence_count == 3
    git_items = result.filter_by_pillar(PillarType.TEMPORAL_GIT)
    assert len(git_items) == 2
    test_items = result.filter_by_pillar(PillarType.VERIFICATION_TEST)
    assert len(test_items) == 1


def test_investigation_result_pillar_counts():
    result = InvestigationResult(
        query="Why was this function introduced?",
        target_symbol="foo",
        repository_path="mock/path",
        is_demo=True,
        status_label="DEMO DATA",
        synthesis="Test synthesis",
        items=[
            EvidenceItem("1", PillarType.TEMPORAL_GIT, "Title1", "loc1", "sum1", "payload1"),
            EvidenceItem("2", PillarType.VERIFICATION_TEST, "Title2", "loc2", "sum2", "payload2"),
            EvidenceItem("3", PillarType.TEMPORAL_GIT, "Title3", "loc3", "sum3", "payload3"),
        ],
    )
    counts = result.get_pillar_counts()
    assert counts[PillarType.TEMPORAL_GIT.value] == 2
    assert counts[PillarType.VERIFICATION_TEST.value] == 1
    assert counts[PillarType.CONTRACT_INVARIANT.value] == 0
    assert counts[PillarType.STRUCTURAL_DEPENDENCY.value] == 0
    d = result.to_dict()
    assert d["pillar_counts"] == counts



def test_demo_data_integrity_and_watermark():
    for sym in DEMO_SYMBOLS:
        res = get_demo_investigation(sym, DEMO_QUESTIONS[0])
        assert res.is_demo is True
        assert "DEMO DATA" in res.status_label
        assert len(res.items) > 0
        assert len(res.synthesis) > 50
        assert len(res.capabilities_implemented) > 0
        assert len(res.capabilities_pending) > 0
