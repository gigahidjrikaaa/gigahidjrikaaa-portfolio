from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Experience])
def read_experience(db: Session = Depends(get_db)):
    experience = db.query(models.Experience).order_by(models.Experience.display_order).all()
    return experience
