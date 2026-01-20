from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db, Profile
from ..schemas import ProfileResponse

router = APIRouter()


@router.get("/", response_model=ProfileResponse)
async def get_profile(db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile()
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile
