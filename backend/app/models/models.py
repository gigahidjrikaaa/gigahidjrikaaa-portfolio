from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..db.base import Base

# Association table for project tech stack
project_tech_stack = Table(
    "project_tech_stack",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id")),
    Column("tech_id", Integer, ForeignKey("technologies.id")),
)

# Association table for project features
project_features = Table(
    "project_features",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id")),
    Column("feature_id", Integer, ForeignKey("features.id")),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    tagline = Column(String)
    description = Column(Text)
    github_url = Column(String)
    live_url = Column(String, nullable=True)
    case_study_url = Column(String, nullable=True)
    role = Column(String)
    team_size = Column(Integer)
    challenges = Column(Text)
    solutions = Column(Text)
    impact = Column(Text)
    image_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    ui_image_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    tech_stack = relationship("Technology", secondary=project_tech_stack, back_populates="projects")
    features = relationship("Feature", secondary=project_features, back_populates="projects")
    images = relationship("ProjectImage", back_populates="project", cascade="all, delete-orphan")


class Technology(Base):
    __tablename__ = "technologies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String)  # frontend, backend, database, etc.

    projects = relationship("Project", secondary=project_tech_stack, back_populates="tech_stack")


class Feature(Base):
    __tablename__ = "features"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    projects = relationship("Project", secondary=project_features, back_populates="features")


class Experience(Base):
    __tablename__ = "experience"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String)
    location = Column(String)
    period = Column(String)
    description = Column(Text)
    company_logo_url = Column(String, nullable=True)
    is_current = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Education(Base):
    __tablename__ = "education"

    id = Column(Integer, primary_key=True, index=True)
    degree = Column(String)
    institution = Column(String)
    location = Column(String)
    period = Column(String)
    description = Column(Text)
    gpa = Column(String, nullable=True)
    institution_logo_url = Column(String, nullable=True)
    is_current = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)  # programming, frameworks, tools, etc.
    proficiency = Column(Integer)  # 1-5 scale
    icon_url = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


class Award(Base):
    __tablename__ = "awards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    issuer = Column(String, nullable=True)
    award_date = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    credential_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    issuer = Column(String, nullable=True)
    issue_date = Column(String, nullable=True)
    credential_id = Column(String, nullable=True)
    credential_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    icon = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)
    excerpt = Column(Text, nullable=True)
    cover_image_url = Column(String, nullable=True)
    status = Column(String, default="draft")  # draft | published | coming_soon
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    headline = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    instagram_url = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class SeoSettings(Base):
    __tablename__ = "seo_settings"

    id = Column(Integer, primary_key=True, index=True)
    site_title = Column(String, nullable=True)
    site_description = Column(Text, nullable=True)
    keywords = Column(String, nullable=True)
    og_image_url = Column(String, nullable=True)
    canonical_url = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    alt_text = Column(String, nullable=True)
    url = Column(String, nullable=False)
    public_id = Column(String, nullable=True)
    provider = Column(String, default="cloudinary")
    folder = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    asset_type = Column(String, default="image")
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    size_bytes = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class ProjectImage(Base):
    __tablename__ = "project_images"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    url = Column(String, nullable=False)
    kind = Column(String, default="gallery")  # gallery | ui | thumbnail
    caption = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    project = relationship("Project", back_populates="images")
