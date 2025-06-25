from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Project, Experience, Education, Skill, ContactMessage
from schemas import (
    ProjectResponse, 
    ExperienceResponse, 
    EducationResponse, 
    SkillResponse,
    ContactForm,
    ContactMessageResponse
)

router = APIRouter()

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).filter(Project.is_featured == True).order_by(Project.display_order).all()

@router.get("/all", response_model=List[ProjectResponse])
async def get_all_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.display_order).all()

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.get("/experience/", response_model=List[ExperienceResponse])
async def get_experience(db: Session = Depends(get_db)):
    return db.query(Experience).order_by(Experience.display_order).all()

@router.get("/education/", response_model=List[EducationResponse])
async def get_education(db: Session = Depends(get_db)):
    return db.query(Education).order_by(Education.display_order).all()

@router.get("/skills/", response_model=List[SkillResponse])
async def get_skills(db: Session = Depends(get_db)):
    return db.query(Skill).order_by(Skill.category, Skill.display_order).all()

@router.post("/contact", response_model=ContactMessageResponse)
async def send_contact_message(
    contact_form: ContactForm,
    db: Session = Depends(get_db)
):
    db_message = ContactMessage(**contact_form.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message