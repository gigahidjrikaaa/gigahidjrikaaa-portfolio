from __future__ import annotations

from collections import defaultdict
from datetime import datetime
import html
import io
import logging
import os
from typing import Any, Literal
from urllib.parse import urlparse

import httpx
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session, selectinload

from ..database import Award, BlogPost, Certificate, Education, Experience, Profile, Project, Service, Skill, Testimonial
from ..schemas import CertificateResponse

logger = logging.getLogger(__name__)

_ALLOWED_IMAGE_HOSTS = {"localhost", "127.0.0.1", "res.cloudinary.com"}
_ALLOWED_IMAGE_HOST_SUFFIXES = {
    "res.cloudinary.com",
    "images.unsplash.com",
    "lh3.googleusercontent.com",
    "googleusercontent.com",
    "raw.githubusercontent.com",
}
_MAX_PROJECT_IMAGES = 6
_MAX_BLOG_SUMMARIES = 12
_IMAGE_CACHE: dict[str, bytes | None] = {}


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


def _normalize_image_url(value: Any) -> str | None:
    url = _clean(value)
    if not url:
        return None

    parsed = urlparse(url)
    if parsed.scheme in {"http", "https"}:
        return url
    if url.startswith("//"):
        return f"https:{url}"
    if url.startswith("/"):
        site_url = _clean(os.getenv("PORTFOLIO_SITE_URL") or os.getenv("NEXT_PUBLIC_SITE_URL"), "http://localhost:3000")
        return f"{site_url.rstrip('/')}{url}"
    return None


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

    host = parsed.hostname.lower()
    if host in _ALLOWED_IMAGE_HOSTS:
        return True

    site_host = urlparse(_clean(os.getenv("PORTFOLIO_SITE_URL") or os.getenv("NEXT_PUBLIC_SITE_URL"))).hostname
    if site_host and host == site_host.lower():
        return True

    return any(host == suffix or host.endswith(f".{suffix}") for suffix in _ALLOWED_IMAGE_HOST_SUFFIXES)


def _fetch_remote_image(url: str) -> bytes | None:
    normalized_url = _normalize_image_url(url)
    if not normalized_url:
        return None

    if normalized_url in _IMAGE_CACHE:
        return _IMAGE_CACHE[normalized_url]

    if not _is_allowed_image_host(normalized_url):
        _IMAGE_CACHE[normalized_url] = None
        return None

    try:
        with httpx.Client(timeout=5.0, follow_redirects=True) as client:
            response = client.get(normalized_url)
            response.raise_for_status()
            content_type = (response.headers.get("content-type") or "").lower()
            if not content_type.startswith("image/"):
                _IMAGE_CACHE[normalized_url] = None
                return None
            _IMAGE_CACHE[normalized_url] = response.content
            return response.content
    except Exception as exc:
        logger.warning("Skipping remote image for portfolio PDF: %s (%s)", normalized_url, exc)
        _IMAGE_CACHE[normalized_url] = None
        return None


def _image_flowable(
    url: str | None,
    max_width_cm: float,
    max_height_cm: float,
    h_align: Literal["LEFT", "CENTER", "CENTRE", "RIGHT"] = "LEFT",
) -> Image | None:
    if not url:
        return None

    image_bytes = _fetch_remote_image(url)
    if not image_bytes:
        return None

    image_buffer = io.BytesIO(image_bytes)

    try:
        reader = ImageReader(image_buffer)
        width, height = reader.getSize()
    except Exception:
        return None

    if width <= 0 or height <= 0:
        return None

    max_width = max_width_cm * cm
    max_height = max_height_cm * cm
    scale = min(max_width / width, max_height / height)

    image = Image(image_buffer, width=width * scale, height=height * scale)
    image.hAlign = h_align
    return image


def _placeholder_logo(label: str, size_cm: float, styles: dict[str, ParagraphStyle]) -> Table:
    box = Table(
        [[Paragraph(f"<b>{_esc(label[:3].upper() or 'LOG')}</b>", styles["small_bold"])]],
        colWidths=[size_cm * cm],
        rowHeights=[size_cm * cm],
    )
    box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f3f4f6")),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#6b7280")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
            ]
        )
    )
    return box


