"""Compatibility module.

Prefer importing from app.api.blog going forward.
"""

from ..api.blog import router

__all__ = ["router"]
