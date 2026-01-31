from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from datetime import datetime

from ..database import get_db, BlogPost, BlogComment
from ..schemas import BlogCommentCreate, BlogCommentResponse
from ..auth import get_current_user, User
from ..utils import sanitize_text

router = APIRouter()


def sanitize_comment_data(data: dict) -> dict:
    """Sanitize comment data to prevent XSS attacks."""
    sanitized = data.copy()

    if 'author_name' in sanitized and sanitized['author_name']:
        sanitized['author_name'] = sanitize_text(sanitized['author_name'])
    if 'content' in sanitized and sanitized['content']:
        sanitized['content'] = sanitize_text(sanitized['content'])

    return sanitized


@router.get("/{post_id}/comments", response_model=List[BlogCommentResponse])
def get_post_comments(
    post_id: int,
    status: str = "approved",
    db: Session = Depends(get_db)
):
    """Get comments for a specific blog post."""
    comments = (
        db.query(BlogComment)
        .filter(BlogComment.post_id == post_id)
        .filter(BlogComment.status == status)
        .filter(BlogComment.parent_id == None)  # Only top-level comments
        .order_by(BlogComment.created_at.desc())
        .all()
    )
    return comments


@router.get("/{post_id}/comments/{comment_id}/replies", response_model=List[BlogCommentResponse])
def get_comment_replies(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db)
):
    """Get replies to a comment."""
    comments = (
        db.query(BlogComment)
        .filter(BlogComment.post_id == post_id)
        .filter(BlogComment.parent_id == comment_id)
        .filter(BlogComment.status == "approved")
        .order_by(BlogComment.created_at.asc())
        .all()
    )
    return comments


@router.post("/{post_id}/comments", response_model=BlogCommentResponse)
async def create_comment(
    post_id: int,
    comment: BlogCommentCreate,
    db: Session = Depends(get_db)
):
    """Create a new comment."""
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if post.status != "published":
        raise HTTPException(status_code=400, detail="Comments only allowed on published posts")

    sanitized_data = sanitize_comment_data(comment.model_dump())

    # Check for spam (simple keyword filtering)
    spam_keywords = ["viagra", "casino", "lottery", "crypto", "bitcoin"]
    content_lower = sanitized_data.get('content', '').lower()
    if any(keyword in content_lower for keyword in spam_keywords):
        sanitized_data['status'] = "spam"
    else:
        sanitized_data['status'] = "pending"

    db_comment = BlogComment(
        post_id=post_id,
        **sanitized_data
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


# Admin endpoints for comment moderation
@router.get("/admin/comments", response_model=List[BlogCommentResponse])
async def get_all_comments(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all comments (admin only)."""
    query = db.query(BlogComment)
    if status:
        query = query.filter(BlogComment.status == status)
    return query.order_by(BlogComment.created_at.desc()).all()


@router.put("/admin/comments/{comment_id}", response_model=BlogCommentResponse)
async def update_comment_status(
    comment_id: int,
    status: str = Query(..., description="New status: pending, approved, rejected, spam"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update comment status (admin only)."""
    if status not in ["pending", "approved", "rejected", "spam"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    comment = db.query(BlogComment).filter(BlogComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment.status = status
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/admin/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment (admin only)."""
    comment = db.query(BlogComment).filter(BlogComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted successfully"}