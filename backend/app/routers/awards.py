"""Compatibility module.

Prefer importing from app.api.awards going forward.
"""

from ..api.awards import router

__all__ = ["router"]
