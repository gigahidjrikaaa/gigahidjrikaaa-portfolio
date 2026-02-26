from pydantic import BaseModel, EmailStr, HttpUrl, field_validator, Field
from typing import List, Optional
from datetime import datetime
import re

# Base schemas
class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    tagline: str = Field(..., min_length=1, max_length=300)
    description: str = Field(..., min_length=1, max_length=10000)
    github_url: str = Field(..., max_length=500)
    live_url: Optional[str] = Field(None, max_length=500)
    case_study_url: Optional[str] = Field(None, max_length=500)
    role: str = Field(..., min_length=1, max_length=100)
    team_size: int = Field(..., ge=1, le=100)
    challenges: str = Field(..., min_length=1, max_length=10000)
    solutions: str = Field(..., min_length=1, max_length=10000)
    impact: str = Field(..., min_length=1, max_length=10000)
    image_url: Optional[str] = Field(None, max_length=1000)
    thumbnail_url: Optional[str] = Field(None, max_length=1000)
    ui_image_url: Optional[str] = Field(None, max_length=1000)
    is_featured: bool = False
    is_active: bool = False
    display_order: int = 0
    metrics_users: Optional[str] = Field(None, max_length=5000)
    metrics_performance: Optional[str] = Field(None, max_length=5000)
    metrics_impact: Optional[str] = Field(None, max_length=5000)
    solo_contributions: Optional[str] = Field(None, max_length=10000)
    tech_decisions: Optional[str] = Field(None, max_length=10000)

    @field_validator('github_url', 'live_url', 'case_study_url', mode='before')
    @classmethod
    def validate_urls(cls, v):
        if v is not None and v != '':
            if not (v.startswith('http://') or v.startswith('https://')):
                raise ValueError('URL must start with http:// or https://')
        return v if v != '' else None

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
    is_active: Optional[bool] = None
    display_order: Optional[int] = None
    metrics_users: Optional[str] = None
    metrics_performance: Optional[str] = None
    metrics_impact: Optional[str] = None
    solo_contributions: Optional[str] = None
    tech_decisions: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    images: Optional[List["ProjectImageResponse"]] = None
    
    class Config:
        from_attributes = True

# Experience schemas
class ExperienceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    company: str = Field(..., min_length=1, max_length=200)
    location: str = Field(..., min_length=1, max_length=200)
    period: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=10000)
    company_logo_url: Optional[str] = Field(None, max_length=1000)
    is_current: bool = False
    display_order: int = 0

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    company: Optional[str] = Field(None, min_length=1, max_length=200)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    period: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=10000)
    company_logo_url: Optional[str] = Field(None, max_length=1000)
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
    degree: str = Field(..., min_length=1, max_length=200)
    institution: str = Field(..., min_length=1, max_length=200)
    location: str = Field(..., min_length=1, max_length=200)
    period: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=10000)
    gpa: Optional[str] = Field(None, max_length=20)
    institution_logo_url: Optional[str] = Field(None, max_length=1000)
    is_current: bool = False
    display_order: int = 0

class EducationCreate(EducationBase):
    pass

class EducationUpdate(BaseModel):
    degree: Optional[str] = Field(None, min_length=1, max_length=200)
    institution: Optional[str] = Field(None, min_length=1, max_length=200)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    period: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=10000)
    gpa: Optional[str] = Field(None, max_length=20)
    institution_logo_url: Optional[str] = Field(None, max_length=1000)
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
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=5000)

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
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    cover_image_url: Optional[str] = None
    og_image_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    reading_time_minutes: Optional[int] = None
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    is_featured: Optional[bool] = False
    status: str = "draft"
    scheduled_at: Optional[str] = None


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    cover_image_url: Optional[str] = None
    og_image_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    reading_time_minutes: Optional[int] = None
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    is_featured: Optional[bool] = None
    status: Optional[str] = None


