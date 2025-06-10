from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Project, Experience, Education, Skill, ContactMessage
from ..auth import get_current_admin_user
from sqlalchemy import func

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    stats = {
        "total_projects": db.query(Project).count(),
        "total_experience": db.query(Experience).count(),
        "total_education": db.query(Education).count(),
        "total_skills": db.query(Skill).count(),
        "total_messages": db.query(ContactMessage).count(),
        "unread_messages": db.query(ContactMessage).filter(ContactMessage.is_read == False).count(),
        "featured_projects": db.query(Project).filter(Project.is_featured == True).count(),
    }
    
    return stats