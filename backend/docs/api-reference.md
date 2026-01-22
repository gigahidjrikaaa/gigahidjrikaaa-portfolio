# Portfolio Backend API Reference

This document explains every API endpoint with example requests and responses. It complements the Scalar API Reference UI available at `/docs`.

## Base URL

- Local: `http://localhost:8000`
- API base path: `/api/v1`

## Authentication & Security

- Login issues an access token and sets cookies:
  - `access_token`: JWT
  - `csrf_token`: CSRF token for cookie-based auth
- For cookie-based auth on state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`), include header `X-CSRF-Token` with the same value as `csrf_token`.
- Alternatively, use `Authorization: Bearer <token>` for protected endpoints (no CSRF required).

Example header (cookie-based):

```
X-CSRF-Token: <csrf_token_value>
```

Example header (bearer token):

```
Authorization: Bearer <access_token>
```

## Scalar API Reference

- URL: `/docs`
- OpenAPI JSON: `/api/v1/openapi.json`

---

# Public Endpoints

## GET /profile

Returns the single profile record (creates a default record if missing).

Example response:

```
{
  "id": 1,
  "full_name": "Giga Hidjrika",
  "headline": "Full-Stack Developer",
  "bio": "Building scalable products.",
  "location": "Indonesia",
  "availability": "Open to freelance",
  "avatar_url": "https://example.com/avatar.png",
  "resume_url": "https://example.com/resume.pdf",
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

## GET /projects

Returns featured/public projects.

Example response:

```
[
  {
    "id": 1,
    "title": "Portfolio Platform",
    "tagline": "Showcase personal work",
    "description": "A modern portfolio site.",
    "github_url": "https://github.com/example/portfolio",
    "live_url": "https://example.com",
    "case_study_url": "https://example.com/case-study",
    "role": "Full-Stack Developer",
    "team_size": 1,
    "challenges": "Performance and SEO",
    "solutions": "SSR + caching",
    "impact": "+40% traffic",
    "image_url": "https://example.com/hero.png",
    "thumbnail_url": "https://example.com/thumb.png",
    "ui_image_url": "https://example.com/ui.png",
    "is_featured": true,
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z",
    "images": [
      {
        "id": 10,
        "project_id": 1,
        "url": "https://example.com/screen-1.png",
        "kind": "screenshot",
        "caption": "Landing page",
        "display_order": 1,
        "created_at": "2025-01-20T10:00:00Z"
      }
    ]
  }
]
```

## GET /projects/all

Returns all public projects (featured and non-featured).

Example response:

```
[
  {
    "id": 2,
    "title": "Admin CMS",
    "tagline": "Content management",
    "description": "Admin tooling for content.",
    "github_url": "https://github.com/example/cms",
    "role": "Backend Developer",
    "team_size": 2,
    "challenges": "Permissions",
    "solutions": "RBAC + auditing",
    "impact": "Reduced ops time",
    "is_featured": false,
    "display_order": 2,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  }
]
```

## GET /projects/{project_id}

Returns a single project by ID.

Example response:

```
{
  "id": 1,
  "title": "Portfolio Platform",
  "tagline": "Showcase personal work",
  "description": "A modern portfolio site.",
  "github_url": "https://github.com/example/portfolio",
  "role": "Full-Stack Developer",
  "team_size": 1,
  "challenges": "Performance and SEO",
  "solutions": "SSR + caching",
  "impact": "+40% traffic",
  "is_featured": true,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

## GET /experience

Returns experience items.

Example response:

```
[
  {
    "id": 1,
    "title": "Software Engineer",
    "company": "Tech Corp",
    "location": "Remote",
    "period": "Jan 2023 - Present",
    "description": "Built scalable APIs.",
    "company_logo_url": "https://example.com/logo.png",
    "is_current": true,
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  }
]
```

## GET /education

Returns education items.

Example response:

```
[
  {
    "id": 1,
    "degree": "B.Sc. Computer Science",
    "institution": "University A",
    "location": "Yogyakarta",
    "period": "2019 - 2023",
    "description": "Focus on AI and systems.",
    "gpa": "3.8",
    "institution_logo_url": "https://example.com/uni.png",
    "is_current": false,
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  }
]
```

## GET /skills

Returns skill items.

Example response:

```
[
  {
    "id": 1,
    "name": "Python",
    "category": "Backend",
    "proficiency": 5,
    "icon_url": "https://example.com/python.svg",
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

## GET /awards

Returns awards.

Example response:

```
[
  {
    "id": 1,
    "title": "Hackathon Winner",
    "issuer": "Tech Fest",
    "award_date": "2024-10-01",
    "description": "Best AI project",
    "credential_url": "https://example.com/award",
    "image_url": "https://example.com/award.png",
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

## GET /certificates

Returns certificates.

Example response:

```
[
  {
    "id": 1,
    "title": "Cloud Architect",
    "issuer": "Cloud Provider",
    "issue_date": "2024-08-15",
    "credential_id": "CERT-123",
    "credential_url": "https://example.com/cert",
    "image_url": "https://example.com/cert.png",
    "description": "Professional certification",
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

## GET /services

Returns services.

Example response:

```
[
  {
    "id": 1,
    "title": "Web Development",
    "subtitle": "Next.js + FastAPI",
    "description": "End-to-end product delivery.",
    "icon": "Code",
    "is_featured": true,
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

## GET /blog

Returns published blog posts (non-draft).

Example response:

```
[
  {
    "id": 1,
    "title": "Building Scalable APIs",
    "slug": "building-scalable-apis",
    "excerpt": "Lessons learned at scale.",
    "cover_image_url": "https://example.com/cover.png",
    "status": "published",
    "published_at": "2025-01-01T00:00:00Z",
    "created_at": "2024-12-20T10:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

## POST /contact

Creates a contact message and sends a notification email.

Example request:

```
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hi, I’d like to collaborate on a project."
}
```

Example response:

```
{
  "id": 10,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hi, I’d like to collaborate on a project.",
  "is_read": false,
  "created_at": "2025-01-20T10:00:00Z"
}
```

---

# Auth Endpoints

## POST /auth/login

OAuth2 form login. Sets auth cookies.

Example request (form-encoded):

```
username=admin&password=secret
```

Example response:

```
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

## POST /auth/login-json

JSON login. Sets auth cookies.

Example request:

```
{
  "username": "admin",
  "password": "secret"
}
```

Example response:

```
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

## GET /auth/me

Returns current user.

Example response:

```
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "is_admin": true
}
```

## POST /auth/verify-token

Verifies token and returns user details when valid.

Example response:

```
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "is_admin": true
  }
}
```

## POST /auth/logout

Clears auth cookies.

Example response:

```
{
  "message": "Logged out"
}
```

---

# Admin Endpoints (require admin auth)

## GET /admin/dashboard/stats

Returns dashboard metrics.

Example response:

```
{
  "total_projects": 5,
  "featured_projects": 2,
  "total_skills": 12,
  "total_experience": 3,
  "total_education": 2,
  "unread_messages": 1,
  "total_messages": 10
}
```

## Profile

### GET /admin/profile

Example response:

```
{
  "id": 1,
  "full_name": "Giga Hidjrika",
  "headline": "Full-Stack Developer",
  "bio": "Building scalable products.",
  "location": "Indonesia",
  "availability": "Open to freelance",
  "avatar_url": "https://example.com/avatar.png",
  "resume_url": "https://example.com/resume.pdf",
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/profile

Example request:

```
{
  "full_name": "Giga Hidjrika",
  "headline": "Product Engineer",
  "bio": "Shipping delightful experiences.",
  "location": "Indonesia",
  "availability": "Available",
  "avatar_url": "https://example.com/avatar.png",
  "resume_url": "https://example.com/resume.pdf"
}
```

Example response:

```
{
  "id": 1,
  "full_name": "Giga Hidjrika",
  "headline": "Product Engineer",
  "bio": "Shipping delightful experiences.",
  "location": "Indonesia",
  "availability": "Available",
  "avatar_url": "https://example.com/avatar.png",
  "resume_url": "https://example.com/resume.pdf",
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T11:00:00Z"
}
```

### POST /admin/profile/import-linkedin-pdf

Multipart upload. Parses PDF to extract profile data.

Example request (multipart):

```
file=@/path/to/linkedin.pdf
```

Example response:

```
{
  "profile": {
    "full_name": "Giga Hidjrika",
    "headline": "Full-Stack Developer",
    "bio": "Experienced engineer",
    "location": "Indonesia"
  },
  "meta": {
    "pages_scanned": 2,
    "text_length": 1840
  }
}
```

## Site Settings

### GET /admin/settings

Example response:

```
{
  "email": "hello@example.com",
  "phone": "+62 812 0000 0000",
  "github_url": "https://github.com/gigahidjrikaaa",
  "linkedin_url": "https://linkedin.com/in/gigahidjrikaaa",
  "twitter_url": "https://x.com/gigahidjrikaaa",
  "instagram_url": "https://instagram.com/gigahidjrikaaa"
}
```

### PUT /admin/settings

Example request:

```
{
  "email": "hello@example.com",
  "phone": "+62 812 0000 0000",
  "github_url": "https://github.com/gigahidjrikaaa",
  "linkedin_url": "https://linkedin.com/in/gigahidjrikaaa"
}
```

Example response:

```
{
  "email": "hello@example.com",
  "phone": "+62 812 0000 0000",
  "github_url": "https://github.com/gigahidjrikaaa",
  "linkedin_url": "https://linkedin.com/in/gigahidjrikaaa",
  "twitter_url": null,
  "instagram_url": null
}
```

## SEO Settings

### GET /admin/seo

Example response:

```
{
  "title": "Giga Hidjrika – Portfolio",
  "description": "Full-Stack Developer Portfolio",
  "keywords": "portfolio, developer, full-stack"
}
```

### PUT /admin/seo

Example request:

```
{
  "title": "Giga Hidjrika – Portfolio",
  "description": "Full-Stack Developer Portfolio",
  "keywords": "portfolio, developer, full-stack"
}
```

Example response:

```
{
  "title": "Giga Hidjrika – Portfolio",
  "description": "Full-Stack Developer Portfolio",
  "keywords": "portfolio, developer, full-stack"
}
```

## Media

### GET /admin/media

Query params: `page`, `page_size`, `search`, `tags`.

Example response:

```
{
  "items": [
    {
      "id": 1,
      "title": "Hero Image",
      "alt_text": "Homepage hero",
      "url": "https://example.com/media.png",
      "public_id": "portfolio/hero",
      "provider": "cloudinary",
      "folder": "portfolio",
      "tags": "hero,homepage",
      "asset_type": "image",
      "width": 1200,
      "height": 800,
      "size_bytes": 245000,
      "created_at": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

### POST /admin/media

Creates media asset record from URL or metadata.

Example request:

```
{
  "title": "Hero Image",
  "alt_text": "Homepage hero",
  "url": "https://example.com/media.png",
  "provider": "cloudinary",
  "folder": "portfolio",
  "tags": "hero,homepage",
  "asset_type": "image",
  "width": 1200,
  "height": 800,
  "size_bytes": 245000
}
```

Example response:

```
{
  "id": 1,
  "title": "Hero Image",
  "alt_text": "Homepage hero",
  "url": "https://example.com/media.png",
  "public_id": "portfolio/hero",
  "provider": "cloudinary",
  "folder": "portfolio",
  "tags": "hero,homepage",
  "asset_type": "image",
  "width": 1200,
  "height": 800,
  "size_bytes": 245000,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### POST /admin/media/upload

Multipart upload; returns created media asset.

Example request (multipart):

```
file=@/path/to/image.png
```

Example response:

```
{
  "id": 2,
  "title": "Uploaded Image",
  "url": "https://example.com/uploaded.png",
  "provider": "cloudinary",
  "folder": "portfolio",
  "asset_type": "image",
  "created_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/media/{asset_id}

Example request:

```
{
  "title": "Updated Title",
  "alt_text": "Updated alt text",
  "tags": "hero,updated"
}
```

Example response:

```
{
  "id": 1,
  "title": "Updated Title",
  "alt_text": "Updated alt text",
  "url": "https://example.com/media.png",
  "tags": "hero,updated",
  "created_at": "2025-01-20T10:00:00Z"
}
```

### DELETE /admin/media/{asset_id}

Example response:

```
{
  "message": "Media asset deleted successfully"
}
```

### POST /admin/media/bulk-delete

Example request:

```
{
  "ids": [1, 2, 3]
}
```

Example response:

```
{
  "deleted": 3
}
```

## Contact Messages

### GET /admin/contact-messages

Example response:

```
[
  {
    "id": 10,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "Hello",
    "is_read": false,
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

### GET /admin/contact-messages/{message_id}

Example response:

```
{
  "id": 10,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hello",
  "is_read": false,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/contact-messages/{message_id}/mark-read

Example response:

```
{
  "message": "Message marked as read"
}
```

### DELETE /admin/contact-messages/{message_id}

Example response:

```
{
  "message": "Contact message deleted successfully"
}
```

## Projects

### POST /admin/projects

Example request:

```
{
  "title": "Portfolio Platform",
  "tagline": "Showcase personal work",
  "description": "A modern portfolio site.",
  "github_url": "https://github.com/example/portfolio",
  "live_url": "https://example.com",
  "case_study_url": "https://example.com/case-study",
  "role": "Full-Stack Developer",
  "team_size": 1,
  "challenges": "Performance and SEO",
  "solutions": "SSR + caching",
  "impact": "+40% traffic",
  "image_url": "https://example.com/hero.png",
  "thumbnail_url": "https://example.com/thumb.png",
  "ui_image_url": "https://example.com/ui.png",
  "is_featured": true,
  "display_order": 1
}
```

Example response:

```
{
  "id": 1,
  "title": "Portfolio Platform",
  "tagline": "Showcase personal work",
  "description": "A modern portfolio site.",
  "github_url": "https://github.com/example/portfolio",
  "live_url": "https://example.com",
  "case_study_url": "https://example.com/case-study",
  "role": "Full-Stack Developer",
  "team_size": 1,
  "challenges": "Performance and SEO",
  "solutions": "SSR + caching",
  "impact": "+40% traffic",
  "image_url": "https://example.com/hero.png",
  "thumbnail_url": "https://example.com/thumb.png",
  "ui_image_url": "https://example.com/ui.png",
  "is_featured": true,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### GET /admin/projects

Example response:

```
[
  {
    "id": 1,
    "title": "Portfolio Platform",
    "tagline": "Showcase personal work",
    "description": "A modern portfolio site.",
    "github_url": "https://github.com/example/portfolio",
    "role": "Full-Stack Developer",
    "team_size": 1,
    "challenges": "Performance and SEO",
    "solutions": "SSR + caching",
    "impact": "+40% traffic",
    "is_featured": true,
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  }
]
```

### GET /admin/projects/{project_id}

Example response:

```
{
  "id": 1,
  "title": "Portfolio Platform",
  "tagline": "Showcase personal work",
  "description": "A modern portfolio site.",
  "github_url": "https://github.com/example/portfolio",
  "role": "Full-Stack Developer",
  "team_size": 1,
  "challenges": "Performance and SEO",
  "solutions": "SSR + caching",
  "impact": "+40% traffic",
  "is_featured": true,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/projects/{project_id}

Example request:

```
{
  "title": "Portfolio Platform v2",
  "impact": "+60% traffic"
}
```

Example response:

```
{
  "id": 1,
  "title": "Portfolio Platform v2",
  "tagline": "Showcase personal work",
  "description": "A modern portfolio site.",
  "github_url": "https://github.com/example/portfolio",
  "role": "Full-Stack Developer",
  "team_size": 1,
  "challenges": "Performance and SEO",
  "solutions": "SSR + caching",
  "impact": "+60% traffic",
  "is_featured": true,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T11:00:00Z"
}
```

### DELETE /admin/projects/{project_id}

Example response:

```
{
  "message": "Project deleted successfully"
}
```

## Project Images

### GET /admin/projects/{project_id}/images

Example response:

```
[
  {
    "id": 10,
    "project_id": 1,
    "url": "https://example.com/screen-1.png",
    "kind": "screenshot",
    "caption": "Landing page",
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

### POST /admin/projects/{project_id}/images

Example request:

```
{
  "url": "https://example.com/screen-2.png",
  "kind": "screenshot",
  "caption": "Dashboard",
  "display_order": 2
}
```

Example response:

```
{
  "id": 11,
  "project_id": 1,
  "url": "https://example.com/screen-2.png",
  "kind": "screenshot",
  "caption": "Dashboard",
  "display_order": 2,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/projects/{project_id}/images/{image_id}

Example request:

```
{
  "caption": "Updated caption",
  "display_order": 1
}
```

Example response:

```
{
  "id": 10,
  "project_id": 1,
  "url": "https://example.com/screen-1.png",
  "kind": "screenshot",
  "caption": "Updated caption",
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### DELETE /admin/projects/{project_id}/images/{image_id}

Example response:

```
{
  "message": "Project image deleted successfully"
}
```

## Experience

### POST /admin/experience

Example request:

```
{
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Remote",
  "period": "Jan 2023 - Present",
  "description": "Built scalable APIs.",
  "company_logo_url": "https://example.com/logo.png",
  "is_current": true,
  "display_order": 1
}
```

Example response:

```
{
  "id": 1,
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Remote",
  "period": "Jan 2023 - Present",
  "description": "Built scalable APIs.",
  "company_logo_url": "https://example.com/logo.png",
  "is_current": true,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### GET /admin/experience

Example response:

```
[
  {
    "id": 1,
    "title": "Software Engineer",
    "company": "Tech Corp",
    "location": "Remote",
    "period": "Jan 2023 - Present",
    "description": "Built scalable APIs.",
    "is_current": true,
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  }
]
```

### GET /admin/experience/{experience_id}

Example response:

```
{
  "id": 1,
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Remote",
  "period": "Jan 2023 - Present",
  "description": "Built scalable APIs.",
  "is_current": true,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/experience/{experience_id}

Example request:

```
{
  "description": "Led API modernization"
}
```

Example response:

```
{
  "id": 1,
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Remote",
  "period": "Jan 2023 - Present",
  "description": "Led API modernization",
  "is_current": true,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T11:00:00Z"
}
```

### DELETE /admin/experience/{experience_id}

Example response:

```
{
  "message": "Experience deleted successfully"
}
```

## Education

### POST /admin/education

Example request:

```
{
  "degree": "B.Sc. Computer Science",
  "institution": "University A",
  "location": "Yogyakarta",
  "period": "2019 - 2023",
  "description": "Focus on AI and systems.",
  "gpa": "3.8",
  "institution_logo_url": "https://example.com/uni.png",
  "is_current": false,
  "display_order": 1
}
```

Example response:

```
{
  "id": 1,
  "degree": "B.Sc. Computer Science",
  "institution": "University A",
  "location": "Yogyakarta",
  "period": "2019 - 2023",
  "description": "Focus on AI and systems.",
  "gpa": "3.8",
  "institution_logo_url": "https://example.com/uni.png",
  "is_current": false,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### GET /admin/education

Example response:

```
[
  {
    "id": 1,
    "degree": "B.Sc. Computer Science",
    "institution": "University A",
    "location": "Yogyakarta",
    "period": "2019 - 2023",
    "description": "Focus on AI and systems.",
    "gpa": "3.8",
    "is_current": false,
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  }
]
```

### GET /admin/education/{education_id}

Example response:

```
{
  "id": 1,
  "degree": "B.Sc. Computer Science",
  "institution": "University A",
  "location": "Yogyakarta",
  "period": "2019 - 2023",
  "description": "Focus on AI and systems.",
  "gpa": "3.8",
  "is_current": false,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/education/{education_id}

Example request:

```
{
  "gpa": "3.9"
}
```

Example response:

```
{
  "id": 1,
  "degree": "B.Sc. Computer Science",
  "institution": "University A",
  "location": "Yogyakarta",
  "period": "2019 - 2023",
  "description": "Focus on AI and systems.",
  "gpa": "3.9",
  "is_current": false,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T11:00:00Z"
}
```

### DELETE /admin/education/{education_id}

Example response:

```
{
  "message": "Education deleted successfully"
}
```

## Skills

### POST /admin/skills

Example request:

```
{
  "name": "Python",
  "category": "Backend",
  "proficiency": 5,
  "icon_url": "https://example.com/python.svg",
  "display_order": 1
}
```

Example response:

```
{
  "id": 1,
  "name": "Python",
  "category": "Backend",
  "proficiency": 5,
  "icon_url": "https://example.com/python.svg",
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### GET /admin/skills

Example response:

```
[
  {
    "id": 1,
    "name": "Python",
    "category": "Backend",
    "proficiency": 5,
    "icon_url": "https://example.com/python.svg",
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

### GET /admin/skills/{skill_id}

Example response:

```
{
  "id": 1,
  "name": "Python",
  "category": "Backend",
  "proficiency": 5,
  "icon_url": "https://example.com/python.svg",
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/skills/{skill_id}

Example request:

```
{
  "proficiency": 4
}
```

Example response:

```
{
  "id": 1,
  "name": "Python",
  "category": "Backend",
  "proficiency": 4,
  "icon_url": "https://example.com/python.svg",
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### DELETE /admin/skills/{skill_id}

Example response:

```
{
  "message": "Skill deleted successfully"
}
```

## Awards

### POST /admin/awards

Example request:

```
{
  "title": "Hackathon Winner",
  "issuer": "Tech Fest",
  "award_date": "2024-10-01",
  "description": "Best AI project",
  "credential_url": "https://example.com/award",
  "image_url": "https://example.com/award.png",
  "display_order": 1
}
```

Example response:

```
{
  "id": 1,
  "title": "Hackathon Winner",
  "issuer": "Tech Fest",
  "award_date": "2024-10-01",
  "description": "Best AI project",
  "credential_url": "https://example.com/award",
  "image_url": "https://example.com/award.png",
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### GET /admin/awards

Example response:

```
[
  {
    "id": 1,
    "title": "Hackathon Winner",
    "issuer": "Tech Fest",
    "award_date": "2024-10-01",
    "description": "Best AI project",
    "credential_url": "https://example.com/award",
    "image_url": "https://example.com/award.png",
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

### GET /admin/awards/{award_id}

Example response:

```
{
  "id": 1,
  "title": "Hackathon Winner",
  "issuer": "Tech Fest",
  "award_date": "2024-10-01",
  "description": "Best AI project",
  "credential_url": "https://example.com/award",
  "image_url": "https://example.com/award.png",
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/awards/{award_id}

Example request:

```
{
  "description": "Updated description"
}
```

Example response:

```
{
  "id": 1,
  "title": "Hackathon Winner",
  "issuer": "Tech Fest",
  "award_date": "2024-10-01",
  "description": "Updated description",
  "credential_url": "https://example.com/award",
  "image_url": "https://example.com/award.png",
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### DELETE /admin/awards/{award_id}

Example response:

```
{
  "message": "Award deleted successfully"
}
```

## Certificates

### POST /admin/certificates

Example request:

```
{
  "title": "Cloud Architect",
  "issuer": "Cloud Provider",
  "issue_date": "2024-08-15",
  "credential_id": "CERT-123",
  "credential_url": "https://example.com/cert",
  "image_url": "https://example.com/cert.png",
  "description": "Professional certification",
  "display_order": 1
}
```

Example response:

```
{
  "id": 1,
  "title": "Cloud Architect",
  "issuer": "Cloud Provider",
  "issue_date": "2024-08-15",
  "credential_id": "CERT-123",
  "credential_url": "https://example.com/cert",
  "image_url": "https://example.com/cert.png",
  "description": "Professional certification",
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### GET /admin/certificates

Example response:

```
[
  {
    "id": 1,
    "title": "Cloud Architect",
    "issuer": "Cloud Provider",
    "issue_date": "2024-08-15",
    "credential_id": "CERT-123",
    "credential_url": "https://example.com/cert",
    "image_url": "https://example.com/cert.png",
    "description": "Professional certification",
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

### GET /admin/certificates/{certificate_id}

Example response:

```
{
  "id": 1,
  "title": "Cloud Architect",
  "issuer": "Cloud Provider",
  "issue_date": "2024-08-15",
  "credential_id": "CERT-123",
  "credential_url": "https://example.com/cert",
  "image_url": "https://example.com/cert.png",
  "description": "Professional certification",
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/certificates/{certificate_id}

Example request:

```
{
  "description": "Updated description"
}
```

Example response:

```
{
  "id": 1,
  "title": "Cloud Architect",
  "issuer": "Cloud Provider",
  "issue_date": "2024-08-15",
  "credential_id": "CERT-123",
  "credential_url": "https://example.com/cert",
  "image_url": "https://example.com/cert.png",
  "description": "Updated description",
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### DELETE /admin/certificates/{certificate_id}

Example response:

```
{
  "message": "Certificate deleted successfully"
}
```

## Services

### POST /admin/services

Example request:

```
{
  "title": "Web Development",
  "subtitle": "Next.js + FastAPI",
  "description": "End-to-end product delivery.",
  "icon": "Code",
  "is_featured": true,
  "display_order": 1
}
```

Example response:

```
{
  "id": 1,
  "title": "Web Development",
  "subtitle": "Next.js + FastAPI",
  "description": "End-to-end product delivery.",
  "icon": "Code",
  "is_featured": true,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### GET /admin/services

Example response:

```
[
  {
    "id": 1,
    "title": "Web Development",
    "subtitle": "Next.js + FastAPI",
    "description": "End-to-end product delivery.",
    "icon": "Code",
    "is_featured": true,
    "display_order": 1,
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

### GET /admin/services/{service_id}

Example response:

```
{
  "id": 1,
  "title": "Web Development",
  "subtitle": "Next.js + FastAPI",
  "description": "End-to-end product delivery.",
  "icon": "Code",
  "is_featured": true,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/services/{service_id}

Example request:

```
{
  "subtitle": "FastAPI + Next.js"
}
```

Example response:

```
{
  "id": 1,
  "title": "Web Development",
  "subtitle": "FastAPI + Next.js",
  "description": "End-to-end product delivery.",
  "icon": "Code",
  "is_featured": true,
  "display_order": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

### DELETE /admin/services/{service_id}

Example response:

```
{
  "message": "Service deleted successfully"
}
```

## Blog

### POST /admin/blog

Example request:

```
{
  "title": "Building Scalable APIs",
  "slug": "building-scalable-apis",
  "excerpt": "Lessons learned at scale.",
  "cover_image_url": "https://example.com/cover.png",
  "status": "draft"
}
```

Example response:

```
{
  "id": 1,
  "title": "Building Scalable APIs",
  "slug": "building-scalable-apis",
  "excerpt": "Lessons learned at scale.",
  "cover_image_url": "https://example.com/cover.png",
  "status": "draft",
  "published_at": null,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### GET /admin/blog

Example response:

```
[
  {
    "id": 1,
    "title": "Building Scalable APIs",
    "slug": "building-scalable-apis",
    "excerpt": "Lessons learned at scale.",
    "cover_image_url": "https://example.com/cover.png",
    "status": "draft",
    "published_at": null,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  }
]
```

### GET /admin/blog/{post_id}

Example response:

```
{
  "id": 1,
  "title": "Building Scalable APIs",
  "slug": "building-scalable-apis",
  "excerpt": "Lessons learned at scale.",
  "cover_image_url": "https://example.com/cover.png",
  "status": "draft",
  "published_at": null,
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### PUT /admin/blog/{post_id}

Example request:

```
{
  "status": "published",
  "excerpt": "Updated excerpt"
}
```

Example response:

```
{
  "id": 1,
  "title": "Building Scalable APIs",
  "slug": "building-scalable-apis",
  "excerpt": "Updated excerpt",
  "cover_image_url": "https://example.com/cover.png",
  "status": "published",
  "published_at": "2025-01-01T00:00:00Z",
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T11:00:00Z"
}
```

### DELETE /admin/blog/{post_id}

Example response:

```
{
  "message": "Blog post deleted successfully"
}
```
