from sqlalchemy.orm import Session
from models import GrowthRecord, Reminder, Note
from schemas import GrowthRecordCreate, ReminderCreate, NoteCreate

def create_growth_record(db: Session, record: GrowthRecordCreate, user_id: int):
    db_record = GrowthRecord(**record.dict(), user_id=user_id)
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_growth_records(db: Session, user_id: int):
    return db.query(GrowthRecord).filter(GrowthRecord.user_id == user_id).all()

# Similar functions for reminders and notes...