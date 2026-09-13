from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from app.config.database import get_db
from app.models.user import User
from app.auth.security import verify_password, create_access_token
from app.utils.audit import log_action

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect user ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Record login timestamp
    user.last_login = datetime.utcnow()

    # Audit log
    log_action(
        db,
        action="login",
        user_id=user.id,
        user_name=user.name,
        details={"user_id_str": user.user_id, "role": user.role},
    )

    db.commit()

    access_token = create_access_token(data={"sub": user.user_id, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name,
        "user_db_id": user.id,
    }
