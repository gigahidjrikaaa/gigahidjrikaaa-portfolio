from __future__ import annotations

from collections import defaultdict
from datetime import datetime
import html
import io
import logging
from typing import Any
from urllib.parse import urlparse

import httpx
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session, selectinload

from ..database import Award, BlogPost, Certificate, Education, Experience, Profile, Project, Service, Skill, Testimonial

logger = logging.getLogger(__name__)

_ALLOWED_IMAGE_HOSTS = {"res.cloudinary.com"}
_MAX_PROJECT_IMAGES = 6
_MAX_BLOG_SUMMARIES = 12


def _clean(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback
    text = str(value).strip()
    return text or fallback


def _esc(value: Any, fallback: str = "") -> str:
    return html.escape(_clean(value, fallback))


def _format_date(value: datetime | None) -> str:
    if not value:
        return ""
    return value.strftime("%b %d, %Y")


def _project_image_url(project: Project) -> str | None:
    for candidate in [project.thumbnail_url, project.ui_image_url, project.image_url]:
        candidate_text = _clean(candidate)
        if candidate_text:
            return candidate_text
    if project.images:
        for image in project.images:
            image_url = _clean(image.url)
            if image_url:
                return image_url
    return None


def _is_allowed_image_host(url: str) -> bool:
    try:
        parsed = urlparse(url)
    except ValueError:
        return False

    if parsed.scheme not in {"http", "https"}:
        return False
    if not parsed.hostname:
        return False
    return parsed.hostname.lower() in _ALLOWED_IMAGE_HOSTS


def _fetch_remote_image(url: str) -> bytes | None:
    if not _is_allowed_image_host(url):
        return None

    try:
        with httpx.Client(timeout=3.0, follow_redirects=True) as client:
            response = client.get(url)
            response.raise_for_status()
            content_type = (response.headers.get("content-type") or "").lower()
            if not content_type.startswith("image/"):
                return None
            return response.content
    except Exception:
        logger.warning("Skipping remote image for portfolio PDF: %s", url, exc_info=True)
        return None


def collect_portfolio_data(db: Session) -> dict[str, Any]:
    profile = db.query(Profile).first()

    projects = (
        db.query(Project)
        .options(selectinload(Project.tech_stack), selectinload(Project.images))
        .order_by(Project.display_order.asc(), Project.created_at.desc())
        .all()
    )
    experience = db.query(Experience).order_by(Experience.display_order.asc()).all()
    education = db.query(Education).order_by(Education.display_order.asc()).all()
    skills = db.query(Skill).order_by(Skill.category.asc(), Skill.display_order.asc()).all()
    services = db.query(Service).order_by(Service.display_order.asc()).all()
    awards = db.query(Award).order_by(Award.display_order.asc()).all()
    certificates = db.query(Certificate).order_by(Certificate.display_order.asc()).all()
    testimonials = (
        db.query(Testimonial)
        .filter(Testimonial.status == "approved", Testimonial.is_featured == True)
        .order_by(Testimonial.display_order.asc(), Testimonial.created_at.desc())
        .all()
    )
    blog_posts = (
        db.query(BlogPost)
        .filter(BlogPost.status != "draft")
        .order_by(BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc())
        .limit(_MAX_BLOG_SUMMARIES)
        .all()
    )

    return {
        "profile": profile,
        "projects": projects,
        "experience": experience,
        "education": education,
        "skills": skills,
        "services": services,
        "awards": awards,
        "certificates": certificates,
        "testimonials": testimonials,
        "blog_posts": blog_posts,
        "generated_at": datetime.utcnow(),
    }


def _build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "cover_title": ParagraphStyle(
            "CoverTitle",
            parent=base["Heading1"],
            fontSize=28,
            leading=32,
            textColor=colors.HexColor("#111827"),
            spaceAfter=6,
        ),
        "cover_subtitle": ParagraphStyle(
            "CoverSubtitle",
            parent=base["BodyText"],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#374151"),
            spaceAfter=8,
        ),
        "section": ParagraphStyle(
            "SectionHeading",
            parent=base["Heading2"],
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#111827"),
            spaceBefore=8,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor("#1f2937"),
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#4b5563"),
        ),
        "card_title": ParagraphStyle(
            "CardTitle",
            parent=base["Heading3"],
            fontSize=12.5,
            leading=15,
            textColor=colors.HexColor("#111827"),
            spaceAfter=2,
        ),
    }


