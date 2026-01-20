from pydantic import BaseModel, EmailStr, HttpUrl, constr, Field
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
    thumbnail_url: Optional[str] = None
    ui_image_url: Optional[str] = None
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
    thumbnail_url: Optional[str] = None
    ui_image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    images: Optional[List["ProjectImageResponse"]] = None
    
    class Config:
        from_attributes = True

# Experience schemas
class ExperienceBase(BaseModel):
    title: str
    company: str
    location: str
    period: str
    description: str
    company_logo_url: Optional[str] = None
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
    company_logo_url: Optional[str] = None
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
    institution_logo_url: Optional[str] = None
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
    institution_logo_url: Optional[str] = None
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
    icon_url: Optional[str] = None
    display_order: int = 0

class SkillCreate(SkillBase):
    proficiency: int = Field(..., ge=1, le=5, description="Skill level on a 1-5 scale")

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    proficiency: Optional[int] = Field(None, ge=1, le=5, description="Skill level on a 1-5 scale")
    icon_url: Optional[str] = None
    display_order: Optional[int] = None

class SkillResponse(SkillBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Contact schemas
class ContactForm(BaseModel):
    name: constr(strip_whitespace=True, min_length=1, max_length=100)
    email: EmailStr
    message: constr(strip_whitespace=True, min_length=1, max_length=5000)

class ContactMessageResponse(BaseModel):
    id: int
    name: str
    email: str
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Awards schemas
class AwardBase(BaseModel):
    title: str
    issuer: Optional[str] = None
    award_date: Optional[str] = None
    description: Optional[str] = None
    credential_url: Optional[str] = None
    image_url: Optional[str] = None
    display_order: int = 0


class AwardCreate(AwardBase):
    pass


class AwardUpdate(BaseModel):
    title: Optional[str] = None
    issuer: Optional[str] = None
    award_date: Optional[str] = None
    description: Optional[str] = None
    credential_url: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None


class AwardResponse(AwardBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Certificates schemas
class CertificateBase(BaseModel):
    title: str
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    display_order: int = 0


class CertificateCreate(CertificateBase):
    pass


class CertificateUpdate(BaseModel):
    title: Optional[str] = None
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None


class CertificateResponse(CertificateBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Services schemas
class ServiceBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    is_featured: bool = False
    display_order: int = 0


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None


class ServiceResponse(ServiceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Blog schemas
class BlogPostBase(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: str = "draft"


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: Optional[str] = None


class BlogPostResponse(BlogPostBase):
    id: int
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

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


# Profile schemas
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = None
    avatar_url: Optional[HttpUrl] = None
    resume_url: Optional[HttpUrl] = None


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Site settings schemas
class SiteSettingsBase(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    github_url: Optional[HttpUrl] = None
    linkedin_url: Optional[HttpUrl] = None
    twitter_url: Optional[HttpUrl] = None
    instagram_url: Optional[HttpUrl] = None


class SiteSettingsUpdate(SiteSettingsBase):
    pass


class SiteSettingsResponse(SiteSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# SEO settings schemas
class SeoSettingsBase(BaseModel):
    site_title: Optional[str] = None
    site_description: Optional[str] = None
    keywords: Optional[str] = None
    og_image_url: Optional[HttpUrl] = None
    canonical_url: Optional[HttpUrl] = None


class SeoSettingsUpdate(SeoSettingsBase):
    pass


class SeoSettingsResponse(SeoSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Media asset schemas
class MediaAssetBase(BaseModel):
    title: Optional[str] = None
    alt_text: Optional[str] = None
    url: HttpUrl
    public_id: Optional[str] = None
    provider: Optional[str] = "cloudinary"
    folder: Optional[str] = None
    tags: Optional[str] = None
    asset_type: Optional[str] = "image"
    width: Optional[int] = None
    height: Optional[int] = None
    size_bytes: Optional[int] = None


class MediaAssetCreate(MediaAssetBase):
    pass


class MediaAssetUpdate(BaseModel):
    title: Optional[str] = None
    alt_text: Optional[str] = None
    url: Optional[HttpUrl] = None
    public_id: Optional[str] = None
    provider: Optional[str] = None
    folder: Optional[str] = None
    tags: Optional[str] = None
    asset_type: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    size_bytes: Optional[int] = None


class MediaAssetResponse(MediaAssetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MediaBulkDeleteRequest(BaseModel):
    ids: List[int]


class MediaBulkDeleteResponse(BaseModel):
    deleted_ids: List[int]
    failed_ids: List[int]


class MediaAssetListResponse(BaseModel):
    items: List[MediaAssetResponse]
    total: int
    page: int
    page_size: int


# Project images
class ProjectImageBase(BaseModel):
    url: HttpUrl
    kind: Optional[str] = "gallery"
    caption: Optional[str] = None
    display_order: Optional[int] = 0


class ProjectImageCreate(ProjectImageBase):
    pass


class ProjectImageUpdate(BaseModel):
    url: Optional[HttpUrl] = None
    kind: Optional[str] = None
    caption: Optional[str] = None
    display_order: Optional[int] = None


class ProjectImageResponse(ProjectImageBase):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True


ProjectResponse.model_rebuild()