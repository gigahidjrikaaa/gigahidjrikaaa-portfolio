from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Project, Technology, Feature
from schemas import ProjectResponse, ProjectCreate, ProjectUpdate
from auth import get_current_admin_user

router = APIRouter()

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.display_order.asc()).all()
    
    # Convert to response format
    project_responses = []
    for project in projects:
        project_dict = {
            "id": project.id,
            "title": project.title,
            "tagline": project.tagline,
            "description": project.description,
            "github_url": project.github_url,
            "live_url": project.live_url,
            "case_study_url": project.case_study_url,
            "role": project.role,
            "team_size": project.team_size,
            "challenges": project.challenges,
            "solutions": project.solutions,
            "impact": project.impact,
            "image_url": project.image_url,
            "is_featured": project.is_featured,
            "display_order": project.display_order,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "tech_stack": [tech.name for tech in project.tech_stack],
            "features": [feature.name for feature in project.features]
        }
        project_responses.append(project_dict)
    
    return project_responses

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {
        "id": project.id,
        "title": project.title,
        "tagline": project.tagline,
        "description": project.description,
        "github_url": project.github_url,
        "live_url": project.live_url,
        "case_study_url": project.case_study_url,
        "role": project.role,
        "team_size": project.team_size,
        "challenges": project.challenges,
        "solutions": project.solutions,
        "impact": project.impact,
        "image_url": project.image_url,
        "is_featured": project.is_featured,
        "display_order": project.display_order,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "tech_stack": [tech.name for tech in project.tech_stack],
        "features": [feature.name for feature in project.features]
    }

@router.post("/", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    # Create project
    db_project = Project(
        title=project.title,
        tagline=project.tagline,
        description=project.description,
        github_url=project.github_url,
        live_url=project.live_url,
        case_study_url=project.case_study_url,
        role=project.role,
        team_size=project.team_size,
        challenges=project.challenges,
        solutions=project.solutions,
        impact=project.impact,
        image_url=project.image_url,
        is_featured=project.is_featured,
        display_order=project.display_order
    )
    
    # Add technologies
    for tech_name in project.tech_stack:
        tech = db.query(Technology).filter(Technology.name == tech_name).first()
        if not tech:
            tech = Technology(name=tech_name)
            db.add(tech)
        db_project.tech_stack.append(tech)
    
    # Add features
    for feature_name in project.features:
        feature = db.query(Feature).filter(Feature.name == feature_name).first()
        if not feature:
            feature = Feature(name=feature_name)
            db.add(feature)
        db_project.features.append(feature)
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return {
        "id": db_project.id,
        "title": db_project.title,
        "tagline": db_project.tagline,
        "description": db_project.description,
        "github_url": db_project.github_url,
        "live_url": db_project.live_url,
        "case_study_url": db_project.case_study_url,
        "role": db_project.role,
        "team_size": db_project.team_size,
        "challenges": db_project.challenges,
        "solutions": db_project.solutions,
        "impact": db_project.impact,
        "image_url": db_project.image_url,
        "is_featured": db_project.is_featured,
        "display_order": db_project.display_order,
        "created_at": db_project.created_at,
        "updated_at": db_project.updated_at,
        "tech_stack": [tech.name for tech in db_project.tech_stack],
        "features": [feature.name for feature in db_project.features]
    }

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update project fields
    for field, value in project.dict(exclude={"tech_stack", "features"}).items():
        setattr(db_project, field, value)
    
    # Update tech stack
    db_project.tech_stack.clear()
    for tech_name in project.tech_stack:
        tech = db.query(Technology).filter(Technology.name == tech_name).first()
        if not tech:
            tech = Technology(name=tech_name)
            db.add(tech)
        db_project.tech_stack.append(tech)
    
    # Update features
    db_project.features.clear()
    for feature_name in project.features:
        feature = db.query(Feature).filter(Feature.name == feature_name).first()
        if not feature:
            feature = Feature(name=feature_name)
            db.add(feature)
        db_project.features.append(feature)
    
    db.commit()
    db.refresh(db_project)
    
    return {
        "id": db_project.id,
        "title": db_project.title,
        "tagline": db_project.tagline,
        "description": db_project.description,
        "github_url": db_project.github_url,
        "live_url": db_project.live_url,
        "case_study_url": db_project.case_study_url,
        "role": db_project.role,
        "team_size": db_project.team_size,
        "challenges": db_project.challenges,
        "solutions": db_project.solutions,
        "impact": db_project.impact,
        "image_url": db_project.image_url,
        "is_featured": db_project.is_featured,
        "display_order": db_project.display_order,
        "created_at": db_project.created_at,
        "updated_at": db_project.updated_at,
        "tech_stack": [tech.name for tech in db_project.tech_stack],
        "features": [feature.name for feature in db_project.features]
    }

@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(db_project)
    db.commit()
    
    return {"message": "Project deleted successfully"}