def _card(flowables: list[Any], width_cm: float = 17.6, background: str = "#ffffff") -> Table:
    card = Table([[flowables]], colWidths=[width_cm * cm])
    card.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(background)),
                ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#e5e7eb")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )
    return card


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
    certificates = [
        CertificateResponse.model_validate(item, from_attributes=True)
        for item in db.query(Certificate).order_by(Certificate.display_order.asc()).all()
    ]
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
        "kicker": ParagraphStyle(
            "Kicker",
            parent=base["BodyText"],
            fontSize=8.5,
            leading=10,
            textColor=colors.HexColor("#6b7280"),
            spaceAfter=3,
        ),
        "cover_title": ParagraphStyle(
            "CoverTitle",
            parent=base["Heading1"],
            fontSize=30,
            leading=34,
            textColor=colors.HexColor("#111827"),
            spaceAfter=8,
        ),
        "cover_subtitle": ParagraphStyle(
            "CoverSubtitle",
            parent=base["BodyText"],
            fontSize=12.5,
            leading=17,
            textColor=colors.HexColor("#1f2937"),
            spaceAfter=8,
        ),
        "stat_value": ParagraphStyle(
            "StatValue",
            parent=base["Heading3"],
            fontSize=13,
            leading=15,
            textColor=colors.HexColor("#111827"),
            alignment=1,
        ),
        "stat_label": ParagraphStyle(
            "StatLabel",
            parent=base["BodyText"],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#6b7280"),
            alignment=1,
        ),
        "section": ParagraphStyle(
            "SectionHeading",
            parent=base["Heading2"],
            fontSize=17,
            leading=21,
            textColor=colors.HexColor("#111827"),
            spaceBefore=8,
            spaceAfter=7,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontSize=10.3,
            leading=14.5,
            textColor=colors.HexColor("#1f2937"),
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#4b5563"),
        ),
        "small_bold": ParagraphStyle(
            "SmallBold",
            parent=base["BodyText"],
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor("#374151"),
        ),
        "card_title": ParagraphStyle(
            "CardTitle",
            parent=base["Heading3"],
            fontSize=12.5,
            leading=15,
            textColor=colors.HexColor("#111827"),
            spaceAfter=2,
        ),
        "quote": ParagraphStyle(
            "Quote",
            parent=base["BodyText"],
            fontSize=10.3,
            leading=14,
            textColor=colors.HexColor("#111827"),
            leftIndent=8,
            rightIndent=4,
        ),
    }


