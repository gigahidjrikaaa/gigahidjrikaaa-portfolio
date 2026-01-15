from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..database import get_db, Experience

router = APIRouter()


@router.get("/", response_model=List[schemas.ExperienceResponse])
def read_experience(db: Session = Depends(get_db)):
    experience = db.query(Experience).order_by(Experience.display_order).all()
    return experience
