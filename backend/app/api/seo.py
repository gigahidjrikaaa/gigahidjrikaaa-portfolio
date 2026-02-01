from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db, SeoSettings

router = APIRouter()

@router.get("/", response_model=Optional[dict])
async def get_public_seo_settings(db: Session = Depends(get_db)):
    """Public endpoint to fetch SEO settings for frontend metadata."""
    seo = db.query(SeoSettings).first()
    if not seo:
        return None
    return {
        "site_title": seo.site_title,
        "site_description": seo.site_description,
        "keywords": seo.keywords,
        "og_image_url": seo.og_image_url,
        "canonical_url": seo.canonical_url,
    }
