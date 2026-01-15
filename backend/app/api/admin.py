from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db, Project, Experience, Education, Skill, ContactMessage, User, Technology, Feature
from ..auth import get_current_admin_user
from ..schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse, 
    ExperienceCreate, ExperienceResponse, ExperienceUpdate,
    EducationCreate, EducationResponse, EducationUpdate,
    SkillCreate, SkillResponse, SkillUpdate,
    ContactMessageResponse
)

router = APIRouter()

# =============================================================================
# PROJECTS CRUD
# =============================================================================

@router.post("/projects", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_project = Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[ProjectResponse])
async def get_all_projects_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(Project).order_by(Project.display_order).all()

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project_admin(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    for field, value in project.model_dump(exclude_unset=True).items():
        setattr(db_project, field, value)

    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}

# =============================================================================
# EXPERIENCE CRUD
# =============================================================================

@router.post("/experience", response_model=ExperienceResponse)
async def create_experience(
    experience: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_experience = Experience(**experience.model_dump())
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience

@router.get("/experience", response_model=List[ExperienceResponse])
async def get_all_experience_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(Experience).order_by(Experience.display_order).all()

@router.get("/experience/{experience_id}", response_model=ExperienceResponse)
async def get_experience_admin(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_experience = db.query(Experience).filter(Experience.id == experience_id).first()
    if not db_experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    return db_experience

@router.put("/experience/{experience_id}", response_model=ExperienceResponse)
async def update_experience(
    experience_id: int,
    experience: ExperienceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_experience = db.query(Experience).filter(Experience.id == experience_id).first()
    if not db_experience:
        raise HTTPException(status_code=404, detail="Experience not found")

    for field, value in experience.model_dump(exclude_unset=True).items():
        setattr(db_experience, field, value)

    db.commit()
    db.refresh(db_experience)
    return db_experience

@router.delete("/experience/{experience_id}")
async def delete_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_experience = db.query(Experience).filter(Experience.id == experience_id).first()
    if not db_experience:
        raise HTTPException(status_code=404, detail="Experience not found")

    db.delete(db_experience)
    db.commit()
    return {"message": "Experience deleted successfully"}

# =============================================================================
# EDUCATION CRUD
# =============================================================================

@router.post("/education", response_model=EducationResponse)
async def create_education(
    education: EducationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_education = Education(**education.model_dump())
    db.add(db_education)
    db.commit()
    db.refresh(db_education)
    return db_education

@router.get("/education", response_model=List[EducationResponse])
async def get_all_education_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(Education).order_by(Education.display_order).all()

@router.get("/education/{education_id}", response_model=EducationResponse)
async def get_education_admin(
    education_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_education = db.query(Education).filter(Education.id == education_id).first()
    if not db_education:
        raise HTTPException(status_code=404, detail="Education not found")
    return db_education

@router.put("/education/{education_id}", response_model=EducationResponse)
async def update_education(
    education_id: int,
    education: EducationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_education = db.query(Education).filter(Education.id == education_id).first()
    if not db_education:
        raise HTTPException(status_code=404, detail="Education not found")

    for field, value in education.model_dump(exclude_unset=True).items():
        setattr(db_education, field, value)

    db.commit()
    db.refresh(db_education)
    return db_education

@router.delete("/education/{education_id}")
async def delete_education(
    education_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_education = db.query(Education).filter(Education.id == education_id).first()
    if not db_education:
        raise HTTPException(status_code=404, detail="Education not found")

    db.delete(db_education)
    db.commit()
    return {"message": "Education deleted successfully"}

# =============================================================================
# SKILLS CRUD
# =============================================================================

@router.post("/skills", response_model=SkillResponse)
async def create_skill(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_skill = Skill(**skill.model_dump())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.get("/skills", response_model=List[SkillResponse])
async def get_all_skills_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(Skill).order_by(Skill.category, Skill.display_order).all()

@router.get("/skills/{skill_id}", response_model=SkillResponse)
async def get_skill_admin(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return db_skill

@router.put("/skills/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: int,
    skill: SkillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    for field, value in skill.model_dump(exclude_unset=True).items():
        setattr(db_skill, field, value)

    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.delete("/skills/{skill_id}")
async def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(db_skill)
    db.commit()
    return {"message": "Skill deleted successfully"}

# =============================================================================
# CONTACT MESSAGES
# =============================================================================

@router.get("/contact-messages", response_model=List[ContactMessageResponse])
async def get_all_contact_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()

@router.get("/contact-messages/{message_id}", response_model=ContactMessageResponse)
async def get_contact_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message

@router.put("/contact-messages/{message_id}/mark-read")
async def mark_message_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")

    setattr(db_message, "is_read", True)
    db.commit()
    return {"message": "Message marked as read"}

@router.delete("/contact-messages/{message_id}")
async def delete_contact_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")

    db.delete(db_message)
    db.commit()
    return {"message": "Message deleted successfully"}

# =============================================================================
# DASHBOARD STATS
# =============================================================================

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    total_projects = db.query(Project).count()
    featured_projects = db.query(Project).filter(Project.is_featured == True).count()
    total_skills = db.query(Skill).count()
    total_experience = db.query(Experience).count()
    total_education = db.query(Education).count()
    unread_messages = db.query(ContactMessage).filter(ContactMessage.is_read == False).count()
    total_messages = db.query(ContactMessage).count()

    return {
        "total_projects": total_projects,
        "featured_projects": featured_projects,
        "total_skills": total_skills,
        "total_experience": total_experience,
        "total_education": total_education,
        "unread_messages": unread_messages,
        "total_messages": total_messages,
    }
