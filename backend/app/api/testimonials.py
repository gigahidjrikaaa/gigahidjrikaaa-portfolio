from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db, Testimonial
from ..schemas import TestimonialCreate, TestimonialUpdate, TestimonialResponse
from ..auth import get_current_admin_user
from ..utils import sanitize_text

router = APIRouter()

def sanitize_testimonial_data(data: dict) -> dict:
    """Sanitize testimonial data to prevent XSS attacks."""
    sanitized = data.copy()

    text_fields = ['name', 'role', 'company', 'content', 'project_relation']

    for field in text_fields:
        if field in sanitized and sanitized[field]:
            sanitized[field] = sanitize_text(sanitized[field])

    return sanitized


@router.get("", response_model=List[TestimonialResponse])
def get_testimonials(db: Session = Depends(get_db)):
    """Get all testimonials ordered by display_order"""
    return db.query(Testimonial).order_by(Testimonial.display_order).all()

@router.get("/featured", response_model=List[TestimonialResponse])
def get_featured_testimonials(db: Session = Depends(get_db)):
    """Get featured testimonials only"""
    return (
        db.query(Testimonial)
        .filter(Testimonial.is_featured == True)
        .order_by(Testimonial.display_order)
        .all()
    )


@router.get("/{testimonial_id}", response_model=TestimonialResponse)
def get_testimonial(testimonial_id: int, db: Session = Depends(get_db)):
    """Get a specific testimonial by ID"""
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return testimonial


@router.post("", response_model=TestimonialResponse)
def create_testimonial(
    testimonial: TestimonialCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user),
):
    """Create a new testimonial (admin only)"""
    sanitized_data = sanitize_testimonial_data(testimonial.model_dump())
    db_testimonial = Testimonial(**sanitized_data)
    db.add(db_testimonial)
    db.commit()
    db.refresh(db_testimonial)
    return db_testimonial

@router.put("/{testimonial_id}", response_model=TestimonialResponse)
def update_testimonial(
    testimonial_id: int,
    testimonial: TestimonialUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user),
):
    """Update a testimonial (admin only)"""
    db_testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not db_testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")

    update_data = sanitize_testimonial_data(testimonial.model_dump(exclude_unset=True))

    for field, value in update_data.items():
        setattr(db_testimonial, field, value)

    db.commit()
    db.refresh(db_testimonial)
    return db_testimonial

@router.delete("/{testimonial_id}")
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user),
):
    """Delete a testimonial (admin only)"""
    db_testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not db_testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")

    db.delete(db_testimonial)
    db.commit()
    return {"message": "Testimonial deleted successfully"}
