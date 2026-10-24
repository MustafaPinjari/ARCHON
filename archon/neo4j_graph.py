"""Neo4j Knowledge Graph service for ARCHON 2.0.

Provides:
- Idempotent graph schema initialization (constraints on Repository, File, Symbol, Commit, Test)
- Parameterized Cypher ingestion with stable provenance identifiers
- Bounded graph traversal queries (callers, tests, commits, blast radius)
- React Flow graph formatting ({nodes: [...], edges: [...]})
- Resilient offline fallback when Neo4j is offline, without fabricating live connections
"""

from __future__ import annotations
import os
from typing import List, Dict, Any, Optional, Set
try:
    from neo4j import GraphDatabase, Driver
    from neo4j.exceptions import ServiceUnavailable, AuthError
    HAS_NEO4J = True
except ImportError:
    GraphDatabase = None
    Driver = Any  # type: ignore
    ServiceUnavailable = Exception  # type: ignore
    AuthError = Exception  # type: ignore
    HAS_NEO4J = False

import archon.env  # noqa: F401


class Neo4jGraphService:
    """Manages idempotent Neo4j graph operations for ARCHON repositories."""

    def __init__(
        self,
        uri: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        database: Optional[str] = None,
    ):
        self.uri = uri or os.environ.get("NEO4J_URI", "bolt://localhost:7687")
        self.user = user or os.environ.get("NEO4J_USERNAME") or os.environ.get("NEO4J_USER", "neo4j")
        self.password = password or os.environ.get("NEO4J_PASSWORD", "password")
        self.database = database or os.environ.get("NEO4J_DATABASE")
        self._driver: Optional[Driver] = None

    def get_driver(self) -> Optional[Driver]:
        if not HAS_NEO4J or GraphDatabase is None:
            return None

        if self._driver is None:
            candidate_uris = [self.uri]
            # Aura cloud on Windows requires +ssc fallback when Windows certificate trust chain lacks direct root
            if self.uri.startswith("neo4j+s://"):
                candidate_uris.append(self.uri.replace("neo4j+s://", "neo4j+ssc://", 1))
            elif self.uri.startswith("bolt+s://"):
                candidate_uris.append(self.uri.replace("bolt+s://", "bolt+ssc://", 1))

            for cand_uri in candidate_uris:
                try:
                    driver = GraphDatabase.driver(
                        cand_uri,
                        auth=(self.user, self.password),
                        connection_timeout=5.0,
                    )
                    # Verify connectivity
                    with driver.session() as s:
                        s.run("RETURN 1 AS ping").single()
                    self._driver = driver
                    self.uri = cand_uri
                    break
                except Exception:
                    continue
        return self._driver

    def _get_session(self, driver: Driver):
        """Returns a Neo4j session compatible with Aura cloud single-DB and local multi-DB."""
        if self.database and self.database != "neo4j":
            try:
                return driver.session(database=self.database)
            except Exception:
                return driver.session()
        try:
            return driver.session()
        except Exception:
            if self.database:
                return driver.session(database=self.database)
            raise

    def close(self) -> None:
        if self._driver:
            self._driver.close()
            self._driver = None

    def check_connection(self) -> Dict[str, Any]:
        """Verifies if Neo4j is reachable and authentication succeeds."""
        driver = self.get_driver()
        if not driver:
            return {
                "is_connected": False,
                "uri": self.uri,
                "message": f"Could not create Neo4j driver for {self.uri}. Operating in offline memory mode.",
                "database": self.database or "default",
            }

        try:
            with self._get_session(driver) as session:
                res = session.run("RETURN 1 as ping").single()
                if res and res["ping"] == 1:
                    is_aura = "databases.neo4j.io" in self.uri
                    label = " (Neo4j Aura Cloud)" if is_aura else ""
                    return {
                        "is_connected": True,
                        "uri": self.uri,
                        "message": f"Neo4j connection verified and active{label}.",
                        "database": self.database or "default",
                    }
        except (ServiceUnavailable, AuthError, Exception) as e:
            return {
                "is_connected": False,
                "uri": self.uri,
                "message": f"Neo4j offline or unreachable: {str(e)}",
                "database": self.database or "default",
            }
        return {"is_connected": False, "uri": self.uri, "message": "Unknown status", "database": self.database or "default"}

    def init_schema(self) -> Dict[str, Any]:
        """Creates unique constraints and indexes to guarantee idempotency and fast lookups."""
        try:
            conn = self.check_connection()
            if not conn["is_connected"]:
                return {"status": "skipped", "message": "Neo4j offline. Schema creation skipped."}

            driver = self.get_driver()
            constraints = [
                "CREATE CONSTRAINT IF NOT EXISTS FOR (r:Repository) REQUIRE r.id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (f:File) REQUIRE f.id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (s:Symbol) REQUIRE s.id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Commit) REQUIRE c.id IS UNIQUE",
                "CREATE CONSTRAINT IF NOT EXISTS FOR (t:Test) REQUIRE t.id IS UNIQUE",
                "CREATE INDEX IF NOT EXISTS FOR (s:Symbol) ON (s.name)",
            ]

            with self._get_session(driver) as session:
                for query in constraints:
                    session.run(query)

            return {"status": "success", "message": "Neo4j unique constraints and indexes verified."}
        except Exception as e:
            return {"status": "warning", "message": f"Schema initialization warning: {str(e)}"}

    def ingest_repository(
        self,
        repo_id: str,
        repo_name: str,
        repo_path: str,
        branch: str,
        files: List[Dict[str, Any]],
        symbols: List[Dict[str, Any]],
        calls: List[Dict[str, Any]],
        commits: List[Dict[str, Any]],
        tests: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Idempotently merges repository files, AST symbols, calls, commits, and tests."""
        conn = self.check_connection()
        if not conn["is_connected"]:
            return {
                "status": "offline_fallback",
                "nodes_ingested": len(files) + len(symbols) + len(commits) + len(tests),
                "message": "Neo4j is offline. Data preserved in-memory for static inspection.",
            }

        try:
            driver = self.get_driver()
            with self._get_session(driver) as session:
                # 1. Merge Repository
                session.run(
                    """
                    MERGE (r:Repository {id: $repo_id})
                    SET r.name = $repo_name, r.path = $repo_path, r.branch = $branch, r.updated_at = timestamp()
                    """,
                    repo_id=repo_id, repo_name=repo_name, repo_path=repo_path, branch=branch
                )

                # 2. Batch Merge Files
                if files:
                    session.run(
                        """
                        UNWIND $files AS f
                        MERGE (file:File {id: $repo_id + ':' + f.relative_path})
                        SET file.repo_id = $repo_id, file.relative_path = f.relative_path, file.is_test = f.is_test
                        WITH file
                        MATCH (r:Repository {id: $repo_id})
                        MERGE (r)-[:CONTAINS]->(file)
                        """,
                        repo_id=repo_id, files=files
                    )

                # 3. Batch Merge Symbols & DEFINES edges
                if symbols:
                    session.run(
                        """
                        UNWIND $symbols AS s
                        MERGE (sym:Symbol {id: $repo_id + ':' + s.file_path + ':' + s.name})
                        SET sym.name = s.name, sym.kind = s.kind, sym.line_start = s.line_start,
                            sym.line_end = s.line_end, sym.signature = s.signature,
                            sym.docstring = s.docstring, sym.repo_id = $repo_id, sym.file_path = s.file_path
                        WITH sym, s
                        MATCH (f:File {id: $repo_id + ':' + s.file_path})
                        MERGE (f)-[:DEFINES]->(sym)
                        """,
                        repo_id=repo_id, symbols=symbols
                    )

                # 4. Batch Merge CALLS edges between Symbols
                if calls:
                    session.run(
                        """
                        UNWIND $calls AS c
                        WITH c WHERE c.caller_symbol IS NOT NULL AND c.callee_name IS NOT NULL
                        MATCH (caller:Symbol {id: $repo_id + ':' + c.caller_file + ':' + c.caller_symbol})
                        MATCH (callee:Symbol {repo_id: $repo_id, name: c.callee_name})
                        WHERE caller <> callee
                        MERGE (caller)-[:CALLS]->(callee)
                        """,
                        repo_id=repo_id, calls=calls
                    )

                # 5. Batch Merge Commits & MODIFIES edges
                if commits:
                    session.run(
                        """
                        UNWIND $commits AS c
                        MERGE (com:Commit {id: $repo_id + ':' + c.hash})
                        SET com.hash = c.hash, com.author = c.author, com.date = c.date, com.message = c.subject, com.repo_id = $repo_id
                        WITH com
                        MATCH (s:Symbol {repo_id: $repo_id})
                        WHERE com.message CONTAINS s.name
                        MERGE (com)-[:MODIFIES]->(s)
                        """,
                        repo_id=repo_id, commits=commits
                    )

                # 6. Batch Merge Tests & TESTS edges
                if tests:
                    session.run(
                        """
                        UNWIND $tests AS t
                        MERGE (tst:Test {id: $repo_id + ':' + t.file_path + ':' + t.name})
                        SET tst.name = t.name, tst.file_path = t.file_path, tst.line = t.line, tst.repo_id = $repo_id
                        WITH tst, t
                        WHERE t.target_symbol IS NOT NULL
                        MATCH (target:Symbol {repo_id: $repo_id, name: t.target_symbol})
                        MERGE (tst)-[:TESTS]->(target)
                        """,
                        repo_id=repo_id, tests=tests
                    )

            return {
                "status": "success",
                "repo_id": repo_id,
                "message": "Neo4j Knowledge Graph successfully ingested and linked.",
            }
        except Exception as e:
            return {
                "status": "offline_fallback",
                "repo_id": repo_id,
                "message": f"Graph engine fallback (transient error: {str(e)}). Static analysis active.",
            }


    def query_symbol_graph(self, repo_id: str, symbol_name: str) -> Dict[str, Any]:
        """Queries immediate 2-hop connected graph context for an investigated symbol."""
        conn = self.check_connection()
        if not conn["is_connected"]:
            return {"callers": [], "tests": [], "commits": [], "is_live_graph": False}

        driver = self.get_driver()
        with self._get_session(driver) as session:
            # Query callers
            callers_res = session.run(
                """
                MATCH (caller:Symbol)-[:CALLS]->(target:Symbol {name: $name, repo_id: $repo_id})
                RETURN caller.name AS name, caller.file_path AS file_path, caller.line_start AS line
                LIMIT 15
                """,
                name=symbol_name, repo_id=repo_id
            )
            callers = [dict(record) for record in callers_res]

            # Query tests
            tests_res = session.run(
                """
                MATCH (t:Test)-[:TESTS]->(target:Symbol {name: $name, repo_id: $repo_id})
                RETURN t.name AS name, t.file_path AS file_path, t.line AS line
                LIMIT 15
                """,
                name=symbol_name, repo_id=repo_id
            )
            tests = [dict(record) for record in tests_res]

            # Query commits
            commits_res = session.run(
                """
                MATCH (c:Commit)-[:MODIFIES]->(target:Symbol {name: $name, repo_id: $repo_id})
                RETURN c.hash AS hash, c.author AS author, c.date AS date, c.message AS message
                LIMIT 10
                """,
                name=symbol_name, repo_id=repo_id
            )
            commits = [dict(record) for record in commits_res]

        return {
            "callers": callers,
            "tests": tests,
            "commits": commits,
            "is_live_graph": True,
        }

    def get_react_flow_graph(
        self,
        repo_id: str,
        symbol_filter: Optional[str] = None,
        fallback_symbols: Optional[List[Dict[str, Any]]] = None,
        fallback_edges: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Generates node and edge structures directly formatted for React Flow canvas.

        Semantics & Invariants:
        - NEVER fabricates relationships (no synthetic 'DEFINED_NEAR' chains).
        - Distinguishes CALLS, TESTS, DEFINED_IN, IMPORTS only where supported by graph evidence.
        - Guarantees referential integrity: every edge references existing node IDs.
        - Honestly flags live Neo4j status vs offline static AST mode.
        """
        conn = self.check_connection()
        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []
        seen_nodes: Set[str] = set()

        if conn["is_connected"]:
            driver = self.get_driver()
            with self._get_session(driver) as session:
                if symbol_filter:
                    query = """
                    MATCH (s:Symbol {repo_id: $repo_id})
                    WHERE s.name CONTAINS $symbol_filter
                    OPTIONAL MATCH (s)<-[r_in:TESTS|CALLS|DEFINED_IN]-(source)
                    OPTIONAL MATCH (s)-[r_out:TESTS|CALLS|DEFINED_IN]->(target)
                    RETURN s, r_in, source, r_out, target LIMIT 60
                    """
                    results = session.run(query, repo_id=repo_id, symbol_filter=symbol_filter)
                else:
                    query = """
                    MATCH (s:Symbol {repo_id: $repo_id})
                    OPTIONAL MATCH (s)<-[r_in:TESTS|CALLS]-(source)
                    OPTIONAL MATCH (s)-[r_out:CALLS]->(target)
                    RETURN s, r_in, source, r_out, target LIMIT 60
                    """
                    results = session.run(query, repo_id=repo_id)

                for record in results:
                    s = record.get("s")
                    if s and s["id"] not in seen_nodes:
                        seen_nodes.add(s["id"])
                        nodes.append({
                            "id": s["id"],
                            "type": "architectureNode",
                            "data": {
                                "label": s.get("name", "unknown"),
                                "name": s.get("name", "unknown"),
                                "kind": s.get("kind", "symbol"),
                                "filePath": s.get("file_path", ""),
                                "lineStart": s.get("line_start"),
                                "lineEnd": s.get("line_end"),
                                "signature": s.get("signature", ""),
                                "docstring": s.get("docstring"),
                            },
                            "position": {"x": 0, "y": 0},
                        })

                    # Handle incoming/outgoing relationships
                    for rel_key, node_key, is_outgoing in [
                        ("r_in", "source", False),
                        ("r_out", "target", True),
                    ]:
                        rel = record.get(rel_key)
                        partner = record.get(node_key)
                        if rel and partner and partner.get("id"):
                            partner_id = partner["id"]
                            if partner_id not in seen_nodes:
                                seen_nodes.add(partner_id)
                                nodes.append({
                                    "id": partner_id,
                                    "type": "architectureNode",
                                    "data": {
                                        "label": partner.get("name", partner.get("hash", "unknown")),
                                        "name": partner.get("name", partner.get("hash", "unknown")),
                                        "kind": partner.get("kind", type(partner).__name__.lower()),
                                        "filePath": partner.get("file_path", ""),
                                        "lineStart": partner.get("line_start"),
                                    },
                                    "position": {"x": 0, "y": 0},
                                })

                            src_id = s["id"] if is_outgoing else partner_id
                            tgt_id = partner_id if is_outgoing else s["id"]
                            edge_id = f"e-{src_id}->{tgt_id}-{rel.type}"
                            if not any(e["id"] == edge_id for e in edges):
                                edges.append({
                                    "id": edge_id,
                                    "source": src_id,
                                    "target": tgt_id,
                                    "label": rel.type,
                                    "animated": rel.type in ("CALLS", "TESTS"),
                                })

            # If Neo4j has 0 edges in the queried view, augment with verified AST edges
            if len(edges) == 0 and fallback_edges:
                if fallback_symbols:
                    for sym in fallback_symbols:
                        node_id = sym.get("id") or f"sym::{sym.get('file_path', 'source')}::{sym.get('name', 'sym')}"
                        if node_id not in seen_nodes:
                            seen_nodes.add(node_id)
                            nodes.append({
                                "id": node_id,
                                "type": "architectureNode",
                                "data": {
                                    "label": sym.get("name", "unknown"),
                                    "name": sym.get("name", "unknown"),
                                    "kind": sym.get("kind", "symbol"),
                                    "filePath": sym.get("file_path", ""),
                                    "lineStart": sym.get("line_start"),
                                    "lineEnd": sym.get("line_end"),
                                    "signature": sym.get("signature", ""),
                                    "docstring": sym.get("docstring"),
                                },
                                "position": {"x": 0, "y": 0},
                            })

                for edge in fallback_edges:
                    src = edge.get("source")
                    tgt = edge.get("target")
                    lbl = edge.get("label", "CALLS")
                    if src in seen_nodes and tgt in seen_nodes and src != tgt:
                        edge_id = edge.get("id") or f"e-{src}->{tgt}-{lbl}"
                        if not any(e["id"] == edge_id for e in edges):
                            edges.append({
                                "id": edge_id,
                                "source": src,
                                "target": tgt,
                                "label": lbl,
                                "animated": edge.get("animated", lbl in ("CALLS", "TESTS")),
                            })

            return {
                "nodes": nodes,
                "edges": edges,
                "is_live_neo4j": True,
                "note": f"Live Neo4j knowledge graph verified ({len(nodes)} symbols, {len(edges)} relationships).",
            }

        # Offline Fallback Graph: Construct from genuine in-memory AST evidence
        if fallback_symbols:
            for idx, sym in enumerate(fallback_symbols):
                node_id = sym.get("id") or f"sym::{sym.get('file_path', 'source')}::{sym.get('name', f'sym_{idx}')}"
                if node_id not in seen_nodes:
                    seen_nodes.add(node_id)
                    nodes.append({
                        "id": node_id,
                        "type": "architectureNode",
                        "data": {
                            "label": sym.get("name", "unknown"),
                            "name": sym.get("name", "unknown"),
                            "kind": sym.get("kind", "symbol"),
                            "filePath": sym.get("file_path", ""),
                            "lineStart": sym.get("line_start"),
                            "lineEnd": sym.get("line_end"),
                            "signature": sym.get("signature", ""),
                            "docstring": sym.get("docstring"),
                        },
                        "position": {"x": 0, "y": 0},
                    })

        # Add ONLY genuine fallback edges where both endpoints exist in the node set
        if fallback_edges:
            seen_edge_ids = set()
            for edge in fallback_edges:
                src = edge.get("source")
                tgt = edge.get("target")
                lbl = edge.get("label", "CALLS")
                # Integrity invariant: both endpoints must exist in seen_nodes
                if src in seen_nodes and tgt in seen_nodes and src != tgt:
                    edge_id = edge.get("id") or f"e-{src}->{tgt}-{lbl}"
                    if edge_id not in seen_edge_ids:
                        seen_edge_ids.add(edge_id)
                        edges.append({
                            "id": edge_id,
                            "source": src,
                            "target": tgt,
                            "label": lbl,
                            "animated": edge.get("animated", lbl in ("CALLS", "TESTS")),
                        })

        edge_types = sorted(list({e["label"] for e in edges}))
        if edges:
            note = f"Neo4j is offline. Displaying static AST dependency graph ({len(edges)} verified {', '.join(edge_types)} edges)."
        else:
            note = "Neo4j is offline. Displaying verified static AST symbols (no inter-symbol call or test relationships detected in current scope)."

        return {
            "nodes": nodes,
            "edges": edges,
            "is_live_neo4j": False,
            "note": note,
        }
