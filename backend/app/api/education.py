from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..database import get_db, Education

router = APIRouter()


@router.get("/", response_model=List[schemas.EducationResponse])
def read_education(db: Session = Depends(get_db)):
    education = db.query(Education).order_by(Education.display_order).all()
    return education
