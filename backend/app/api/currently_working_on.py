from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.models import CurrentlyWorkingOn
from ..schemas import CurrentlyWorkingOnCreate, CurrentlyWorkingOnUpdate, CurrentlyWorkingOnResponse

router = APIRouter()


@router.get("/", response_model=List[CurrentlyWorkingOnResponse])
def read_currently_working_on(db: Session = Depends(get_db)):
    """Get all active projects (public endpoint)"""
    return db.query(CurrentlyWorkingOn).order_by(CurrentlyWorkingOn.display_order).all()


@router.get("/{project_id}", response_model=CurrentlyWorkingOnResponse)
def read_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project by ID (public endpoint)"""
    project = db.query(CurrentlyWorkingOn).filter(CurrentlyWorkingOn.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/", response_model=CurrentlyWorkingOnResponse, status_code=status.HTTP_201_CREATED)
def create_project(project: CurrentlyWorkingOnCreate, db: Session = Depends(get_db)):
    """Create a new project (admin endpoint)"""
    db_project = CurrentlyWorkingOn(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.put("/{project_id}", response_model=CurrentlyWorkingOnResponse)
def update_project(project_id: int, project: CurrentlyWorkingOnUpdate, db: Session = Depends(get_db)):
    """Update an existing project (admin endpoint)"""
    db_project = db.query(CurrentlyWorkingOn).filter(CurrentlyWorkingOn.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)

    db.commit()
    db.refresh(db_project)
    return db_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project (admin endpoint)"""
    db_project = db.query(CurrentlyWorkingOn).filter(CurrentlyWorkingOn.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.models import CurrentlyWorkingOn
from ..schemas import CurrentlyWorkingOnCreate, CurrentlyWorkingOnUpdate, CurrentlyWorkingOnResponse

router = APIRouter()


@router.get("/", response_model=List[CurrentlyWorkingOnResponse])
def read_currently_working_on(db: Session = Depends(get_db)):
    """Get all active projects (public endpoint)"""
    return db.query(CurrentlyWorkingOn).order_by(CurrentlyWorkingOn.display_order).all()


@router.get("/{project_id}", response_model=CurrentlyWorkingOnResponse)
def read_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project by ID (public endpoint)"""
    project = db.query(CurrentlyWorkingOn).filter(CurrentlyWorkingOn.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/", response_model=CurrentlyWorkingOnResponse, status_code=status.HTTP_201_CREATED)
def create_project(project: CurrentlyWorkingOnCreate, db: Session = Depends(get_db)):
    """Create a new project (admin endpoint)"""
    db_project = CurrentlyWorkingOn(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.put("/{project_id}", response_model=CurrentlyWorkingOnResponse)
def update_project(project_id: int, project: CurrentlyWorkingOnUpdate, db: Session = Depends(get_db)):
    """Update an existing project (admin endpoint)"""
    db_project = db.query(CurrentlyWorkingOn).filter(CurrentlyWorkingOn.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)

    db.commit()
    db.refresh(db_project)
    return db_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project (admin endpoint)"""
    db_project = db.query(CurrentlyWorkingOn).filter(CurrentlyWorkingOn.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}
