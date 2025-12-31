from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import User
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Set defaults for development - in production, use environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production-min-32-chars")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

def verify_password(plain_password, hashed_password):
    try:
        # Bcrypt has a 72-byte limit, truncate the same way as during hashing
        password_bytes = plain_password.encode('utf-8')[:72]
        return pwd_context.verify(password_bytes, hashed_password)
    except Exception as e:
        # Log the error in production
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password):
    try:
        # Bcrypt has a 72-byte limit, so truncate if necessary
        # This is safe because the entropy is still high
        password_bytes = password.encode('utf-8')[:72]
        return pwd_context.hash(password_bytes)
    except Exception as e:
        # Log the error in production
        print(f"Password hashing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing password"
        )

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user