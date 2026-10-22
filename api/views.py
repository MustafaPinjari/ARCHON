"""REST API views for ARCHON 2.0 Engineering Intelligence Platform."""

from __future__ import annotations
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from archon.repository import RepositoryManager
from archon.investigator import Investigator
from archon.ast_parser import AstExtractor
from archon.neo4j_graph import Neo4jGraphService
from archon.impact_analyzer import ChangeImpactEngine
from archon.evaluation import BenchmarkEvaluator
from api.serializers import (
    PathValidateRequestSerializer,
    RepositoryIndexRequestSerializer,
    InvestigationRequestSerializer,
    ImpactAnalysisRequestSerializer,
)


class HealthCheckView(APIView):
    """GET /api/v1/health/"""

    def get(self, request):
        neo4j = Neo4jGraphService()
        neo4j_status = neo4j.check_connection()
        return Response({
            "status": "healthy",
            "version": "2.0.0",
            "service": "ARCHON — The Engineering Memory Engine",
            "security": {
                "zero_code_execution": True,
                "secret_scrubber_active": True,
                "offline_boundary_enforced": True,
            },
            "neo4j": neo4j_status,
        })


class ValidateRepositoryView(APIView):
    """POST /api/v1/repositories/validate/"""

    def post(self, request):
        ser = PathValidateRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        repo_path = ser.validated_data["path"]
        val = RepositoryManager.validate_path(repo_path)
        mgr = RepositoryManager(repo_path)
        file_count = len(mgr.scan_files()) if val.is_valid else 0

        return Response({
            "is_valid": val.is_valid,
            "resolved_path": val.resolved_path,
            "is_git_repo": val.is_git_repo,
            "git_branch": val.git_branch,
            "error_message": val.error_message,
            "scanned_files_count": file_count,
        })


class IndexRepositoryView(APIView):
    """POST /api/v1/repositories/index/"""

    def post(self, request):
        ser = RepositoryIndexRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        repo_path = ser.validated_data["path"]
        repo_id = ser.validated_data.get("repo_id") or os.path.basename(repo_path)
        mgr = RepositoryManager(repo_path)

        if not mgr.validation.is_valid:
            return Response(
                {"error": mgr.validation.error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )

        files = mgr.scan_files()
        file_dicts = [
            {"relative_path": f.relative_path, "is_test": f.is_test, "size": f.size_bytes}
            for f in files
        ]

        # AST Extraction on python source files
        all_symbols = []
        all_calls = []
        for f in files:
            if f.relative_path.endswith(".py"):
                analysis = AstExtractor.parse_file(f.relative_path, f.absolute_path)
                for s in analysis.symbols:
                    all_symbols.append({
                        "name": s.name,
                        "kind": s.kind,
                        "file_path": s.file_path,
                        "line_start": s.line_start,
                        "line_end": s.line_end,
                        "signature": s.signature,
                        "docstring": s.docstring,
                    })
                for c in analysis.calls:
                    all_calls.append({
                        "caller_file": c.caller_file,
                        "caller_line": c.caller_line,
                        "callee_name": c.callee_name,
                    })

        # Git Archaeology Commits
        commits = []
        if mgr.validation.is_git_repo:
            commits, _ = mgr.search_git_symbol("", limit=20)

        # Ingest into Neo4j
        neo4j = Neo4jGraphService()
        neo4j.init_schema()
        ingest_res = neo4j.ingest_repository(
            repo_id=repo_id,
            repo_name=os.path.basename(repo_path),
            repo_path=mgr.validation.resolved_path,
            branch=mgr.validation.git_branch or "main",
            files=file_dicts,
            symbols=all_symbols,
            calls=all_calls,
            commits=commits,
            tests=[],
        )

        return Response({
            "repo_id": repo_id,
            "resolved_path": mgr.validation.resolved_path,
            "files_indexed": len(file_dicts),
            "symbols_indexed": len(all_symbols),
            "calls_indexed": len(all_calls),
            "neo4j_status": ingest_res,
        })


class RepositorySymbolsView(APIView):
    """GET /api/v1/repositories/symbols/"""

    def get(self, request):
        path = request.query_params.get("path", "")
        if not path:
            # Return demo symbols
            from archon.demo_data import DEMO_SYMBOLS
            return Response({"symbols": [{"name": s, "kind": "demo"} for s in DEMO_SYMBOLS]})

        mgr = RepositoryManager(path)
        if not mgr.validation.is_valid:
            return Response({"error": mgr.validation.error_message}, status=status.HTTP_400_BAD_REQUEST)

        files = mgr.scan_files()
        symbols = []
        for f in files:
            if f.relative_path.endswith(".py"):
                analysis = AstExtractor.parse_file(f.relative_path, f.absolute_path)
                for s in analysis.symbols:
                    symbols.append({
                        "name": s.name,
                        "kind": s.kind,
                        "file_path": s.file_path,
                        "line": s.line_start,
                        "signature": s.signature,
                    })
                if len(symbols) >= 100:
                    break

        return Response({"symbols": symbols, "total_found": len(symbols)})


class InvestigationView(APIView):
    """POST /api/v1/investigations/"""

    def post(self, request):
        ser = InvestigationRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        symbol = ser.validated_data["symbol"]
        question = ser.validated_data["question"]
        repo_path = ser.validated_data.get("repository_path", "")
        is_demo = ser.validated_data.get("is_demo", False) or not repo_path

        investigator = Investigator(repo_path=repo_path if not is_demo else None, is_demo=is_demo)
        result = investigator.investigate(symbol=symbol, question=question)

        # Merge Neo4j graph context if available
        neo4j = Neo4jGraphService()
        graph_data = neo4j.query_symbol_graph(repo_id="default-repo", symbol_name=symbol)

        res_dict = result.to_dict()
        res_dict["graph_context"] = graph_data
        return Response(res_dict)


class RepositoryGraphView(APIView):
    """GET /api/v1/repositories/graph/"""

    def get(self, request):
        path = request.query_params.get("path", "")
        symbol = request.query_params.get("symbol", "")
        repo_id = request.query_params.get("repo_id", "default-repo")

        neo4j = Neo4jGraphService()
        fallback_symbols = []

        if path:
            mgr = RepositoryManager(path)
            if mgr.validation.is_valid:
                files = mgr.scan_files()
                for f in files:
                    if f.relative_path.endswith(".py"):
                        an = AstExtractor.parse_file(f.relative_path, f.absolute_path)
                        for s in an.symbols:
                            fallback_symbols.append({
                                "name": s.name,
                                "kind": s.kind,
                                "file_path": s.file_path,
                                "line_start": s.line_start,
                            })
                    if len(fallback_symbols) >= 30:
                        break

        flow_data = neo4j.get_react_flow_graph(
            repo_id=repo_id,
            symbol_filter=symbol if symbol else None,
            fallback_symbols=fallback_symbols,
        )
        return Response(flow_data)


class ImpactAnalysisView(APIView):
    """POST /api/v1/impact-analysis/"""

    def post(self, request):
        ser = ImpactAnalysisRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        symbol = ser.validated_data["symbol"]
        change = ser.validated_data["proposed_change"]
        path = ser.validated_data.get("repository_path", "")

        engine = ChangeImpactEngine(repo_path=path)
        report = engine.analyze_impact(symbol=symbol, proposed_change_description=change)
        return Response(report.to_dict())


class EvaluationView(APIView):
    """GET /api/v1/evaluation/"""

    def get(self, request):
        summary = BenchmarkEvaluator.run_evaluation()
        return Response(summary.to_dict())
