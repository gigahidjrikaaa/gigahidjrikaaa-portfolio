from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from .config import settings

# Create database engine
engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Association table for project tech stack
project_tech_stack = Table(
    'project_tech_stack',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id')),
    Column('tech_id', Integer, ForeignKey('technologies.id'))
)

# Association table for project features
project_features = Table(
    'project_features',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id')),
    Column('feature_id', Integer, ForeignKey('features.id'))
)

# Models
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
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    tech_stack = relationship("Technology", secondary=project_tech_stack, back_populates="projects")
    features = relationship("Feature", secondary=project_features, back_populates="projects")

class Technology(Base):
    __tablename__ = "technologies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String)  # frontend, backend, database, etc.
    
    # Relationships
    projects = relationship("Project", secondary=project_tech_stack, back_populates="tech_stack")

class Feature(Base):
    __tablename__ = "features"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    
    # Relationships
    projects = relationship("Project", secondary=project_features, back_populates="features")

class Experience(Base):
    __tablename__ = "experience"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String)
    location = Column(String)
    period = Column(String)
    description = Column(Text)
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

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()