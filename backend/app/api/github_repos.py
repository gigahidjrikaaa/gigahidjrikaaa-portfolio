from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..auth import get_current_admin_user
from ..database import get_db
from ..models.models import HighlightedGitHubRepo, User
from ..schemas import (
    HighlightedGitHubRepoCreate,
    HighlightedGitHubRepoResponse,
    HighlightedGitHubRepoUpdate,
)

public_router = APIRouter()
admin_router = APIRouter()


@public_router.get("/highlighted", response_model=List[HighlightedGitHubRepoResponse])
def read_highlighted_github_repos(db: Session = Depends(get_db)):
    return (
        db.query(HighlightedGitHubRepo)
        .filter(HighlightedGitHubRepo.is_active.is_(True))
        .order_by(HighlightedGitHubRepo.display_order, HighlightedGitHubRepo.id)
        .all()
    )


@admin_router.get("/", response_model=List[HighlightedGitHubRepoResponse])
def read_all_github_repos(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_admin_user),
):
    return (
        db.query(HighlightedGitHubRepo)
        .order_by(HighlightedGitHubRepo.display_order, HighlightedGitHubRepo.id)
        .all()
    )


@admin_router.post("/", response_model=HighlightedGitHubRepoResponse, status_code=status.HTTP_201_CREATED)
def create_github_repo(
    payload: HighlightedGitHubRepoCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_admin_user),
):
    repo = HighlightedGitHubRepo(**payload.model_dump())
    db.add(repo)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Repository is already in the highlighted list",
        )

    db.refresh(repo)
    return repo


@admin_router.put("/{repo_id}", response_model=HighlightedGitHubRepoResponse)
def update_github_repo(
    repo_id: int,
    payload: HighlightedGitHubRepoUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_admin_user),
):
    repo = db.query(HighlightedGitHubRepo).filter(HighlightedGitHubRepo.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Highlighted repository not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(repo, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Repository is already in the highlighted list",
        )

    db.refresh(repo)
    return repo


@admin_router.delete("/{repo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_github_repo(
    repo_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_admin_user),
):
    repo = db.query(HighlightedGitHubRepo).filter(HighlightedGitHubRepo.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Highlighted repository not found")

    db.delete(repo)
    db.commit()
