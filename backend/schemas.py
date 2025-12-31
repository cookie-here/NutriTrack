from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional
import re

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    due_date: Optional[datetime] = None
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """
        Validate password strength:
        - Minimum 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        """
        if not v or len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)')
        
        return v

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class GrowthRecordCreate(BaseModel):
    age_months: int
    weight_kg: float
    height_cm: float
    head_circumference_cm: float

class GrowthRecordOut(GrowthRecordCreate):
    id: int
    date: datetime

    class Config:
        from_attributes = True

class ReminderCreate(BaseModel):
    title: str
    reminder_date: datetime
    type: str  # 'vaccine' or 'appointment'

class ReminderOut(ReminderCreate):
    id: int
    completed: bool

    class Config:
        from_attributes = True

class NoteCreate(BaseModel):
    title: str
    content: str

class NoteOut(NoteCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True