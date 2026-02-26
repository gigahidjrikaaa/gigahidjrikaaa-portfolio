from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db, SeoSettings

router = APIRouter()

@router.get("/", response_model=Optional[dict])
async def get_public_seo_settings(db: Session = Depends(get_db)):
    """Public endpoint to fetch SEO settings and sitemap config for frontend use."""
    seo = db.query(SeoSettings).first()
    # Return safe defaults even when no row exists
    return {
        "site_title": seo.site_title if seo else None,
        "site_description": seo.site_description if seo else None,
        "keywords": seo.keywords if seo else None,
        "og_image_url": seo.og_image_url if seo else None,
        "canonical_url": seo.canonical_url if seo else None,
        # Sitemap config with defaults
        "sitemap_home_priority": (seo.sitemap_home_priority if seo and seo.sitemap_home_priority is not None else 1.0),
        "sitemap_home_changefreq": (seo.sitemap_home_changefreq if seo and seo.sitemap_home_changefreq else "daily"),
        "sitemap_blog_enabled": (seo.sitemap_blog_enabled if seo and seo.sitemap_blog_enabled is not None else True),
        "sitemap_blog_priority": (seo.sitemap_blog_priority if seo and seo.sitemap_blog_priority is not None else 0.9),
        "sitemap_blog_changefreq": (seo.sitemap_blog_changefreq if seo and seo.sitemap_blog_changefreq else "daily"),
        "sitemap_posts_enabled": (seo.sitemap_posts_enabled if seo and seo.sitemap_posts_enabled is not None else True),
        "sitemap_posts_priority": (seo.sitemap_posts_priority if seo and seo.sitemap_posts_priority is not None else 0.8),
        "sitemap_posts_changefreq": (seo.sitemap_posts_changefreq if seo and seo.sitemap_posts_changefreq else "monthly"),
        "sitemap_custom_pages": seo.sitemap_custom_pages if seo else None,
    }
