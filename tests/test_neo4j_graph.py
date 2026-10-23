"""Tests for Neo4j Knowledge Graph service and offline fallback behavior."""

from archon.neo4j_graph import Neo4jGraphService


def test_neo4j_offline_resilience_and_status():
    service = Neo4jGraphService(uri="bolt://127.0.0.1:9999")  # Non-existent port
    status = service.check_connection()
    assert status["is_connected"] is False
    assert "offline" in status["message"].lower() or "unreachable" in status["message"].lower() or "driver" in status["message"].lower()


def test_neo4j_react_flow_offline_no_fabricated_edges():
    """Verifies that disconnected symbols never have synthetic 'DEFINED_NEAR' edges fabricated."""
    service = Neo4jGraphService(uri="bolt://127.0.0.1:9999")
    fallback_syms = [
        {"name": "TenantSubscription", "kind": "class", "file_path": "models.py", "line_start": 4},
        {"name": "process_payment", "kind": "function", "file_path": "views.py", "line_start": 45},
    ]
    graph = service.get_react_flow_graph(repo_id="test-repo", fallback_symbols=fallback_syms)
    assert graph["is_live_neo4j"] is False
    assert len(graph["nodes"]) == 2
    assert "TenantSubscription" in graph["nodes"][0]["data"]["label"]
    # No edges fabricated between unrelated symbols!
    assert len(graph["edges"]) == 0
    assert not any(e.get("label") == "DEFINED_NEAR" for e in graph["edges"])
    assert "no inter-symbol call or test relationships detected" in graph["note"].lower()


def test_neo4j_react_flow_genuine_relationships():
    """Verifies genuine CALLS and TESTS relationship mapping and data integrity."""
    service = Neo4jGraphService(uri="bolt://127.0.0.1:9999")
    syms = [
        {"id": "sym::api.py::process_order", "name": "process_order", "kind": "function", "file_path": "api.py", "line_start": 10},
        {"id": "sym::db.py::save_order", "name": "save_order", "kind": "function", "file_path": "db.py", "line_start": 20},
        {"id": "sym::test_api.py::test_process_order", "name": "test_process_order", "kind": "test", "file_path": "test_api.py", "line_start": 5},
    ]
    edges = [
        {"source": "sym::api.py::process_order", "target": "sym::db.py::save_order", "label": "CALLS"},
        {"source": "sym::test_api.py::test_process_order", "target": "sym::api.py::process_order", "label": "TESTS"},
        # Invalid edge pointing to nonexistent node
        {"source": "sym::api.py::process_order", "target": "sym::nonexistent::foo", "label": "CALLS"},
    ]
    graph = service.get_react_flow_graph(repo_id="test-repo", fallback_symbols=syms, fallback_edges=edges)
    assert len(graph["nodes"]) == 3
    # Only 2 valid edges; invalid edge to nonexistent node must be discarded
    assert len(graph["edges"]) == 2

    edge_labels = {e["label"] for e in graph["edges"]}
    assert "CALLS" in edge_labels
    assert "TESTS" in edge_labels
    assert "DEFINED_NEAR" not in edge_labels

    # Verify referential integrity
    node_ids = {n["id"] for n in graph["nodes"]}
    for edge in graph["edges"]:
        assert edge["source"] in node_ids
        assert edge["target"] in node_ids

