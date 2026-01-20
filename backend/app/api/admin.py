from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func, or_
from typing import List, cast
from datetime import datetime
import logging
from ..services.pdf_import_service import extract_text_from_pdf_bytes, parse_linkedin_resume_text
from ..database import (
    get_db,
    Project,
    Experience,
    Education,
    Skill,
    ContactMessage,
    User,
    Technology,
    Feature,
    Profile,
    SiteSettings,
    SeoSettings,
    MediaAsset,
    ProjectImage,
    Award,
    Certificate,
    Service,
    BlogPost,
)
from ..auth import get_current_admin_user
from ..schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse, 
    ExperienceCreate, ExperienceResponse, ExperienceUpdate,
    EducationCreate, EducationResponse, EducationUpdate,
    SkillCreate, SkillResponse, SkillUpdate,
    ContactMessageResponse,
    ProfileResponse, ProfileUpdate,
    SiteSettingsResponse, SiteSettingsUpdate,
    SeoSettingsResponse, SeoSettingsUpdate,
    MediaAssetCreate, MediaAssetResponse, MediaAssetUpdate,
    MediaBulkDeleteRequest, MediaBulkDeleteResponse,
    MediaAssetListResponse,
    ProjectImageCreate, ProjectImageResponse, ProjectImageUpdate,
    AwardCreate, AwardResponse, AwardUpdate,
    CertificateCreate, CertificateResponse, CertificateUpdate,
    ServiceCreate, ServiceResponse, ServiceUpdate,
    BlogPostCreate, BlogPostResponse, BlogPostUpdate,
)
from ..services.cloudinary_service import upload_image, delete_image

logger = logging.getLogger(__name__)

router = APIRouter()

# =============================================================================
# PROJECTS CRUD
# =============================================================================

