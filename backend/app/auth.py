from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db, User
from .config import settings
import secrets

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

ACCESS_TOKEN_COOKIE_NAME = "access_token"
CSRF_COOKIE_NAME = "csrf_token"


def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def should_require_csrf(request: Request) -> bool:
    # Enforce CSRF only for cookie-based auth on state-changing methods.
    return request.method.upper() in {"POST", "PUT", "PATCH", "DELETE"}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token: str | None = None
    used_cookie = False

    if credentials and credentials.credentials:
        token = credentials.credentials
    else:
        cookie_token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)
        if cookie_token:
            token = cookie_token
            used_cookie = True

    if not token:
        raise credentials_exception

    # CSRF protection for cookie-authenticated state changes.
    if used_cookie and should_require_csrf(request):
        csrf_cookie = request.cookies.get(CSRF_COOKIE_NAME) or ""
        csrf_header = request.headers.get("X-CSRF-Token") or ""
        if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token missing or invalid",
            )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username_from_payload = payload.get("sub")
        if username_from_payload is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == username_from_payload).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.is_admin is not True:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user