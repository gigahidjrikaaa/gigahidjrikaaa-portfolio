from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal, User
from auth import get_password_hash
from config import settings

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create admin user if not exists
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        if not admin_user:
            admin_user = User(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,  # You might want to add this to settings
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                is_admin=True,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print(f"Admin user '{settings.ADMIN_USERNAME}' created successfully!")
        else:
            print(f"Admin user '{settings.ADMIN_USERNAME}' already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()