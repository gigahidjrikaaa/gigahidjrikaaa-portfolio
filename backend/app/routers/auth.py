from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db, User
from schemas import UserLogin, Token, UserResponse
from auth import authenticate_user, create_access_token, get_password_hash
from config import settings

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/initialize-admin")
async def initialize_admin(db: Session = Depends(get_db)):
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists"
        )
    
    # Create admin user
    admin_user = User(
        username=settings.ADMIN_USERNAME,
        email="admin@example.com",
        hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
        is_admin=True
    )
    db.add(admin_user)
    db.commit()
    
    return {"message": "Admin user created successfully"}