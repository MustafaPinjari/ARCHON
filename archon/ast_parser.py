"""Deep Python AST analyzer for ARCHON 2.0.

Extracts deterministic structural facts:
- Function and class definitions with line ranges, docstrings, and signatures
- Module-level imports and alias bindings
- Intra-module and cross-module function/method calls
- Class inheritance relationships
"""

from __future__ import annotations
import ast
import os
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Set, Tuple


@dataclass
class AstSymbol:
    """Represents a function, async function, or class extracted via AST."""
    name: str
    kind: str  # "class", "function", "async_function", "method"
    file_path: str
    line_start: int
    line_end: int
    signature: str
    docstring: Optional[str] = None
    decorators: List[str] = field(default_factory=list)
    parent_class: Optional[str] = None
    inherits_from: List[str] = field(default_factory=list)


@dataclass
class AstImport:
    """Represents an imported module or symbol with alias mappings."""
    file_path: str
    line_number: int
    module: Optional[str]
    name: str
    alias: Optional[str] = None
    is_from_import: bool = False


@dataclass
class AstCall:
    """Represents a function or method invocation with line location."""
    caller_file: str
    caller_line: int
    callee_name: str
    enclosing_symbol: Optional[str] = None


@dataclass
class FileAstAnalysis:
    """Complete AST breakdown for a single source file."""
    file_path: str
    symbols: List[AstSymbol] = field(default_factory=list)
    imports: List[AstImport] = field(default_factory=list)
    calls: List[AstCall] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


class AstExtractor:
    """Safely extracts AST metadata from Python source files without execution."""

    @classmethod
    def parse_file(cls, relative_path: str, absolute_path: str) -> FileAstAnalysis:
        analysis = FileAstAnalysis(file_path=relative_path)
        try:
            with open(absolute_path, "r", encoding="utf-8", errors="ignore") as fh:
                source_code = fh.read()
            tree = ast.parse(source_code, filename=relative_path)
        except Exception as e:
            analysis.errors.append(f"AST parse error in {relative_path}: {str(e)}")
            return analysis

        cls._extract_nodes(tree, relative_path, analysis)
        return analysis

    @classmethod
    def _extract_nodes(cls, tree: ast.AST, rel_path: str, analysis: FileAstAnalysis) -> None:
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, ast.ClassDef):
                cls._process_class(node, rel_path, analysis)
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                cls._process_function(node, rel_path, analysis, parent_class=None)
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    analysis.imports.append(
                        AstImport(
                            file_path=rel_path,
                            line_number=node.lineno,
                            module=None,
                            name=alias.name,
                            alias=alias.asname,
                            is_from_import=False,
                        )
                    )
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    analysis.imports.append(
                        AstImport(
                            file_path=rel_path,
                            line_number=node.lineno,
                            module=node.module,
                            name=alias.name,
                            alias=alias.asname,
                            is_from_import=True,
                        )
                    )

        # Walk entire tree to record function/method calls
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                callee_name = cls._resolve_callee_name(node.func)
                if callee_name:
                    analysis.calls.append(
                        AstCall(
                            caller_file=rel_path,
                            caller_line=node.lineno,
                            callee_name=callee_name,
                        )
                    )

    @classmethod
    def _process_class(cls, node: ast.ClassDef, rel_path: str, analysis: FileAstAnalysis) -> None:
        bases = [cls._resolve_callee_name(b) or ast.unparse(b) for b in node.bases]
        docstring = ast.get_docstring(node)
        decorators = [cls._resolve_callee_name(d) or ast.unparse(d) for d in node.decorator_list]
        end_line = getattr(node, "end_lineno", node.lineno)

        analysis.symbols.append(
            AstSymbol(
                name=node.name,
                kind="class",
                file_path=rel_path,
                line_start=node.lineno,
                line_end=end_line,
                signature=f"class {node.name}({', '.join(bases)}):",
                docstring=docstring,
                decorators=decorators,
                inherits_from=bases,
            )
        )

        for child in node.body:
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                cls._process_function(child, rel_path, analysis, parent_class=node.name)

    @classmethod
    def _process_function(
        cls,
        node: ast.FunctionDef | ast.AsyncFunctionDef,
        rel_path: str,
        analysis: FileAstAnalysis,
        parent_class: Optional[str] = None,
    ) -> None:
        docstring = ast.get_docstring(node)
        decorators = [cls._resolve_callee_name(d) or ast.unparse(d) for d in node.decorator_list]
        end_line = getattr(node, "end_lineno", node.lineno)
        kind = "method" if parent_class else ("async_function" if isinstance(node, ast.AsyncFunctionDef) else "function")

        # Format signature from args
        arg_names = [a.arg for a in node.args.args]
        prefix = "async def" if isinstance(node, ast.AsyncFunctionDef) else "def"
        sig = f"{prefix} {node.name}({', '.join(arg_names)}):"

        analysis.symbols.append(
            AstSymbol(
                name=node.name,
                kind=kind,
                file_path=rel_path,
                line_start=node.lineno,
                line_end=end_line,
                signature=sig,
                docstring=docstring,
                decorators=decorators,
                parent_class=parent_class,
            )
        )

    @staticmethod
    def _resolve_callee_name(func_node: ast.AST) -> Optional[str]:
        if isinstance(func_node, ast.Name):
            return func_node.id
        elif isinstance(func_node, ast.Attribute):
            # E.g. CreditManager.deduct_credits or self.assert_equal
            parent = ast.unparse(func_node.value) if hasattr(ast, "unparse") else ""
            return f"{parent}.{func_node.attr}" if parent else func_node.attr
        return None
