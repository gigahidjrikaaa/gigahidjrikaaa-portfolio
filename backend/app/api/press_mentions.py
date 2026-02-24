from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.models import PressMention, User
from ..schemas import PressMentionCreate, PressMentionUpdate, PressMentionResponse
from ..auth import get_current_admin_user

router = APIRouter()


@router.get("/", response_model=List[PressMentionResponse])
def read_press_mentions(db: Session = Depends(get_db)):
    """Get all press mentions (public endpoint)"""
    return db.query(PressMention).order_by(PressMention.display_order).all()


@router.get("/{mention_id}", response_model=PressMentionResponse)
def read_press_mention(mention_id: int, db: Session = Depends(get_db)):
    """Get a specific press mention by ID (public endpoint)"""
    mention = db.query(PressMention).filter(PressMention.id == mention_id).first()
    if not mention:
        raise HTTPException(status_code=404, detail="Press mention not found")
    return mention


@router.post("/", response_model=PressMentionResponse, status_code=status.HTTP_201_CREATED)
def create_press_mention(
    mention: PressMentionCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_admin_user),
):
    """Create a new press mention (admin only)"""
    db_mention = PressMention(**mention.model_dump())
    db.add(db_mention)
    db.commit()
    db.refresh(db_mention)
    return db_mention


@router.put("/{mention_id}", response_model=PressMentionResponse)
def update_press_mention(
    mention_id: int,
    mention: PressMentionUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_admin_user),
):
    """Update an existing press mention (admin only)"""
    db_mention = db.query(PressMention).filter(PressMention.id == mention_id).first()
    if not db_mention:
        raise HTTPException(status_code=404, detail="Press mention not found")
    for field, value in mention.model_dump(exclude_unset=True).items():
        setattr(db_mention, field, value)
    db.commit()
    db.refresh(db_mention)
    return db_mention


@router.delete("/{mention_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_press_mention(
    mention_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_admin_user),
):
    """Delete a press mention (admin only)"""
    db_mention = db.query(PressMention).filter(PressMention.id == mention_id).first()
    if not db_mention:
        raise HTTPException(status_code=404, detail="Press mention not found")
    db.delete(db_mention)
    db.commit()

