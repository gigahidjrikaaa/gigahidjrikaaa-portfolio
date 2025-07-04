from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Education])
def read_education(db: Session = Depends(get_db)):
    education = db.query(models.Education).order_by(models.Education.display_order).all()
    return education
