"""Tests for Change Impact Engine and Evaluation Framework in ARCHON 2.0."""

import os
import tempfile
from archon.impact_analyzer import ChangeImpactEngine
from archon.evaluation import BenchmarkEvaluator


def test_change_impact_engine_isolated_component():
    with tempfile.TemporaryDirectory() as tmpdir:
        src = os.path.join(tmpdir, "calc.py")
        with open(src, "w", encoding="utf-8") as f:
            f.write("def calculate_tax(): pass\n")

        test_file = os.path.join(tmpdir, "test_calc.py")
        with open(test_file, "w", encoding="utf-8") as f:
            f.write("from calc import calculate_tax\ndef test_calc(): calculate_tax()\n")

        engine = ChangeImpactEngine(repo_path=tmpdir)
        report = engine.analyze_impact("calculate_tax", "Change formula from 10% to 15%")

        assert report.target_symbol == "calculate_tax"
        assert report.overall_risk in ["LOW", "MEDIUM"]
        assert len(report.tests_to_run) >= 1
        assert report.is_advisory_only is True


def test_evaluation_framework_metrics():
    summary = BenchmarkEvaluator.run_evaluation()
    d = summary.to_dict()

    assert d["total_cases_evaluated"] >= 3
    assert d["average_citation_validity"] >= 0.9
    assert d["average_answer_support_rate"] == 1.0
    assert d["total_unsupported_claims"] == 0
    assert d["failure_rate_percent"] == 0.0
    assert len(d["results"]) >= 3
