from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas
from ..database import get_db, ContactMessage
from ..services.email_service import send_contact_email
from ..utils import sanitize_text

router = APIRouter()


@router.post("/", response_model=schemas.ContactMessageResponse)
async def create_contact_message(message: schemas.ContactForm, db: Session = Depends(get_db)):
    sanitized_data = {
        'name': sanitize_text(message.name),
        'email': message.email,
        'message': sanitize_text(message.message)
    }
    db_message = ContactMessage(**sanitized_data)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    await send_contact_email(sanitized_data['name'], sanitized_data['email'], sanitized_data['message'])
    return db_message
