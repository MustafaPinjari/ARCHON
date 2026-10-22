"""Tests for deep Python AST extraction in ARCHON 2.0."""

import os
import tempfile
from archon.ast_parser import AstExtractor


def test_ast_extractor_classes_and_functions():
    code = '''"""Module docstring."""
import math
from billing.models import TenantSubscription as SubModel

class PaymentService:
    """Service handling payments."""
    def __init__(self, key: str):
        self.key = key

    async def execute_charge(self, amount: int):
        """Executes charge."""
        sub = SubModel.objects.first()
        return math.floor(amount)
'''
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as f:
        f.write(code)
        f.flush()
        f_path = f.name

    try:
        res = AstExtractor.parse_file("services/payment.py", f_path)
        assert len(res.errors) == 0
        sym_names = [s.name for s in res.symbols]
        assert "PaymentService" in sym_names
        assert "__init__" in sym_names
        assert "execute_charge" in sym_names

        # Check docstring extraction
        svc = next(s for s in res.symbols if s.name == "PaymentService")
        assert "Service handling payments" in (svc.docstring or "")

        # Check import and alias detection
        assert len(res.imports) >= 2
        sub_imp = next(i for i in res.imports if i.name == "TenantSubscription")
        assert sub_imp.alias == "SubModel"

        # Check call extraction
        call_names = [c.callee_name for c in res.calls]
        assert any("math.floor" in cn for cn in call_names)
    finally:
        if os.path.exists(f_path):
            os.remove(f_path)
