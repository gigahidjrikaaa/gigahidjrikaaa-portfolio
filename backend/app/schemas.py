from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Base schemas
class ProjectBase(BaseModel):
    title: str
    tagline: str
    description: str
    github_url: str
    live_url: Optional[str] = None
    case_study_url: Optional[str] = None
    role: str
    team_size: int
    challenges: str
    solutions: str
    impact: str
    image_url: Optional[str] = None
    is_featured: bool = False
    display_order: int = 0

class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    case_study_url: Optional[str] = None
    role: Optional[str] = None
    team_size: Optional[int] = None
    challenges: Optional[str] = None
    solutions: Optional[str] = None
    impact: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Experience schemas
class ExperienceBase(BaseModel):
    title: str
    company: str
    location: str
    period: str
    description: str
    is_current: bool = False
    display_order: int = 0

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None
    is_current: Optional[bool] = None
    display_order: Optional[int] = None

class ExperienceResponse(ExperienceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Education schemas
class EducationBase(BaseModel):
    degree: str
    institution: str
    location: str
    period: str
    description: str
    gpa: Optional[str] = None
    is_current: bool = False
    display_order: int = 0

class EducationCreate(EducationBase):
    pass

class EducationUpdate(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    location: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None
    gpa: Optional[str] = None
    is_current: Optional[bool] = None
    display_order: Optional[int] = None

class EducationResponse(EducationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Skill schemas
class SkillBase(BaseModel):
    name: str
    category: str
    proficiency: int
    display_order: int = 0

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    proficiency: Optional[int] = None
    display_order: Optional[int] = None

class SkillResponse(SkillBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Contact schemas
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str

class ContactMessageResponse(BaseModel):
    id: int
    name: str
    email: str
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    
    class Config:
        from_attributes = True


class TokenVerificationResponse(BaseModel):
    valid: bool
    user: UserResponse