from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.models import Story, User
from ..schemas import StoryCreate, StoryUpdate, StoryResponse
from ..auth import get_current_admin_user

router = APIRouter()


@router.get("/", response_model=List[StoryResponse])
def read_stories(db: Session = Depends(get_db)):
    """Get all stories (public endpoint)"""
    return db.query(Story).order_by(Story.display_order).all()


@router.get("/{story_id}", response_model=StoryResponse)
def read_story(story_id: int, db: Session = Depends(get_db)):
    """Get a specific story by ID (public endpoint)"""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story


@router.post("/", response_model=StoryResponse, status_code=status.HTTP_201_CREATED)
def create_story(
    story: StoryCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_admin_user),
):
    """Create a new story (admin only)"""
    db_story = Story(**story.model_dump())
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story


@router.put("/{story_id}", response_model=StoryResponse)
def update_story(
    story_id: int,
    story: StoryUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_admin_user),
):
    """Update an existing story (admin only)"""
    db_story = db.query(Story).filter(Story.id == story_id).first()
    if not db_story:
        raise HTTPException(status_code=404, detail="Story not found")
    for field, value in story.model_dump(exclude_unset=True).items():
        setattr(db_story, field, value)
    db.commit()
    db.refresh(db_story)
    return db_story


@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_story(
    story_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_admin_user),
):
    """Delete a story (admin only)"""
    db_story = db.query(Story).filter(Story.id == story_id).first()
    if not db_story:
        raise HTTPException(status_code=404, detail="Story not found")
    db.delete(db_story)
    db.commit()
