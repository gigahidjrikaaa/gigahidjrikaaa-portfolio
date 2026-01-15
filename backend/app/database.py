"""Compatibility module.

Historically this project defined engine/session/Base and all SQLAlchemy models
in this single module.

To align with typical FastAPI project structure, those are now split into:
- app/db/* (engine/session/base)
- app/models/* (SQLAlchemy models)

Imports from app.database are kept working by re-exporting symbols.
"""

from .db.base import Base
from .db.session import SessionLocal, engine, get_db
from .models.models import (
    ContactMessage,
    Education,
    Experience,
    Feature,
    Project,
    Skill,
    Technology,
    User,
    project_features,
    project_tech_stack,
)