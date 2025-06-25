from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Education
from schemas import EducationResponse, EducationCreate, EducationUpdate
from ..auth import get_current_admin_user

router = APIRouter()

@router.get("/", response_model=List[EducationResponse])
async def get_education(db: Session = Depends(get_db)):
    education = db.query(Education).order_by(Education.display_order.asc()).all()
    return education

@router.post("/", response_model=EducationResponse)
async def create_education(
    education: EducationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_education = Education(**education.dict())
    db.add(db_education)
    db.commit()
    db.refresh(db_education)
    return db_education

@router.put("/{education_id}", response_model=EducationResponse)
async def update_education(
    education_id: int,
    education: EducationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_education = db.query(Education).filter(Education.id == education_id).first()
    if not db_education:
        raise HTTPException(status_code=404, detail="Education not found")
    
    for field, value in education.dict().items():
        setattr(db_education, field, value)
    
    db.commit()
    db.refresh(db_education)
    return db_education

@router.delete("/{education_id}")
async def delete_education(
    education_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_education = db.query(Education).filter(Education.id == education_id).first()
    if not db_education:
        raise HTTPException(status_code=404, detail="Education not found")
    
    db.delete(db_education)
    db.commit()
    return {"message": "Education deleted successfully"}