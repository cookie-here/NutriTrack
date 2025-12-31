from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Reminder, User
from schemas import ReminderCreate, ReminderOut
from auth import get_current_user

router = APIRouter(prefix="/reminders", tags=["Reminders"])

@router.get("/", response_model=List[ReminderOut])
def get_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all reminders for the current user"""
    try:
        reminders = db.query(Reminder).filter(
            Reminder.user_id == current_user.id
        ).order_by(Reminder.reminder_date.asc()).all()
        return reminders
    except Exception as e:
        print(f"Error fetching reminders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching reminders"
        )

@router.post("/", response_model=ReminderOut)
def create_reminder(
    reminder: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new reminder"""
    try:
        new_reminder = Reminder(
            user_id=current_user.id,
            title=reminder.title,
            reminder_date=reminder.reminder_date,
            type=reminder.type
        )
        db.add(new_reminder)
        db.commit()
        db.refresh(new_reminder)
        return new_reminder
    except Exception as e:
        db.rollback()
        print(f"Error creating reminder: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating reminder"
        )

@router.patch("/{reminder_id}/complete")
def complete_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a reminder as completed"""
    try:
        reminder = db.query(Reminder).filter(
            Reminder.id == reminder_id,
            Reminder.user_id == current_user.id
        ).first()
        
        if not reminder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reminder not found"
            )
        
        reminder.completed = True
        db.commit()
        db.refresh(reminder)
        return reminder
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error completing reminder: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error completing reminder"
        )

@router.delete("/{reminder_id}")
def delete_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a reminder"""
    try:
        reminder = db.query(Reminder).filter(
            Reminder.id == reminder_id,
            Reminder.user_id == current_user.id
        ).first()
        
        if not reminder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reminder not found"
            )
        
        db.delete(reminder)
        db.commit()
        return {"msg": "Reminder deleted"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting reminder: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting reminder"
        )
