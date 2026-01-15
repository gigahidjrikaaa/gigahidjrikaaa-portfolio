"""Compatibility module.

Prefer importing from app.api.certificates going forward.
"""

from ..api.certificates import router

__all__ = ["router"]