def _draw_page_chrome(canvas, doc, owner_name: str, generated_label: str) -> None:
    width, height = A4
    canvas.saveState()

    canvas.setFillColor(colors.HexColor("#f8fafc"))
    canvas.rect(0, 0, width, height, stroke=0, fill=1)

    canvas.setFillColor(colors.HexColor("#0f172a"))
    canvas.rect(0, height - 0.95 * cm, width, 0.95 * cm, stroke=0, fill=1)

    canvas.setFillColor(colors.HexColor("#dbeafe"))
    canvas.circle(width - 1.1 * cm, height - 0.48 * cm, 0.28 * cm, stroke=0, fill=1)
    canvas.setFillColor(colors.HexColor("#e2e8f0"))
    canvas.circle(0.9 * cm, 1.0 * cm, 0.22 * cm, stroke=0, fill=1)

    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(1.5 * cm, height - 0.62 * cm, f"{owner_name.upper()} · PORTFOLIO")

    canvas.setStrokeColor(colors.HexColor("#d1d5db"))
    canvas.setLineWidth(0.5)
    canvas.line(1.5 * cm, 1.35 * cm, width - 1.5 * cm, 1.35 * cm)

    canvas.setFillColor(colors.HexColor("#6b7280"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(1.5 * cm, 0.9 * cm, f"Generated {generated_label}")
    canvas.drawRightString(width - 1.5 * cm, 0.9 * cm, f"Page {canvas.getPageNumber()}")
    canvas.restoreState()


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

    story.append(Paragraph("PORTFOLIO", styles["kicker"]))
    story.append(Paragraph(full_name, styles["cover_title"]))
    story.append(Paragraph(headline, styles["cover_subtitle"]))

    meta_parts = [item for item in [location, availability] if item]
    meta_line = " | ".join(meta_parts) if meta_parts else "Portfolio export"

    avatar_image = _image_flowable(getattr(profile, "avatar_url", None), max_width_cm=4.2, max_height_cm=4.2, h_align="CENTER")

    left_content: list[Any] = [Paragraph(meta_line, styles["small"]), Spacer(1, 0.25 * cm)]
    if bio:
        left_content.append(Paragraph(bio, styles["body"]))

    right_content: Any = avatar_image or _placeholder_logo(_clean(getattr(profile, "full_name", None), "GH"), 4.1, styles)

    hero = Table([[left_content, right_content]], colWidths=[12.6 * cm, 4.9 * cm])
    hero.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#e5e7eb")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )

    story.append(hero)
    story.append(Spacer(1, 0.3 * cm))

    stats_values = [
        Paragraph(f"<b>{len(payload['projects'])}</b>", styles["stat_value"]),
        Paragraph(f"<b>{len(payload['experience'])}</b>", styles["stat_value"]),
        Paragraph(f"<b>{len(payload['skills'])}</b>", styles["stat_value"]),
        Paragraph(f"<b>{len(payload['blog_posts'])}</b>", styles["stat_value"]),
    ]
    stats_labels = [
        Paragraph("Projects", styles["stat_label"]),
        Paragraph("Roles", styles["stat_label"]),
        Paragraph("Skills", styles["stat_label"]),
        Paragraph("Articles", styles["stat_label"]),
    ]

    stats_table = Table([stats_values, stats_labels], colWidths=[4.35 * cm] * 4)
    stats_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eff6ff")),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#bfdbfe")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dbeafe")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(stats_table)
    story.append(Spacer(1, 0.25 * cm))

    links: list[str] = []
    if resume_url:
        links.append(f"Resume: {resume_url}")
    if cv_url:
        links.append(f"CV: {cv_url}")
    if links:
        story.append(Paragraph(_esc(" | ".join(links)), styles["small"]))

    story.append(Spacer(1, 0.3 * cm))
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
                line = f"{line} · {subtitle}"
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
    image = _image_flowable(image_url, max_width_cm=17.0, max_height_cm=6.8)
    if image:
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

    return KeepTogether([_card(elements), Spacer(1, 0.2 * cm)])


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
            logo = _image_flowable(getattr(item, "company_logo_url", None), max_width_cm=2.1, max_height_cm=2.1, h_align="CENTER")
            left = logo or _placeholder_logo(_clean(item.company, "CMP"), 2.1, styles)
            right: list[Any] = [Paragraph(heading, styles["body"])]
            if item.location:
                right.append(Paragraph(_esc(item.location), styles["small"]))
            if item.description:
                right.append(Paragraph(_esc(item.description), styles["small"]))

            row = Table([[left, right]], colWidths=[2.6 * cm, 14.1 * cm])
            row.setStyle(
                TableStyle(
                    [
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("LEFTPADDING", (0, 0), (-1, -1), 4),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                        ("TOPPADDING", (0, 0), (-1, -1), 3),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                    ]
                )
            )
            story.append(_card([row]))
            story.append(Spacer(1, 0.12 * cm))
    else:
        story.append(Paragraph("No experience entries available.", styles["small"]))

    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("Education", styles["section"]))
    education = payload["education"]

    if education:
        for item in education:
            heading = f"<b>{_esc(item.degree)}</b> - {_esc(item.institution)} ({_esc(item.period)})"
            logo = _image_flowable(getattr(item, "institution_logo_url", None), max_width_cm=2.1, max_height_cm=2.1, h_align="CENTER")
            left = logo or _placeholder_logo(_clean(item.institution, "EDU"), 2.1, styles)
            right: list[Any] = [Paragraph(heading, styles["body"])]
            if item.location:
                right.append(Paragraph(_esc(item.location), styles["small"]))
            if item.description:
                right.append(Paragraph(_esc(item.description), styles["small"]))

            row = Table([[left, right]], colWidths=[2.6 * cm, 14.1 * cm])
            row.setStyle(
                TableStyle(
                    [
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("LEFTPADDING", (0, 0), (-1, -1), 4),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                        ("TOPPADDING", (0, 0), (-1, -1), 3),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                    ]
                )
            )
            story.append(_card([row]))
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
        image = _image_flowable(getattr(award, "image_url", None), max_width_cm=1.9, max_height_cm=1.9, h_align="CENTER")
        left = image or _placeholder_logo("AWD", 1.9, styles)
        detail: list[Any] = [Paragraph(row, styles["small"])]
        if award.description:
            detail.append(Paragraph(_esc(award.description), styles["small"]))
        line = Table([[left, detail]], colWidths=[2.3 * cm, 14.3 * cm])
        line.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 3), ("RIGHTPADDING", (0, 0), (-1, -1), 3)]))
        story.append(_card([line], background="#f9fafb"))
        story.append(Spacer(1, 0.1 * cm))

    for cert in payload["certificates"]:
        row = f"<b>{_esc(cert.title)}</b>"
        if cert.issuer:
            row += f" - {_esc(cert.issuer)}"
        if cert.issue_date:
            row += f" ({_esc(cert.issue_date)})"
        image = _image_flowable(getattr(cert, "image_url", None), max_width_cm=1.9, max_height_cm=1.9, h_align="CENTER")
        left = image or _placeholder_logo("CRT", 1.9, styles)
        detail: list[Any] = [Paragraph(row, styles["small"])]
        if cert.credential_id:
            detail.append(Paragraph(f"Credential ID: {_esc(cert.credential_id)}", styles["small"]))
        line = Table([[left, detail]], colWidths=[2.3 * cm, 14.3 * cm])
        line.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 3), ("RIGHTPADDING", (0, 0), (-1, -1), 3)]))
        story.append(_card([line], background="#f9fafb"))
        story.append(Spacer(1, 0.1 * cm))

    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("Testimonials", styles["section"]))

    testimonials = payload["testimonials"]
    if testimonials:
        for testimonial in testimonials[:6]:
            author = _esc(testimonial.name)
            role = _esc(testimonial.role)
            company = _esc(testimonial.company)
            quote = _esc(testimonial.content)
            quote_card = [Paragraph(f"\"{quote}\"", styles["quote"])]
            byline = f"- {author}, {role}" + (f" ({company})" if company else "")
            quote_card.append(Paragraph(byline, styles["small"]))
            story.append(_card(quote_card, background="#eff6ff"))
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
        cover = _image_flowable(getattr(post, "cover_image_url", None), max_width_cm=3.0, max_height_cm=2.2, h_align="CENTER")

        header = f"<b>{title}</b>"
        meta_parts = [part for part in [category, published] if part]
        if meta_parts:
            header += f" <font color='#6b7280'>({' | '.join(meta_parts)})</font>"

        right: list[Any] = [Paragraph(header, styles["body"])]
        if excerpt:
            right.append(Paragraph(excerpt, styles["small"]))

        if cover:
            row = Table([[cover, right]], colWidths=[3.2 * cm, 13.4 * cm])
            row.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 3), ("RIGHTPADDING", (0, 0), (-1, -1), 3)]))
            story.append(_card([row], background="#ffffff"))
        else:
            story.append(_card([Paragraph(header, styles["body"]), Paragraph(excerpt, styles["small"]) if excerpt else Spacer(1, 0)], background="#ffffff"))

        story.append(Spacer(1, 0.12 * cm))


def build_portfolio_pdf(payload: dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=2.0 * cm,
        bottomMargin=1.8 * cm,
        title="Giga Hidjrika Aura Adkhy - Portfolio",
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

    owner_name = _clean(getattr(payload.get("profile"), "full_name", "Giga Hidjrika Aura Adkhy"), "Giga Hidjrika Aura Adkhy")
    generated_label = _format_date(payload.get("generated_at")) or _format_date(datetime.utcnow())

    def _decorate_page(canvas, doc):
        _draw_page_chrome(canvas, doc, owner_name, generated_label)

    document.build(story, onFirstPage=_decorate_page, onLaterPages=_decorate_page)
    buffer.seek(0)
    return buffer.getvalue()