class BlogPostResponse(BlogPostBase):
    id: int
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlogPostListResponse(BaseModel):
    items: List[BlogPostResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    categories: List[str] = []
    popular: List[BlogPostResponse] = []
    latest: List[BlogPostResponse] = []
    featured: List[BlogPostResponse] = []

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
    # Sitemap control
    sitemap_home_priority: Optional[float] = None
    sitemap_home_changefreq: Optional[str] = None
    sitemap_blog_enabled: Optional[bool] = None
    sitemap_blog_priority: Optional[float] = None
    sitemap_blog_changefreq: Optional[str] = None
    sitemap_posts_enabled: Optional[bool] = None
    sitemap_posts_priority: Optional[float] = None
    sitemap_posts_changefreq: Optional[str] = None
    sitemap_custom_pages: Optional[str] = None  # JSON string


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


# Testimonials schemas
class TestimonialBase(BaseModel):
    name: str
    role: str
    company: Optional[str] = None
    avatar_url: Optional[str] = None
    content: str
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating from 1-5")
    project_relation: Optional[str] = None
    linkedin_url: Optional[str] = None
    is_featured: bool = True
    display_order: int = 0
    status: str = "approved"
    submitter_email: Optional[str] = None


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialSubmit(BaseModel):
    """Public submission schema — goes to pending status for admin review."""
    name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=100)
    company: Optional[str] = Field(None, max_length=100)
    content: str = Field(..., min_length=10, max_length=2000)
    rating: Optional[int] = Field(None, ge=1, le=5)
    project_relation: Optional[str] = Field(None, max_length=200)
    linkedin_url: Optional[str] = Field(None, max_length=500)
    submitter_email: str = Field(..., description="Used to send a confirmation email")


class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    avatar_url: Optional[str] = None
    content: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    project_relation: Optional[str] = None
    linkedin_url: Optional[str] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None
    status: Optional[str] = None


class TestimonialResponse(TestimonialBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


ProjectResponse.model_rebuild()

# Blog comment schemas
class BlogCommentBase(BaseModel):
    author_name: str = Field(..., min_length=1, max_length=100)
    author_email: EmailStr
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: Optional[int] = None

class BlogCommentCreate(BlogCommentBase):
    pass

class BlogCommentResponse(BlogCommentBase):
    id: int
    post_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# Client schemas
class ClientBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    description: Optional[str] = None
    is_featured: bool = False
    display_order: int = 0


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    description: Optional[str] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None


class ClientResponse(ClientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Story schemas
class StoryBase(BaseModel):
    title: str
    caption: Optional[str] = None
    image_url: str
    thumbnail_url: Optional[str] = None
    is_featured: bool = False
    display_order: int = 0


class StoryCreate(StoryBase):
    pass


class StoryUpdate(BaseModel):
    title: Optional[str] = None
    caption: Optional[str] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None


class StoryResponse(StoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Press Mention schemas
class PressMentionBase(BaseModel):
    title: str
    publication: str
    publication_url: Optional[str] = None
    publication_date: Optional[str] = None
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: bool = False
    display_order: int = 0
    social_username: Optional[str] = None

    @field_validator("publication_date", "publication_url", "excerpt", "image_url", mode="before")
    @classmethod
    def empty_str_to_none(cls, v: object) -> object:
        """Convert empty strings to None so PostgreSQL timestamp/nullable columns don't error."""
        if isinstance(v, str) and v.strip() == "":
            return None
        return v


class PressMentionCreate(PressMentionBase):
    pass


class PressMentionUpdate(BaseModel):
    title: Optional[str] = None
    publication: Optional[str] = None
    publication_url: Optional[str] = None
    publication_date: Optional[str] = None
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None
    social_username: Optional[str] = None

    @field_validator("publication_date", "publication_url", "excerpt", "image_url", mode="before")
    @classmethod
    def empty_str_to_none(cls, v: object) -> object:
        """Convert empty strings to None so PostgreSQL timestamp/nullable columns don't error."""
        if isinstance(v, str) and v.strip() == "":
            return None
        return v


class PressMentionResponse(PressMentionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


