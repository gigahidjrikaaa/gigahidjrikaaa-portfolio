"""Compatibility module.

Prefer importing from app.api.services going forward.
"""

from ..api.services import router

__all__ = ["router"]
