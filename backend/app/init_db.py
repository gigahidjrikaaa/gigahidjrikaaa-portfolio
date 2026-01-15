from .database import engine, Base, SessionLocal, User, Project, Experience, Education, Skill
from .auth import get_password_hash
from .config import settings

def init_db(*, seed_data: bool = False) -> None:
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create admin user only if credentials are provided.
        if settings.ADMIN_USERNAME and settings.ADMIN_EMAIL and settings.ADMIN_PASSWORD:
            admin_user = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
            if not admin_user:
                admin_user = User(
                    username=settings.ADMIN_USERNAME,
                    email=settings.ADMIN_EMAIL,
                    hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                    is_admin=True,
                    is_active=True,
                )
                db.add(admin_user)
                print(f"Admin user '{settings.ADMIN_USERNAME}' created successfully!")
            else:
                print(f"Admin user '{settings.ADMIN_USERNAME}' already exists.")

        # Seed placeholder data only in development (or when explicitly enabled)
        if seed_data:
            if db.query(Project).count() == 0:
                print("Adding placeholder projects...")
                projects_data = [
                    Project(
                        title="Portfolio Website",
                        tagline="Showcasing my work and skills",
                        description="My personal portfolio showcasing projects, skills, and experiences, built with Next.js and Tailwind CSS.",
                        github_url="https://github.com/gigahidjrikaaa/gigahidjrikaaa-portfolio",
                        live_url="https://gigahidjrikaaa.vercel.app",
                        role="Designer & Developer",
                        team_size=1,
                        challenges="Creating a unique, interactive UI with fast load times.",
                        solutions="Used static generation and optimized images.",
                        impact="Received positive feedback from recruiters and peers.",
                        image_url="/placeholder.png",  # Use a generic placeholder image
                        is_featured=True,
                        display_order=1,
                    ),
                    Project(
                        title="E-commerce Platform",
                        tagline="Full-stack online store with payments",
                        description="A full-stack e-commerce application with user authentication, product management, and Stripe payment integration.",
                        github_url="https://github.com/gigahidjrikaaa",
                        live_url=None,
                        role="Lead Developer",
                        team_size=4,
                        challenges="Integrating secure payments and managing inventory in real-time.",
                        solutions="Used Stripe for PCI compliance and MongoDB change streams.",
                        impact="Handled 1000+ orders in the first month.",
                        image_url="/placeholder.png",
                        is_featured=False,
                        display_order=2,
                    ),
                ]
                db.add_all(projects_data)

            if db.query(Experience).count() == 0:
                print("Adding placeholder experience...")
                experience_data = [
                    Experience(
                        title="Full Stack Developer",
                        company="UGM-AICare Project",
                        location="Yogyakarta, Indonesia",
                        period="Jun 2023 - Present",
                        description="Developed an AI-powered mental health chatbot for university students using Next.js, FastAPI, and Redis. Implemented real-time conversation features and data privacy measures.",
                        is_current=True,
                        display_order=1,
                    ),
                    Experience(
                        title="Blockchain Developer",
                        company="Decentralized Voting System",
                        location="Remote",
                        period="Jan 2023 - May 2023",
                        description="Created a proof-of-concept blockchain application for secure and transparent voting using Solidity and Ethereum testnet.",
                        is_current=False,
                        display_order=2,
                    ),
                ]
                db.add_all(experience_data)

            if db.query(Education).count() == 0:
                print("Adding placeholder education...")
                education_data = [
                    Education(
                        degree="Bachelor of Engineering in Information Engineering",
                        institution="Universitas Gadjah Mada",
                        location="Yogyakarta, Indonesia",
                        period="2021 - Present",
                        description="Focus on Artificial Intelligence and Blockchain technologies. Relevant coursework includes Machine Learning, Data Structures, and Web Development.",
                        gpa="3.8/4.0",
                        is_current=True,
                        display_order=1,
                    )
                ]
                db.add_all(education_data)

            if db.query(Skill).count() == 0:
                print("Adding placeholder skills...")
                skills_data = [
                    Skill(name="Python", category="Programming Languages", proficiency=5, display_order=1),
                    Skill(name="JavaScript", category="Programming Languages", proficiency=4, display_order=2),
                    Skill(name="FastAPI", category="Frameworks & Libraries", proficiency=5, display_order=3),
                    Skill(name="Next.js", category="Frameworks & Libraries", proficiency=4, display_order=4),
                    Skill(name="SQLAlchemy", category="Databases & ORMs", proficiency=4, display_order=5),
                    Skill(name="PostgreSQL", category="Databases & ORMs", proficiency=3, display_order=6),
                ]
                db.add_all(skills_data)

        db.commit()

    except Exception as e:
        db.rollback()
        print(f"Database initialization failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db(seed_data=settings.is_development)