@router.post("/projects", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_project = Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects", response_model=List[ProjectResponse])
async def get_all_projects_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return (
        db.query(Project)
        .options(selectinload(Project.images))
        .order_by(Project.display_order)
        .all()
    )

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project_admin(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_project = (
        db.query(Project)
        .options(selectinload(Project.images))
        .filter(Project.id == project_id)
        .first()
    )
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    for field, value in project.model_dump(exclude_unset=True).items():
        setattr(db_project, field, value)

    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}

# =============================================================================
# PROJECT IMAGES
# =============================================================================

@router.get("/projects/{project_id}/images", response_model=List[ProjectImageResponse])
async def list_project_images(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return (
        db.query(ProjectImage)
        .filter(ProjectImage.project_id == project_id)
        .order_by(ProjectImage.display_order)
        .all()
    )


@router.post("/projects/{project_id}/images", response_model=ProjectImageResponse)
async def create_project_image(
    project_id: int,
    payload: ProjectImageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    image = ProjectImage(project_id=project_id, **payload.model_dump())
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.put("/projects/{project_id}/images/{image_id}", response_model=ProjectImageResponse)
async def update_project_image(
    project_id: int,
    image_id: int,
    payload: ProjectImageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    image = (
        db.query(ProjectImage)
        .filter(ProjectImage.id == image_id, ProjectImage.project_id == project_id)
        .first()
    )
    if not image:
        raise HTTPException(status_code=404, detail="Project image not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(image, field, value)

    db.commit()
    db.refresh(image)
    return image


@router.delete("/projects/{project_id}/images/{image_id}")
async def delete_project_image(
    project_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    image = (
        db.query(ProjectImage)
        .filter(ProjectImage.id == image_id, ProjectImage.project_id == project_id)
        .first()
    )
    if not image:
        raise HTTPException(status_code=404, detail="Project image not found")

    db.delete(image)
    db.commit()
    return {"message": "Project image deleted successfully"}

# =============================================================================
# EXPERIENCE CRUD
# =============================================================================

@router.post("/experience", response_model=ExperienceResponse)
async def create_experience(
    experience: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_experience = Experience(**experience.model_dump())
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience

@router.get("/experience", response_model=List[ExperienceResponse])
async def get_all_experience_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(Experience).order_by(Experience.display_order).all()

@router.get("/experience/{experience_id}", response_model=ExperienceResponse)
async def get_experience_admin(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_experience = db.query(Experience).filter(Experience.id == experience_id).first()
    if not db_experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    return db_experience

@router.put("/experience/{experience_id}", response_model=ExperienceResponse)
async def update_experience(
    experience_id: int,
    experience: ExperienceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_experience = db.query(Experience).filter(Experience.id == experience_id).first()
    if not db_experience:
        raise HTTPException(status_code=404, detail="Experience not found")

    for field, value in experience.model_dump(exclude_unset=True).items():
        setattr(db_experience, field, value)

    db.commit()
    db.refresh(db_experience)
    return db_experience

@router.delete("/experience/{experience_id}")
async def delete_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_experience = db.query(Experience).filter(Experience.id == experience_id).first()
    if not db_experience:
        raise HTTPException(status_code=404, detail="Experience not found")

    db.delete(db_experience)
    db.commit()
    return {"message": "Experience deleted successfully"}

# =============================================================================
# EDUCATION CRUD
# =============================================================================

@router.post("/education", response_model=EducationResponse)
async def create_education(
    education: EducationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_education = Education(**education.model_dump())
    db.add(db_education)
    db.commit()
    db.refresh(db_education)
    return db_education

@router.get("/education", response_model=List[EducationResponse])
async def get_all_education_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(Education).order_by(Education.display_order).all()

@router.get("/education/{education_id}", response_model=EducationResponse)
async def get_education_admin(
    education_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_education = db.query(Education).filter(Education.id == education_id).first()
    if not db_education:
        raise HTTPException(status_code=404, detail="Education not found")
    return db_education

@router.put("/education/{education_id}", response_model=EducationResponse)
async def update_education(
    education_id: int,
    education: EducationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_education = db.query(Education).filter(Education.id == education_id).first()
    if not db_education:
        raise HTTPException(status_code=404, detail="Education not found")

    for field, value in education.model_dump(exclude_unset=True).items():
        setattr(db_education, field, value)

    db.commit()
    db.refresh(db_education)
    return db_education

@router.delete("/education/{education_id}")
async def delete_education(
    education_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_education = db.query(Education).filter(Education.id == education_id).first()
    if not db_education:
        raise HTTPException(status_code=404, detail="Education not found")

    db.delete(db_education)
    db.commit()
    return {"message": "Education deleted successfully"}

# =============================================================================
# SKILLS CRUD
# =============================================================================

@router.post("/skills", response_model=SkillResponse)
async def create_skill(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_skill = Skill(**skill.model_dump())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.get("/skills", response_model=List[SkillResponse])
async def get_all_skills_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(Skill).order_by(Skill.category, Skill.display_order).all()

@router.get("/skills/{skill_id}", response_model=SkillResponse)
async def get_skill_admin(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return db_skill

@router.put("/skills/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: int,
    skill: SkillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    for field, value in skill.model_dump(exclude_unset=True).items():
        setattr(db_skill, field, value)

    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.delete("/skills/{skill_id}")
async def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(db_skill)
    db.commit()
    return {"message": "Skill deleted successfully"}

# =============================================================================
# AWARDS CRUD
# =============================================================================

@router.post("/awards", response_model=AwardResponse)
async def create_award(
    payload: AwardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    award = Award(**payload.model_dump())
    db.add(award)
    db.commit()
    db.refresh(award)
    return award


@router.get("/awards", response_model=List[AwardResponse])
async def get_awards_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return db.query(Award).order_by(Award.display_order).all()


@router.get("/awards/{award_id}", response_model=AwardResponse)
async def get_award_admin(
    award_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    award = db.query(Award).filter(Award.id == award_id).first()
    if not award:
        raise HTTPException(status_code=404, detail="Award not found")
    return award


@router.put("/awards/{award_id}", response_model=AwardResponse)
async def update_award(
    award_id: int,
    payload: AwardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    award = db.query(Award).filter(Award.id == award_id).first()
    if not award:
        raise HTTPException(status_code=404, detail="Award not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(award, field, value)

    db.commit()
    db.refresh(award)
    return award


@router.delete("/awards/{award_id}")
async def delete_award(
    award_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    award = db.query(Award).filter(Award.id == award_id).first()
    if not award:
        raise HTTPException(status_code=404, detail="Award not found")

    db.delete(award)
    db.commit()
    return {"message": "Award deleted successfully"}

# =============================================================================
# CERTIFICATES CRUD
# =============================================================================

@router.post("/certificates", response_model=CertificateResponse)
async def create_certificate(
    payload: CertificateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    certificate = Certificate(**payload.model_dump())
    db.add(certificate)
    db.commit()
    db.refresh(certificate)
    return certificate


@router.get("/certificates", response_model=List[CertificateResponse])
async def get_certificates_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return db.query(Certificate).order_by(Certificate.display_order).all()


@router.get("/certificates/{certificate_id}", response_model=CertificateResponse)
async def get_certificate_admin(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    certificate = db.query(Certificate).filter(Certificate.id == certificate_id).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return certificate


@router.put("/certificates/{certificate_id}", response_model=CertificateResponse)
async def update_certificate(
    certificate_id: int,
    payload: CertificateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    certificate = db.query(Certificate).filter(Certificate.id == certificate_id).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(certificate, field, value)

    db.commit()
    db.refresh(certificate)
    return certificate


@router.delete("/certificates/{certificate_id}")
async def delete_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    certificate = db.query(Certificate).filter(Certificate.id == certificate_id).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")

    db.delete(certificate)
    db.commit()
    return {"message": "Certificate deleted successfully"}

# =============================================================================
# SERVICES CRUD
# =============================================================================

@router.post("/services", response_model=ServiceResponse)
async def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    service = Service(**payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.get("/services", response_model=List[ServiceResponse])
async def get_services_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return db.query(Service).order_by(Service.display_order).all()


@router.get("/services/{service_id}", response_model=ServiceResponse)
async def get_service_admin(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.put("/services/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)
    return service


@router.delete("/services/{service_id}")
async def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully"}

# =============================================================================
# BLOG CRUD
# =============================================================================

def _apply_blog_status(post: BlogPost) -> None:
    status = cast(str, post.status)
    published_at = cast(object, getattr(post, "published_at", None))
    if status == "published" and published_at is None:
        setattr(post, "published_at", datetime.utcnow())
    elif status in {"draft", "coming_soon"}:
        setattr(post, "published_at", None)


@router.post("/blog", response_model=BlogPostResponse)
async def create_blog_post(
    payload: BlogPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    post = BlogPost(**payload.model_dump())
    _apply_blog_status(post)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/blog", response_model=List[BlogPostResponse])
async def get_blog_posts_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    return db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()


@router.get("/blog/{post_id}", response_model=BlogPostResponse)
async def get_blog_post_admin(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post


@router.put("/blog/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: int,
    payload: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(post, field, value)

    _apply_blog_status(post)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/blog/{post_id}")
async def delete_blog_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    db.delete(post)
    db.commit()
    return {"message": "Blog post deleted successfully"}

# =============================================================================
# CONTACT MESSAGES
# =============================================================================

@router.get("/contact-messages", response_model=List[ContactMessageResponse])
async def get_all_contact_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()

@router.get("/contact-messages/{message_id}", response_model=ContactMessageResponse)
async def get_contact_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message

@router.put("/contact-messages/{message_id}/mark-read")
async def mark_message_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")

    setattr(db_message, "is_read", True)
    db.commit()
    return {"message": "Message marked as read"}

@router.delete("/contact-messages/{message_id}")
async def delete_contact_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")

    db.delete(db_message)
    db.commit()
    return {"message": "Message deleted successfully"}

# =============================================================================
# DASHBOARD STATS
# =============================================================================

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    total_projects = db.query(Project).count()
    featured_projects = db.query(Project).filter(Project.is_featured == True).count()
    total_skills = db.query(Skill).count()
    total_experience = db.query(Experience).count()
    total_education = db.query(Education).count()
    unread_messages = db.query(ContactMessage).filter(ContactMessage.is_read == False).count()
    total_messages = db.query(ContactMessage).count()

    return {
        "total_projects": total_projects,
        "featured_projects": featured_projects,
        "total_skills": total_skills,
        "total_experience": total_experience,
        "total_education": total_education,
        "unread_messages": unread_messages,
        "total_messages": total_messages,
    }

# =============================================================================
# PROFILE (singleton)
# =============================================================================

@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile()
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile()
        db.add(profile)

    for field, value in payload.model_dump(exclude_unset=True, mode="json").items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/profile/import-linkedin-pdf")
async def import_profile_from_linkedin_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    # Validate upload
    content_type = (file.content_type or "").lower()
    if content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(status_code=415, detail="Only PDF files are supported")

    max_bytes = 8 * 1024 * 1024  # 8MB
    data = await file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail="PDF is too large")

    # Basic magic-byte check to reduce accidental non-PDF uploads.
    if not data.lstrip().startswith(b"%PDF"):
        raise HTTPException(status_code=415, detail="Invalid PDF file")

    text = extract_text_from_pdf_bytes(data, max_pages=3)
    # If the PDF is scanned, text extraction returns empty or near-empty.
    if len(text.strip()) < 40:
        raise HTTPException(
            status_code=422,
            detail="The PDF appears to be scanned (no embedded text). OCR is required to import this file.",
        )

    candidate = parse_linkedin_resume_text(text)
    # Return detected fields for the frontend to auto-fill.
    return {
        "profile": {
            "full_name": candidate.full_name,
            "headline": candidate.headline,
            "location": candidate.location,
            "bio": candidate.bio,
            "resume_url": candidate.resume_url,
        },
        "meta": {
            "pages_scanned": 3,
            "text_length": len(text),
        },
    }

# =============================================================================
# SITE SETTINGS (singleton)
# =============================================================================

@router.get("/settings", response_model=SiteSettingsResponse)
async def get_site_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    settings_row = db.query(SiteSettings).first()
    if not settings_row:
        settings_row = SiteSettings()
        db.add(settings_row)
        db.commit()
        db.refresh(settings_row)
    return settings_row


@router.put("/settings", response_model=SiteSettingsResponse)
async def update_site_settings(
    payload: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    settings_row = db.query(SiteSettings).first()
    if not settings_row:
        settings_row = SiteSettings()
        db.add(settings_row)

    for field, value in payload.model_dump(exclude_unset=True, mode="json").items():
        setattr(settings_row, field, value)

    db.commit()
    db.refresh(settings_row)
    return settings_row

# =============================================================================
# SEO SETTINGS (singleton)
# =============================================================================

@router.get("/seo", response_model=SeoSettingsResponse)
async def get_seo_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    seo = db.query(SeoSettings).first()
    if not seo:
        seo = SeoSettings()
        db.add(seo)
        db.commit()
        db.refresh(seo)
    return seo


@router.put("/seo", response_model=SeoSettingsResponse)
async def update_seo_settings(
    payload: SeoSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    seo = db.query(SeoSettings).first()
    if not seo:
        seo = SeoSettings()
        db.add(seo)

    for field, value in payload.model_dump(exclude_unset=True, mode="json").items():
        setattr(seo, field, value)

    db.commit()
    db.refresh(seo)
    return seo

# =============================================================================
# MEDIA ASSETS
# =============================================================================

@router.get("/media", response_model=MediaAssetListResponse)
async def list_media_assets(
    q: str | None = Query(default=None),
    tag: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    query = db.query(MediaAsset)

    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            or_(
                func.lower(MediaAsset.title).ilike(like),
                func.lower(MediaAsset.alt_text).ilike(like),
                func.lower(MediaAsset.url).ilike(like),
            )
        )

    if tag:
        tag_like = f"%{tag.lower()}%"
        query = query.filter(func.lower(MediaAsset.tags).ilike(tag_like))

    total = query.count()
    items = (
        query.order_by(MediaAsset.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/media", response_model=MediaAssetResponse)
async def create_media_asset(
    payload: MediaAssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    asset = MediaAsset(**payload.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.post("/media/upload", response_model=MediaAssetResponse)
async def upload_media_asset(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    alt_text: str | None = Form(None),
    tags: str | None = Form(None),
    folder: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported.")

    file_bytes = await file.read()
    max_size_bytes = 5 * 1024 * 1024
    if len(file_bytes) > max_size_bytes:
        raise HTTPException(status_code=400, detail="Image must be 5MB or smaller.")

    def _sanitize_folder(value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip().strip("/")
        if not cleaned:
            return None
        if len(cleaned) > 120:
            raise HTTPException(status_code=400, detail="Folder is too long.")
        allowed = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_- ")
        if any(ch not in allowed for ch in cleaned):
            raise HTTPException(status_code=400, detail="Folder contains invalid characters.")
        return cleaned

    def _sanitize_tags(value: str | None) -> list[str] | None:
        raw = (value or "").strip()
        if not raw:
            return None
        parts = [p.strip() for p in raw.split(",") if p.strip()]
        if len(parts) > 25:
            raise HTTPException(status_code=400, detail="Too many tags (max 25).")
        for tag in parts:
            if len(tag) > 40:
                raise HTTPException(status_code=400, detail="A tag is too long (max 40).")
        return parts

    def _looks_like_image(data: bytes) -> bool:
        # Quick magic-byte check to reduce content-type spoofing.
        if len(data) < 12:
            return False
        if data.startswith(b"\xFF\xD8\xFF"):
            return True  # JPEG
        if data.startswith(b"\x89PNG\r\n\x1a\n"):
            return True  # PNG
        if data[:6] in (b"GIF87a", b"GIF89a"):
            return True  # GIF
        if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
            return True  # WEBP
        return False

    sanitized_folder = _sanitize_folder(folder)
    tag_list = _sanitize_tags(tags)

    if not _looks_like_image(file_bytes):
        raise HTTPException(status_code=400, detail="Invalid image file.")

    try:
        upload_result = await upload_image(
            file_bytes=file_bytes,
            filename=file.filename or "upload",
            folder=sanitized_folder,
            tags=tag_list,
        )
    except Exception as exc:  # noqa: BLE001 - wrap provider errors
        logger.exception("Cloudinary upload failed")
        raise HTTPException(status_code=502, detail="Image upload failed.") from exc

    asset = MediaAsset(
        title=title,
        alt_text=alt_text,
        url=upload_result.get("secure_url") or upload_result.get("url"),
        public_id=upload_result.get("public_id"),
        provider="cloudinary",
        folder=upload_result.get("folder") or folder,
        tags=tags,
        asset_type=upload_result.get("resource_type", "image"),
        width=upload_result.get("width"),
        height=upload_result.get("height"),
        size_bytes=upload_result.get("bytes"),
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.put("/media/{asset_id}", response_model=MediaAssetResponse)
async def update_media_asset(
    asset_id: int,
    payload: MediaAssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    asset = db.query(MediaAsset).filter(MediaAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Media asset not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(asset, field, value)

    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/media/{asset_id}")
async def delete_media_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    asset = db.query(MediaAsset).filter(MediaAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Media asset not found")

    if asset.provider == "cloudinary" and asset.public_id:
        try:
            await delete_image(asset.public_id)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Cloudinary delete failed")
            raise HTTPException(status_code=502, detail="Failed to delete remote asset.") from exc

    db.delete(asset)
    db.commit()
    return {"message": "Media asset deleted successfully"}


@router.post("/media/bulk-delete", response_model=MediaBulkDeleteResponse)
async def bulk_delete_media_assets(
    payload: MediaBulkDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    deleted_ids: list[int] = []
    failed_ids: list[int] = []

    assets = db.query(MediaAsset).filter(MediaAsset.id.in_(payload.ids)).all()
    assets_by_id = {asset.id: asset for asset in assets}

    for asset_id in payload.ids:
        asset = assets_by_id.get(asset_id)
        if not asset:
            failed_ids.append(asset_id)
            continue

        if asset.provider == "cloudinary" and asset.public_id:
            try:
                await delete_image(asset.public_id)
            except Exception:  # noqa: BLE001
                logger.exception("Cloudinary delete failed for asset %s", asset_id)
                failed_ids.append(asset_id)
                continue

        db.delete(asset)
        deleted_ids.append(asset_id)

    db.commit()
    return {"deleted_ids": deleted_ids, "failed_ids": failed_ids}
