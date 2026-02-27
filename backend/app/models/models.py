from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Table, Text
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
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    last_login = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)



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
    is_active = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    metrics_users = Column(String, nullable=True)
    metrics_performance = Column(String, nullable=True)
    metrics_impact = Column(String, nullable=True)
    solo_contributions = Column(Text, nullable=True)
    tech_decisions = Column(Text, nullable=True)
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
    institution_background_url = Column(String, nullable=True)
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
    content = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    cover_image_url = Column(String, nullable=True)
    og_image_url = Column(String, nullable=True)
    seo_title = Column(String, nullable=True)
    seo_description = Column(Text, nullable=True)
    seo_keywords = Column(String, nullable=True)
    reading_time_minutes = Column(Integer, nullable=True)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    status = Column(String, default="draft")  # draft | published | coming_soon | scheduled
    published_at = Column(DateTime, nullable=True)
    scheduled_at = Column(DateTime, nullable=True)  # For scheduled publishing
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
    # Sitemap control
    sitemap_home_priority = Column(Float, default=1.0, nullable=True)
    sitemap_home_changefreq = Column(String(20), default="daily", nullable=True)
    sitemap_blog_enabled = Column(Boolean, default=True, nullable=True)
    sitemap_blog_priority = Column(Float, default=0.9, nullable=True)
    sitemap_blog_changefreq = Column(String(20), default="daily", nullable=True)
    sitemap_posts_enabled = Column(Boolean, default=True, nullable=True)
    sitemap_posts_priority = Column(Float, default=0.8, nullable=True)
    sitemap_posts_changefreq = Column(String(20), default="monthly", nullable=True)
    sitemap_custom_pages = Column(Text, nullable=True)  # JSON array of {url, priority, changefreq}
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


class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    company = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    rating = Column(Integer, nullable=True)
    project_relation = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    status = Column(String(20), default="approved")  # approved | pending | rejected
    submitter_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class BlogComment(Base):
    __tablename__ = "blog_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id"), nullable=False, index=True)
    author_name = Column(String(100), nullable=False)
    author_email = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    parent_id = Column(Integer, ForeignKey("blog_comments.id"), nullable=True)
    status = Column(String, default="pending")  # pending, approved, rejected, spam
    created_at = Column(DateTime, server_default=func.now())

    post = relationship("BlogPost", backref="comments")


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    caption = Column(Text, nullable=True)
    image_url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class PressMention(Base):
    __tablename__ = "press_mentions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    publication = Column(String, nullable=False)
    publication_url = Column(String, nullable=True)
    publication_date = Column(String, nullable=True)
    excerpt = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    social_username = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class PageVisit(Base):
    """Stores one row per visitor session; updated on heartbeat."""
    __tablename__ = "page_visits"

    id = Column(Integer, primary_key=True)
    session_id = Column(String(64), nullable=False, index=True)
    ip_hash = Column(String(64), nullable=False)
    country_code = Column(String(5), nullable=True)
    country_name = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    lat = Column(Integer, nullable=True)
    lon = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    last_seen = Column(DateTime, server_default=func.now())
