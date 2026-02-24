"""
api/scraper.py
--------------
Admin-only endpoint: POST /admin/scrape
Accepts a URL + content_type, scrapes the page, and returns Z.AI-analyzed
structured data ready to pre-fill admin forms.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import AnyHttpUrl, BaseModel, field_validator

from ..auth import get_current_admin_user
from ..database import User
from ..services.scraper_service import ContentType, analyze_with_ai, scrape_url

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class ScrapeRequest(BaseModel):
    url: str
    content_type: ContentType

    @field_validator("url")
    @classmethod
    def _validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


class ScrapeResponse(BaseModel):
    """
    Generic wrapper — the `data` field holds a content-type-specific dict
    that matches the corresponding form schema on the frontend.
    """
    content_type: ContentType
    url: str
    data: dict[str, Any]


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/scrape",
    response_model=ScrapeResponse,
    summary="Scrape & analyze a URL with Z.AI",
    description=(
        "Fetches the given URL, extracts key metadata, and passes it to Z.AI "
        "for intelligent structuring into the requested content type. "
        "Returns a `data` dict pre-filled for the admin form."
    ),
)
async def scrape_and_analyze(
    body: ScrapeRequest,
    _current_user: User = Depends(get_current_admin_user),
) -> ScrapeResponse:
    url = body.url
    content_type = body.content_type

    # 1. Fetch + parse the page
    try:
        scraped = await scrape_url(url)
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"The target URL timed out: {url}",
        )
    except httpx.HTTPStatusError as exc:
        code = exc.response.status_code
        if code == 403:
            detail = f"The target site blocked the request (HTTP 403 Forbidden): {url}"
        elif code == 401:
            detail = f"The target site requires authentication (HTTP 401): {url}"
        elif code in (500, 502, 503, 504):
            detail = (
                f"The target site is currently unavailable (HTTP {code}): {url}. "
                f"This is a problem on their server, not ours. Try again later."
            )
        else:
            detail = f"The target site returned HTTP {code}: {url}"
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)
    except httpx.ConnectError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not connect to the target site ({url}): {exc}",
        )
    except httpx.UnsupportedProtocol as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported protocol for URL {url}: {exc}",
        )
    except Exception as exc:
        logger.error("Scraping failed for %s: %s", url, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch the URL: {exc}",
        )

    # 2. AI-powered analysis
    try:
        structured = await analyze_with_ai(scraped, content_type)
    except Exception as exc:
        logger.error("AI analysis failed for %s: %s", url, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {exc}",
        )

    return ScrapeResponse(
        content_type=content_type,
        url=url,
        data=structured,
    )
