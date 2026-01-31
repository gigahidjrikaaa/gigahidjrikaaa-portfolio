from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, cast
from datetime import datetime
from .. import schemas
from ..database import get_db, BlogPost
from ..config import settings

router = APIRouter()


@router.get("/", response_model=List[schemas.BlogPostResponse])
def read_blog_posts(db: Session = Depends(get_db)):
    return (
        db.query(BlogPost)
        .filter(BlogPost.status != "draft")
        .order_by(BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc())
        .all()
    )


@router.get("/paged", response_model=schemas.BlogPostListResponse)
def read_blog_posts_paged(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(9, ge=1, le=50),
    category: str | None = None,
    q: str | None = None,
):
    query = db.query(BlogPost).filter(BlogPost.status != "draft")

    if category:
        query = query.filter(BlogPost.category.ilike(category))

    if q:
        q_like = f"%{q}%"
        query = query.filter(
            (BlogPost.title.ilike(q_like))
            | (BlogPost.excerpt.ilike(q_like))
            | (BlogPost.content.ilike(q_like))
            | (BlogPost.tags.ilike(q_like))
        )

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    items = (
        query.order_by(BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    categories = [
        row[0]
        for row in db.query(func.distinct(BlogPost.category))
        .filter(BlogPost.category.isnot(None))
        .all()
        if row[0]
    ]

    popular = (
        db.query(BlogPost)
        .filter(BlogPost.status == "published")
        .order_by(BlogPost.view_count.desc(), BlogPost.created_at.desc())
        .limit(3)
        .all()
    )

    featured = (
        db.query(BlogPost)
        .filter(BlogPost.status == "published")
        .filter(BlogPost.is_featured == True)
        .order_by(BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc())
        .limit(3)
        .all()
    )

    latest = (
        db.query(BlogPost)
        .filter(BlogPost.status != "draft")
        .order_by(BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc())
        .limit(3)
        .all()
    )

    return schemas.BlogPostListResponse(
        items=cast(List[schemas.BlogPostResponse], items),
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        categories=categories,
        popular=cast(List[schemas.BlogPostResponse], popular),
        latest=cast(List[schemas.BlogPostResponse], latest),
        featured=cast(List[schemas.BlogPostResponse], featured),
    )


@router.get("/related", response_model=List[schemas.BlogPostResponse])
def read_related_posts(
    slug: str = Query(...),
    db: Session = Depends(get_db),
):
    current = (
        db.query(BlogPost)
        .filter(BlogPost.slug == slug)
        .filter(BlogPost.status != "draft")
        .first()
    )
    if not current:
        raise HTTPException(status_code=404, detail="Blog post not found")

    related_query = db.query(BlogPost).filter(
        BlogPost.status == "published",
        BlogPost.slug != slug,
    )

    current_category = cast(str | None, current.category)
    current_tags = cast(str | None, current.tags)
    if current_category:
        related_query = related_query.filter(BlogPost.category.ilike(current_category))
    elif current_tags:
        tags = [t.strip() for t in (current_tags or "").split(",") if t.strip()]
        if tags:
            tag_filters = [BlogPost.tags.ilike(f"%{tag}%") for tag in tags]
            related_query = related_query.filter(or_(*tag_filters))

    return (
        related_query
        .order_by(BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc())
        .limit(3)
        .all()
    )


@router.get("/{slug}", response_model=schemas.BlogPostResponse)
def read_blog_post(slug: str, db: Session = Depends(get_db)):
    post = (
        db.query(BlogPost)
        .filter(BlogPost.slug == slug)
        .filter(BlogPost.status != "draft")
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post


@router.post("/{slug}/view")
def track_blog_view(slug: str, db: Session = Depends(get_db)):
    post = (
        db.query(BlogPost)
        .filter(BlogPost.slug == slug)
        .filter(BlogPost.status == "published")
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    view_count = (cast(int | None, post.view_count) or 0) + 1
    setattr(post, "view_count", view_count)
    db.commit()
    return {"message": "view tracked", "view_count": post.view_count}


@router.post("/{slug}/like")
def track_blog_like(slug: str, db: Session = Depends(get_db)):
    post = (
        db.query(BlogPost)
        .filter(BlogPost.slug == slug)
        .filter(BlogPost.status == "published")
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    like_count = (cast(int | None, post.like_count) or 0) + 1
    setattr(post, "like_count", like_count)
    db.commit()
    return {"message": "like tracked", "like_count": post.like_count}


@router.get("/rss")
async def get_rss_feed(db: Session = Depends(get_db)):
    """Generate RSS 2.0 feed for blog posts."""
    posts = (
        db.query(BlogPost)
        .filter(BlogPost.status == "published")
        .filter(BlogPost.published_at.isnot(None))
        .order_by(BlogPost.published_at.desc())
        .limit(20)
        .all()
    )

    site_url = settings.SITE_URL
    site_title = settings.PROJECT_NAME

    rss_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{site_title} - Blog</title>
    <link>{site_url}/blog</link>
    <description>Latest articles on software development, AI, and blockchain</description>
    <language>en-us</language>
    <atom:link href="{site_url}/blog/rss" rel="self" type="application/rss+xml"/>
    <lastBuildDate>{datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')}</lastBuildDate>
"""

    for post in posts:
        if post.published_at:
            pub_date = post.published_at.strftime('%a, %d %b %Y %H:%M:%S GMT')
            description = post.excerpt or ""

            rss_content += f"""
    <item>
      <title>{post.title}</title>
      <link>{site_url}/blog/{post.slug}</link>
      <description><![CDATA[{description}]]></description>
      <pubDate>{pub_date}</pubDate>
      <guid isPermaLink="true">{site_url}/blog/{post.slug}</guid>
      <category>{post.category or 'General'}</category>
    </item>"""

    rss_content += """
  </channel>
</rss>"""

    return Response(content=rss_content, media_type="application/rss+xml")

