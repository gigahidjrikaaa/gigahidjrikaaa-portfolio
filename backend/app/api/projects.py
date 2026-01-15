from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from typing import List
from ..database import get_db, Project
from ..schemas import ProjectResponse

router = APIRouter()


@router.get("/", response_model=List[ProjectResponse])
async def get_projects(db: Session = Depends(get_db)):
    return (
        db.query(Project)
        .options(selectinload(Project.images))
        .filter(Project.is_featured == True)
        .order_by(Project.display_order)
        .all()
    )


@router.get("/all", response_model=List[ProjectResponse])
async def get_all_projects(db: Session = Depends(get_db)):
    return (
        db.query(Project)
        .options(selectinload(Project.images))
        .order_by(Project.display_order)
        .all()
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    project = (
        db.query(Project)
        .options(selectinload(Project.images))
        .filter(Project.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
