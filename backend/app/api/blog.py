from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List
from .. import schemas
from ..database import get_db, BlogPost

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
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        categories=categories,
        popular=popular,
        latest=latest,
        featured=featured,
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

    if current.category:
        related_query = related_query.filter(BlogPost.category.ilike(current.category))
    elif current.tags:
        tags = [t.strip() for t in (current.tags or "").split(",") if t.strip()]
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
    post.view_count = (post.view_count or 0) + 1
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
    post.like_count = (post.like_count or 0) + 1
    db.commit()
    return {"message": "like tracked", "like_count": post.like_count}
