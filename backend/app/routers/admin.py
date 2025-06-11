from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Project, Experience, Education, Skill, ContactMessage, User
from ..auth import get_current_admin_user
from schemas import ProjectCreate, ProjectResponse, ExperienceCreate, EducationCreate, SkillCreate

router = APIRouter()

# Projects CRUD
@router.post("/projects", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[ProjectResponse])
async def get_all_projects_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(Project).all()

@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for field, value in project.dict().items():
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

# Dashboard Stats
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

# Add similar CRUD operations for Experience, Education, Skills, etc.