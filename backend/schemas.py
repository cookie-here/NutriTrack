from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    due_date: Optional[datetime] = None

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