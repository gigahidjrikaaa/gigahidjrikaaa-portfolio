from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..database import get_db, Certificate

router = APIRouter()


@router.get("/", response_model=List[schemas.CertificateResponse])
def read_certificates(db: Session = Depends(get_db)):
    return db.query(Certificate).order_by(Certificate.display_order).all()
