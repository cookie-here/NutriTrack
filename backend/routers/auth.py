from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, Token
from auth import get_password_hash, verify_password, create_access_token
router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user already exists
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed = get_password_hash(user.password)
        
        # Create new user
        new_user = User(
            email=user.email,
            hashed_password=hashed,
            full_name=user.full_name,
            due_date=user.due_date
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"msg": "User created"}
        
    except HTTPException:
        # Re-raise HTTPExceptions
        db.rollback()
        raise
    except Exception as e:
        # Rollback on any error
        db.rollback()
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration. Please try again."
        )

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        # Query user from database
        user = db.query(User).filter(User.email == form_data.username).first()
        
        # Verify user exists and password is correct
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        token = create_access_token({"sub": str(user.id)})
        return {"access_token": token, "token_type": "bearer"}
        
    except HTTPException:
        # Re-raise HTTPExceptions (like 401)
        raise
    except Exception as e:
        # Catch any other errors and return 500 with JSON
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login. Please try again."
        )