from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import Role

# User Schemas
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[Role] = Role.CLIENT

class UserResponse(UserBase):
    id: int
    role: Role
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Lawyer Profile Schemas
class LawyerProfileBase(BaseModel):
    specialization: str
    experience_years: int
    bar_number: str
    qualifications: str
    location: Optional[str] = None
    fee_per_hour: Optional[float] = None
    about: Optional[str] = None
    avatar_url: Optional[str] = None
    rating: Optional[float] = 4.9
    reviews_count: Optional[int] = 12
    languages: Optional[str] = "English"

class LawyerProfileCreate(LawyerProfileBase):
    pass

class LawyerProfileResponse(LawyerProfileBase):
    id: int
    user_id: int
    is_verified: bool
    user: UserResponse

    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    specialization: str
    consultation_type: str
    date: str
    time_slot: str
    brief_subject: str
    detailed_description: str

class AppointmentCreate(AppointmentBase):
    lawyer_id: Optional[int] = None

class AppointmentResponse(AppointmentBase):
    id: int
    client_id: int
    lawyer_id: Optional[int] = None
    status: str
    created_at: datetime
    client: UserResponse
    lawyer: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# Legal Resource Schemas
class LegalResourceBase(BaseModel):
    title: str
    category: str
    summary: str
    content: str
    author: Optional[str] = "THE LAW GO Editorial"
    read_time: Optional[str] = "5 min read"
    jurisdiction: Optional[str] = "National / Federal"

class LegalResourceResponse(LegalResourceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# AI Chat Schemas
class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class AIChatResponse(BaseModel):
    response: str
    relevant_resources: Optional[List[str]] = []
    disclaimer: str

# Auth token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Hero Slide Schemas
class HeroSlideBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    image_url: str
    button_text: Optional[str] = "Learn More"
    button_url: Optional[str] = "/lawyers"
    sort_order: Optional[int] = 0
    is_active: Optional[bool] = True

class HeroSlideCreate(HeroSlideBase):
    pass

class HeroSlideResponse(HeroSlideBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
