from sqlalchemy import Column, Integer, String, Boolean
from app.config.database import Base


class MasterCollege(Base):
    __tablename__ = "master_colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)


class MasterStream(Base):
    __tablename__ = "master_streams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)


class MasterEducationYear(Base):
    __tablename__ = "master_education_years"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