def _append_cover(story: list[Any], payload: dict[str, Any], styles: dict[str, ParagraphStyle]) -> None:
    profile = payload["profile"]
    generated_at = payload["generated_at"]

    full_name = _esc(getattr(profile, "full_name", None), "Portfolio")
    headline = _esc(getattr(profile, "headline", None), "Selected projects and professional highlights")
    bio = _esc(getattr(profile, "bio", None), "")

    location = _esc(getattr(profile, "location", None), "")
    availability = _esc(getattr(profile, "availability", None), "")
    resume_url = _esc(getattr(profile, "resume_url", None), "")
    cv_url = _esc(getattr(profile, "cv_url", None), "")

    story.append(Paragraph(full_name, styles["cover_title"]))
    story.append(Paragraph(headline, styles["cover_subtitle"]))

    meta_parts = [item for item in [location, availability] if item]
    meta_line = " | ".join(meta_parts) if meta_parts else "Portfolio export"
    story.append(Paragraph(meta_line, styles["small"]))
    story.append(Spacer(1, 0.3 * cm))

    if bio:
        story.append(Paragraph(bio, styles["body"]))
        story.append(Spacer(1, 0.35 * cm))

    links: list[str] = []
    if resume_url:
        links.append(f"Resume: {resume_url}")
    if cv_url:
        links.append(f"CV: {cv_url}")
    if links:
        story.append(Paragraph(_esc(" | ".join(links)), styles["small"]))

    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(f"Generated on {_format_date(generated_at)}", styles["small"]))
    story.append(PageBreak())


def _append_services_and_skills(story: list[Any], payload: dict[str, Any], styles: dict[str, ParagraphStyle]) -> None:
    services = payload["services"]
    skills = payload["skills"]

    story.append(Paragraph("Capabilities", styles["section"]))

    if services:
        for service in services:
            title = _esc(service.title)
            subtitle = _esc(service.subtitle)
            description = _esc(service.description)

            line = title
            if subtitle:
                line = f"{line} - {subtitle}"
            story.append(Paragraph(f"<b>{line}</b>", styles["body"]))
            if description:
                story.append(Paragraph(description, styles["small"]))
            story.append(Spacer(1, 0.15 * cm))

    if skills:
        grouped: dict[str, list[str]] = defaultdict(list)
        for skill in skills:
            grouped[_clean(skill.category, "General")].append(skill.name)

        story.append(Spacer(1, 0.2 * cm))
        for category, names in grouped.items():
            list_text = ", ".join(_esc(name) for name in names[:16])
            story.append(Paragraph(f"<b>{_esc(category)}:</b> {list_text}", styles["small"]))

    story.append(Spacer(1, 0.25 * cm))


def _project_card(project: Project, styles: dict[str, ParagraphStyle]) -> KeepTogether:
    elements: list[Any] = []

    title = _esc(project.title, "Untitled project")
    tagline = _esc(project.tagline)
    role = _esc(project.role)
    impact = _esc(project.impact)

    elements.append(Paragraph(title, styles["card_title"]))
    if tagline:
        elements.append(Paragraph(tagline, styles["small"]))

    image_url = _project_image_url(project)
    if image_url:
        image_bytes = _fetch_remote_image(image_url)
        if image_bytes:
            image_buffer = io.BytesIO(image_bytes)
            image = Image(image_buffer, width=14.5 * cm, height=6 * cm)
            image.hAlign = "LEFT"
            elements.append(Spacer(1, 0.15 * cm))
            elements.append(image)

    detail_rows = [
        [Paragraph("<b>Role</b>", styles["small"]), Paragraph(role or "-", styles["small"])],
        [Paragraph("<b>Team</b>", styles["small"]), Paragraph(_esc(project.team_size or "-"), styles["small"])],
    ]
    detail_table = Table(detail_rows, colWidths=[2.8 * cm, 11.7 * cm])
    detail_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f9fafb")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e5e7eb")),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    elements.append(Spacer(1, 0.15 * cm))
    elements.append(detail_table)

    if project.tech_stack:
        tech_names = ", ".join(_esc(t.name) for t in project.tech_stack)
        elements.append(Spacer(1, 0.12 * cm))
        elements.append(Paragraph(f"<b>Stack:</b> {tech_names}", styles["small"]))

    if impact:
        elements.append(Spacer(1, 0.12 * cm))
        elements.append(Paragraph(f"<b>Impact:</b> {impact}", styles["small"]))

    elements.append(Spacer(1, 0.2 * cm))
    return KeepTogether(elements)


