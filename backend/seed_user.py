from app.config.database import SessionLocal, Base, engine
from app.models.user import User
from app.auth.security import get_password_hash
from app.models.activity import Activity

Base.metadata.create_all(bind=engine)

def seed_admin():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.user_id == "admin").first():
            admin_user = User(
                name="Super Admin",
                user_id="admin",
                password_hash=get_password_hash("admin123"),
                role="SUPER_ADMIN"
            )
            db.add(admin_user)
            db.commit()
            print("Super Admin user created successfully.")
            print("User ID: admin")
            print("Password: admin123")
        else:
            print("Super Admin already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
