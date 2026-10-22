"""Tests for Neo4j Knowledge Graph service and offline fallback behavior."""

from archon.neo4j_graph import Neo4jGraphService


def test_neo4j_offline_resilience_and_status():
    service = Neo4jGraphService(uri="bolt://127.0.0.1:9999")  # Non-existent port
    status = service.check_connection()
    assert status["is_connected"] is False
    assert "offline" in status["message"].lower() or "unreachable" in status["message"].lower() or "driver" in status["message"].lower()


def test_neo4j_react_flow_offline_fallback():
    service = Neo4jGraphService(uri="bolt://127.0.0.1:9999")
    fallback_syms = [
        {"name": "TenantSubscription", "kind": "class", "file_path": "models.py", "line_start": 4},
        {"name": "process_payment", "kind": "function", "file_path": "views.py", "line_start": 45},
    ]
    graph = service.get_react_flow_graph(repo_id="test-repo", fallback_symbols=fallback_syms)
    assert graph["is_live_neo4j"] is False
    assert len(graph["nodes"]) == 2
    assert "TenantSubscription" in graph["nodes"][0]["data"]["label"]
    assert len(graph["edges"]) == 1
