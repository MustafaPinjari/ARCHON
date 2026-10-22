"""Integration tests for ARCHON 2.0 Django REST Framework API endpoints."""

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
import django
django.setup()

import pytest
from rest_framework.test import APIClient


@pytest.fixture
def client():
    return APIClient()


def test_api_health_endpoint(client):
    res = client.get("/api/v1/health/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["version"] == "2.0.0"
    assert "security" in data
    assert "neo4j" in data


def test_api_validate_repository_endpoint(client):
    # Test valid current directory
    res = client.post("/api/v1/repositories/validate/", {"path": os.getcwd()}, format="json")
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is True
    assert data["scanned_files_count"] > 0

    # Test invalid directory
    res_bad = client.post("/api/v1/repositories/validate/", {"path": "C:/NonExistentPath_404"}, format="json")
    assert res_bad.status_code == 200
    assert res_bad.json()["is_valid"] is False


def test_api_investigation_endpoint_demo_mode(client):
    payload = {
        "symbol": "charge_with_idempotency_key",
        "question": "Why was this function introduced?",
        "is_demo": True,
    }
    res = client.post("/api/v1/investigations/", payload, format="json")
    assert res.status_code == 200
    data = res.json()
    assert data["is_demo"] is True
    assert "DEMO DATA" in data["status_label"]
    assert len(data["items"]) >= 4
    assert "graph_context" in data


def test_api_graph_endpoint(client):
    res = client.get("/api/v1/repositories/graph/?path=" + os.getcwd())
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert "edges" in data


def test_api_impact_analysis_endpoint(client):
    payload = {
        "symbol": "RepositoryManager",
        "proposed_change": "Refactor path normalization",
        "repository_path": os.getcwd(),
    }
    res = client.post("/api/v1/impact-analysis/", payload, format="json")
    assert res.status_code == 200
    data = res.json()
    assert data["target_symbol"] == "RepositoryManager"
    assert "overall_risk" in data
    assert data["is_advisory_only"] is True


def test_api_evaluation_endpoint(client):
    res = client.get("/api/v1/evaluation/")
    assert res.status_code == 200
    data = res.json()
    assert data["total_cases_evaluated"] >= 3
    assert data["average_answer_support_rate"] == 1.0
