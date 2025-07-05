from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..database import get_db, Skill

router = APIRouter()

@router.get("/", response_model=List[schemas.SkillResponse])
def read_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).order_by(Skill.display_order).all()
    return skills
