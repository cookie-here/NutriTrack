from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import GrowthRecord, User
from schemas import GrowthRecordCreate, GrowthRecordOut
from auth import get_current_user

router = APIRouter(prefix="/growth", tags=["Growth"])

@router.get("/records", response_model=List[GrowthRecordOut])
def get_growth_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all growth records for the current user"""
    try:
        records = db.query(GrowthRecord).filter(
            GrowthRecord.user_id == current_user.id
        ).order_by(GrowthRecord.date.desc()).all()
        return records
    except Exception as e:
        print(f"Error fetching growth records: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching growth records"
        )

@router.post("/records", response_model=GrowthRecordOut)
def create_growth_record(
    record: GrowthRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new growth record"""
    try:
        new_record = GrowthRecord(
            user_id=current_user.id,
            age_months=record.age_months,
            weight_kg=record.weight_kg,
            height_cm=record.height_cm,
            head_circumference_cm=record.head_circumference_cm
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return new_record
    except Exception as e:
        db.rollback()
        print(f"Error creating growth record: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating growth record"
        )

@router.delete("/records/{record_id}")
def delete_growth_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a growth record"""
    try:
        record = db.query(GrowthRecord).filter(
            GrowthRecord.id == record_id,
            GrowthRecord.user_id == current_user.id
        ).first()
        
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Growth record not found"
            )
        
        db.delete(record)
        db.commit()
        return {"msg": "Growth record deleted"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting growth record: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting growth record"
        )
