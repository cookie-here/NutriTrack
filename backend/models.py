from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(255))
    due_date = Column(DateTime, nullable=True)  # Optional for pregnancy tracking
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    growth_records = relationship("GrowthRecord", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    meals = relationship("Meal", back_populates="user", cascade="all, delete-orphan")
    nutrition_goals = relationship("NutritionGoal", back_populates="user", cascade="all, delete-orphan")
    water_intake = relationship("WaterIntake", back_populates="user", cascade="all, delete-orphan")
    weight_logs = relationship("WeightLog", back_populates="user", cascade="all, delete-orphan")
    symptoms = relationship("Symptom", back_populates="user", cascade="all, delete-orphan")
    allergies = relationship("Allergy", back_populates="user", cascade="all, delete-orphan")

class GrowthRecord(Base):
    __tablename__ = "growth_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.utcnow)
    age_months = Column(Integer)  # Baby age in months
    weight_kg = Column(Float)
    height_cm = Column(Float)
    head_circumference_cm = Column(Float)

    user = relationship("User", back_populates="growth_records")

class Reminder(Base):
    __tablename__ = "reminders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    reminder_date = Column(DateTime)
    type = Column(String(50))  # 'vaccine' or 'appointment'
    completed = Column(Boolean, default=False)

    user = relationship("User", back_populates="reminders")

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notes")

class Meal(Base):
    __tablename__ = "meals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    meal_type = Column(String(50))  # 'breakfast', 'lunch', 'dinner', 'snack'
    food_name = Column(String(255))
    portion_size = Column(String(100))
    calories = Column(Float, nullable=True)
    protein_g = Column(Float, nullable=True)
    carbs_g = Column(Float, nullable=True)
    fat_g = Column(Float, nullable=True)
    meal_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="meals")

class NutritionGoal(Base):
    __tablename__ = "nutrition_goals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    daily_calories = Column(Integer)
    daily_protein_g = Column(Float)
    daily_carbs_g = Column(Float)
    daily_fat_g = Column(Float)
    daily_water_ml = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="nutrition_goals")

class WaterIntake(Base):
    __tablename__ = "water_intake"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount_ml = Column(Integer)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="water_intake")

class WeightLog(Base):
    __tablename__ = "weight_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    weight_kg = Column(Float)
    pregnancy_week = Column(Integer, nullable=True)
    logged_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="weight_logs")

class Symptom(Base):
    __tablename__ = "symptoms"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symptom_type = Column(String(100))
    severity = Column(Integer)  # 1-5 scale
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="symptoms")

class Allergy(Base):
    __tablename__ = "allergies"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    allergen = Column(String(255))
    severity = Column(String(50))  # 'mild', 'moderate', 'severe'
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="allergies")