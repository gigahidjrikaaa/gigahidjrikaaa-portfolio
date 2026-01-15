from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..database import get_db, Service

router = APIRouter()


@router.get("/", response_model=List[schemas.ServiceResponse])
def read_services(db: Session = Depends(get_db)):
    return db.query(Service).order_by(Service.display_order).all()
