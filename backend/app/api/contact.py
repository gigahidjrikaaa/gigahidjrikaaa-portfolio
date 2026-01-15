from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas
from ..database import get_db, ContactMessage
from ..services.email_service import send_contact_email

router = APIRouter()


@router.post("/", response_model=schemas.ContactMessageResponse)
async def create_contact_message(message: schemas.ContactForm, db: Session = Depends(get_db)):
    db_message = ContactMessage(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    await send_contact_email(message.name, message.email, message.message)
    return db_message
