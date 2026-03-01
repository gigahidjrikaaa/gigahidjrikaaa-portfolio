from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db, Testimonial
from ..schemas import TestimonialCreate, TestimonialSubmit, TestimonialUpdate, TestimonialResponse
from ..auth import get_current_admin_user
from ..utils import sanitize_text
from ..services.email_service import send_testimonial_thank_you, send_testimonial_notification

router = APIRouter()


def sanitize_testimonial_data(data: dict) -> dict:
    """Sanitize testimonial data to prevent XSS attacks."""
    sanitized = data.copy()
    text_fields = ['name', 'role', 'company', 'content', 'project_relation']
    for field in text_fields:
        if field in sanitized and sanitized[field]:
            sanitized[field] = sanitize_text(sanitized[field])
    return sanitized


# ─── Public endpoints ──────────────────────────────────────────────────────────

@router.get("", response_model=List[TestimonialResponse])
def get_testimonials(db: Session = Depends(get_db)):
    """Get all approved testimonials ordered by display_order."""
    return (
        db.query(Testimonial)
        .filter(Testimonial.status == "approved")
        .order_by(Testimonial.display_order)
        .all()
    )


@router.get("/featured", response_model=List[TestimonialResponse])
def get_featured_testimonials(db: Session = Depends(get_db)):
    """Get featured approved testimonials only."""
    return (
        db.query(Testimonial)
        .filter(Testimonial.is_featured == True, Testimonial.status == "approved")
        .order_by(Testimonial.display_order)
        .all()
    )


@router.post("/submit", response_model=dict)
async def submit_testimonial(
    testimonial: TestimonialSubmit,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Public endpoint — anyone with the link can submit a testimonial.
    Goes to 'pending' until the admin approves it.
    A thank-you email is sent to the submitter; a notification to the admin.
    """
    data = testimonial.model_dump()
    sanitized = sanitize_testimonial_data(data)
    db_testimonial = Testimonial(
        name=sanitized["name"],
        role=sanitized["role"],
        company=sanitized.get("company"),
        content=sanitized["content"],
        rating=sanitized.get("rating"),
        project_relation=sanitized.get("project_relation"),
        linkedin_url=testimonial.linkedin_url,
        submitter_email=testimonial.submitter_email,
        status="pending",
        is_featured=False,
        display_order=0,
    )
    db.add(db_testimonial)
    db.commit()
    db.refresh(db_testimonial)

    background_tasks.add_task(send_testimonial_thank_you, testimonial.name, testimonial.submitter_email)
    background_tasks.add_task(send_testimonial_notification, testimonial.name, testimonial.role, testimonial.company)

    return {"message": "Thank you! Your testimonial has been received and is pending review."}


@router.get("/{testimonial_id}", response_model=TestimonialResponse)
def get_testimonial(testimonial_id: int, db: Session = Depends(get_db)):
    """Get a specific approved testimonial by ID."""
    t = db.query(Testimonial).filter(
        Testimonial.id == testimonial_id, Testimonial.status == "approved"
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return t


# ─── Admin endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=List[TestimonialResponse])
def admin_get_all(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    """Admin: get every testimonial regardless of status."""
    return db.query(Testimonial).order_by(Testimonial.status, Testimonial.created_at.desc()).all()


@router.get("/admin/pending", response_model=List[TestimonialResponse])
def admin_get_pending(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    """Admin: list testimonials waiting for review."""
    return (
        db.query(Testimonial)
        .filter(Testimonial.status == "pending")
        .order_by(Testimonial.created_at.desc())
        .all()
    )


@router.post("/admin/{testimonial_id}/approve", response_model=TestimonialResponse)
def admin_approve(
    testimonial_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    """Admin: approve and publish a pending testimonial."""
    t = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    setattr(t, "status", "approved")
    setattr(t, "is_featured", True)
    db.commit()
    db.refresh(t)
    return t


@router.post("/admin/{testimonial_id}/reject", response_model=TestimonialResponse)
def admin_reject(
    testimonial_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    """Admin: reject a pending testimonial."""
    t = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    setattr(t, "status", "rejected")
    setattr(t, "is_featured", False)
    db.commit()
    db.refresh(t)
    return t


@router.post("", response_model=TestimonialResponse)
def create_testimonial(
    testimonial: TestimonialCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    """Admin: manually create an already-approved testimonial."""
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
    current_user=Depends(get_current_admin_user),
):
    """Admin: update any field on a testimonial."""
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
    current_user=Depends(get_current_admin_user),
):
    """Admin: permanently delete a testimonial."""
    db_testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not db_testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(db_testimonial)
    db.commit()
    return {"message": "Testimonial deleted successfully"}
