from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db, ContactMessage
from schemas import ContactForm, ContactMessageResponse
from auth import get_current_admin_user
from services.email_service import EmailService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/")
async def submit_contact_form(contact_data: ContactForm, db: Session = Depends(get_db)):
    try:
        # Save to database
        db_message = ContactMessage(
            name=contact_data.name,
            email=contact_data.email,
            message=contact_data.message
        )
        db.add(db_message)
        db.commit()
        
        # Send email notification
        await EmailService.send_contact_email(
            contact_data.name,
            contact_data.email,
            contact_data.message
        )
        
        logger.info(f"Contact form submitted by {contact_data.name} ({contact_data.email})")
        
        return {
            "message": "Thank you for your message! I'll get back to you soon.",
            "success": True
        }
    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message. Please try again later."
        )

@router.get("/messages", response_model=List[ContactMessageResponse])
async def get_contact_messages(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    messages = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
    return messages

@router.put("/messages/{message_id}/read")
async def mark_message_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.is_read = True
    db.commit()
    
    return {"message": "Message marked as read"}