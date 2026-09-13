from pydantic import BaseModel
from typing import Optional


class MasterItemBase(BaseModel):
    name: str
    is_active: bool = True


class MasterItemCreate(BaseModel):
    name: str


class MasterItemUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class MasterItemResponse(MasterItemBase):
    id: int

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str
    user_id: str
    password: str
    role: str = "interviewer"  # super_admin | admin | interviewer


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    user_id: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True
