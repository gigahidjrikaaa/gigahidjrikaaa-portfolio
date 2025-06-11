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

class ExperienceUpdate(ExperienceBase):
    pass

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

class EducationUpdate(EducationBase):
    pass

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

class SkillUpdate(SkillBase):
    pass

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