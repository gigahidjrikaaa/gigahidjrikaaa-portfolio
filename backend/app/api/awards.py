from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..database import get_db, Award

router = APIRouter()


@router.get("/", response_model=List[schemas.AwardResponse])
def read_awards(db: Session = Depends(get_db)):
    return db.query(Award).order_by(Award.display_order).all()
