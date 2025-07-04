from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services.email_service import send_contact_email

router = APIRouter()

@router.post("/", response_model=schemas.ContactMessage)
def create_contact_message(message: schemas.ContactMessageCreate, db: Session = Depends(get_db)):
    db_message = models.ContactMessage(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    send_contact_email(message.name, message.email, message.message)
    return db_message