def _append_projects(story: list[Any], payload: dict[str, Any], styles: dict[str, ParagraphStyle]) -> None:
    projects = payload["projects"]
    story.append(Paragraph("Selected Projects", styles["section"]))

    if not projects:
        story.append(Paragraph("No project data available.", styles["small"]))
        story.append(Spacer(1, 0.3 * cm))
        return

    for project in projects[:_MAX_PROJECT_IMAGES]:
        story.append(_project_card(project, styles))

    if len(projects) > _MAX_PROJECT_IMAGES:
        story.append(
            Paragraph(
                f"Plus {len(projects) - _MAX_PROJECT_IMAGES} additional project(s) available on the website.",
                styles["small"],
            )
        )
    story.append(PageBreak())


def _append_experience_education(story: list[Any], payload: dict[str, Any], styles: dict[str, ParagraphStyle]) -> None:
    story.append(Paragraph("Experience", styles["section"]))
    experience = payload["experience"]

    if experience:
        for item in experience:
            heading = f"<b>{_esc(item.title)}</b> - {_esc(item.company)} ({_esc(item.period)})"
            story.append(Paragraph(heading, styles["body"]))
            if item.description:
                story.append(Paragraph(_esc(item.description), styles["small"]))
            story.append(Spacer(1, 0.12 * cm))
    else:
        story.append(Paragraph("No experience entries available.", styles["small"]))

    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("Education", styles["section"]))
    education = payload["education"]

    if education:
        for item in education:
            heading = f"<b>{_esc(item.degree)}</b> - {_esc(item.institution)} ({_esc(item.period)})"
            story.append(Paragraph(heading, styles["body"]))
            if item.description:
                story.append(Paragraph(_esc(item.description), styles["small"]))
            story.append(Spacer(1, 0.12 * cm))
    else:
        story.append(Paragraph("No education entries available.", styles["small"]))

    story.append(Spacer(1, 0.25 * cm))


def _append_social_proof(story: list[Any], payload: dict[str, Any], styles: dict[str, ParagraphStyle]) -> None:
    story.append(Paragraph("Awards and Certificates", styles["section"]))

    for award in payload["awards"]:
        row = f"<b>{_esc(award.title)}</b>"
        if award.issuer:
            row += f" - {_esc(award.issuer)}"
        if award.award_date:
            row += f" ({_esc(award.award_date)})"
        story.append(Paragraph(row, styles["small"]))

    for cert in payload["certificates"]:
        row = f"<b>{_esc(cert.title)}</b>"
        if cert.issuer:
            row += f" - {_esc(cert.issuer)}"
        if cert.issue_date:
            row += f" ({_esc(cert.issue_date)})"
        story.append(Paragraph(row, styles["small"]))

    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("Testimonials", styles["section"]))

    testimonials = payload["testimonials"]
    if testimonials:
        for testimonial in testimonials[:6]:
            author = _esc(testimonial.name)
            role = _esc(testimonial.role)
            quote = _esc(testimonial.content)
            story.append(Paragraph(f"\"{quote}\"", styles["body"]))
            story.append(Paragraph(f"- {author}, {role}", styles["small"]))
            story.append(Spacer(1, 0.15 * cm))
    else:
        story.append(Paragraph("No featured testimonials available.", styles["small"]))

    story.append(PageBreak())


def _append_blog_summaries(story: list[Any], payload: dict[str, Any], styles: dict[str, ParagraphStyle]) -> None:
    story.append(Paragraph("Blog Summaries", styles["section"]))

    posts = payload["blog_posts"]
    if not posts:
        story.append(Paragraph("No blog posts available.", styles["small"]))
        return

    for post in posts:
        title = _esc(post.title)
        category = _esc(post.category, "General")
        published = _format_date(post.published_at)
        excerpt = _esc(post.excerpt)

        header = f"<b>{title}</b>"
        meta_parts = [part for part in [category, published] if part]
        if meta_parts:
            header += f" <font color='#6b7280'>({' | '.join(meta_parts)})</font>"

        story.append(Paragraph(header, styles["body"]))
        if excerpt:
            story.append(Paragraph(excerpt, styles["small"]))
        story.append(Spacer(1, 0.12 * cm))


def build_portfolio_pdf(payload: dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title="Portfolio Export",
        author=_clean(getattr(payload.get("profile"), "full_name", "Portfolio")),
    )

    styles = _build_styles()
    story: list[Any] = []

    _append_cover(story, payload, styles)
    _append_services_and_skills(story, payload, styles)
    _append_projects(story, payload, styles)
    _append_experience_education(story, payload, styles)
    _append_social_proof(story, payload, styles)
    _append_blog_summaries(story, payload, styles)

    document.build(story)
    buffer.seek(0)
    return buffer.getvalue()
