from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Skill])
def read_skills(db: Session = Depends(get_db)):
    skills = db.query(models.Skill).order_by(models.Skill.display_order).all()
    return skills
