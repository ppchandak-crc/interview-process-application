from pydantic import BaseModel

class UserBase(BaseModel):
    name: str
    user_id: str
    role: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True
