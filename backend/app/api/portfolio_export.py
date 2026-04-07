from __future__ import annotations

from datetime import date
import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.portfolio_export_service import build_portfolio_pdf, collect_portfolio_data

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/export")
async def export_portfolio_pdf(db: Session = Depends(get_db)) -> Response:
    try:
        payload = collect_portfolio_data(db)
        pdf_bytes = await run_in_threadpool(build_portfolio_pdf, payload)
    except Exception:
        logger.exception("Failed to generate portfolio export PDF")
        raise HTTPException(status_code=500, detail="Unable to generate portfolio export right now.")

    filename = f"portfolio-{date.today().strftime('%Y%m%d')}.pdf"
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Cache-Control": "public, max-age=300",
    }

    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
