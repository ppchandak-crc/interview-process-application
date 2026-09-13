"""
Masters and User Management CRUD API.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.models.masters import MasterCollege, MasterStream, MasterEducationYear
from app.models.user import User
from app.schemas.masters import (
    MasterItemCreate, MasterItemUpdate, MasterItemResponse,
    UserCreate, UserUpdate, UserResponse,
)
from app.auth.dependencies import get_current_user, require_role
from app.auth.security import get_password_hash

router = APIRouter(prefix="/masters", tags=["Masters"])


# ─── College ──────────────────────────────────────────────────

@router.get("/colleges", response_model=List[MasterItemResponse])
def list_colleges(db: Session = Depends(get_db)):
    return db.query(MasterCollege).order_by(MasterCollege.name).all()


@router.post("/colleges", response_model=MasterItemResponse)
def create_college(
    data: MasterItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "admin")),
):
    if db.query(MasterCollege).filter(MasterCollege.name == data.name).first():
        raise HTTPException(status_code=400, detail="College already exists")
    item = MasterCollege(name=data.name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/colleges/{id}", response_model=MasterItemResponse)
def update_college(
    id: int,
    data: MasterItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "admin")),
):
    item = db.query(MasterCollege).filter(MasterCollege.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="College not found")
    if data.name is not None:
        item.name = data.name
    if data.is_active is not None:
        item.is_active = data.is_active
    db.commit()
    db.refresh(item)
    return item


# ─── Stream ───────────────────────────────────────────────────

@router.get("/streams", response_model=List[MasterItemResponse])
def list_streams(db: Session = Depends(get_db)):
    return db.query(MasterStream).order_by(MasterStream.name).all()


@router.post("/streams", response_model=MasterItemResponse)
def create_stream(
    data: MasterItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "admin")),
):
    if db.query(MasterStream).filter(MasterStream.name == data.name).first():
        raise HTTPException(status_code=400, detail="Stream already exists")
    item = MasterStream(name=data.name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/streams/{id}", response_model=MasterItemResponse)
def update_stream(
    id: int,
    data: MasterItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "admin")),
):
    item = db.query(MasterStream).filter(MasterStream.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Stream not found")
    if data.name is not None:
        item.name = data.name
    if data.is_active is not None:
        item.is_active = data.is_active
    db.commit()
    db.refresh(item)
    return item


# ─── Education Year ───────────────────────────────────────────

@router.get("/years", response_model=List[MasterItemResponse])
def list_years(db: Session = Depends(get_db)):
    return db.query(MasterEducationYear).order_by(MasterEducationYear.name).all()


@router.post("/years", response_model=MasterItemResponse)
def create_year(
    data: MasterItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "admin")),
):
    if db.query(MasterEducationYear).filter(MasterEducationYear.name == data.name).first():
        raise HTTPException(status_code=400, detail="Year already exists")
    item = MasterEducationYear(name=data.name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/years/{id}", response_model=MasterItemResponse)
def update_year(
    id: int,
    data: MasterItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "admin")),
):
    item = db.query(MasterEducationYear).filter(MasterEducationYear.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Year not found")
    if data.name is not None:
        item.name = data.name
    if data.is_active is not None:
        item.is_active = data.is_active
    db.commit()
    db.refresh(item)
    return item


# ─── User Management ─────────────────────────────────────────

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "admin")),
):
    return db.query(User).order_by(User.id).all()


@router.post("/users", response_model=UserResponse)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("super_admin")),
):
    if db.query(User).filter(User.user_id == data.user_id).first():
        raise HTTPException(status_code=400, detail="User ID already exists")
    user = User(
        name=data.name,
        user_id=data.user_id,
        password_hash=get_password_hash(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{id}", response_model=UserResponse)
def update_user(
    id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("super_admin")),
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.name is not None:
        user.name = data.name
    if data.role is not None:
        if user.user_id == "superadmin" and data.role != "super_admin":
            raise HTTPException(status_code=400, detail="Cannot change the role of the main superadmin account.")
        user.role = data.role
    if data.is_active is not None:
        if user.user_id == "superadmin" and data.is_active is False:
            raise HTTPException(status_code=400, detail="Cannot deactivate the main superadmin account.")
        user.is_active = data.is_active
    if data.password is not None:
        user.password_hash = get_password_hash(data.password)
    db.commit()
    db.refresh(user)
    return user
