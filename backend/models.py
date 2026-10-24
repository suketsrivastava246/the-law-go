import enum
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum, Float, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Role(str, enum.Enum):
    CLIENT = "client"
    LAWYER = "lawyer"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    hashed_password = Column(String)
    role = Column(Enum(Role), default=Role.CLIENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lawyer_profile = relationship("LawyerProfile", back_populates="user", uselist=False)
    client_appointments = relationship("Appointment", back_populates="client", foreign_keys="Appointment.client_id")
    lawyer_appointments = relationship("Appointment", back_populates="lawyer", foreign_keys="Appointment.lawyer_id")

class LawyerProfile(Base):
    __tablename__ = "lawyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    specialization = Column(String, index=True)
    experience_years = Column(Integer)
    bar_number = Column(String)
    qualifications = Column(String) # Comma separated
    location = Column(String, nullable=True)
    fee_per_hour = Column(Float, nullable=True)
    about = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    rating = Column(Float, default=4.9)
    reviews_count = Column(Integer, default=12)
    languages = Column(String, default="English, Spanish")
    is_verified = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="lawyer_profile")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    lawyer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    specialization = Column(String)
    consultation_type = Column(String) # Video Call, Voice Call, Secure Chat
    date = Column(String) # YYYY-MM-DD
    time_slot = Column(String) # HH:MM AM/PM
    brief_subject = Column(String)
    detailed_description = Column(Text)
    status = Column(String, default="pending") # pending, confirmed, completed, cancelled
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    client = relationship("User", back_populates="client_appointments", foreign_keys=[client_id])
    lawyer = relationship("User", back_populates="lawyer_appointments", foreign_keys=[lawyer_id])

class LegalResource(Base):
    __tablename__ = "legal_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String, index=True) # Constitution, Criminal Law, Civil Law, Family Law, Corporate Law, Cyber Crime, Taxation
    summary = Column(Text)
    content = Column(Text)
    author = Column(String, default="THE LAW GO Legal Research Team")
    read_time = Column(String, default="5 min read")
    jurisdiction = Column(String, default="National / Federal")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class HeroSlide(Base):
    __tablename__ = "hero_slides"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subtitle = Column(Text, nullable=True)
    image_url = Column(String, nullable=False)
    button_text = Column(String, nullable=True, default="Learn More")
    button_url = Column(String, nullable=True, default="/lawyers")
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
