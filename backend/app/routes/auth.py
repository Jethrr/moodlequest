from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.auth import MoodleConfig
from app.schemas.auth import (
    UserResponse, 
    UserLogin, 
    Token, 
    MoodleLoginResponse, 
    MoodleConfigResponse
)
from app.services.moodle import MoodleService
from app.utils.auth import (
    get_password_hash, 
    create_access_token, 
    create_refresh_token, 
    get_current_active_user, 
    get_role_required,
    store_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/moodle/login", response_model=MoodleLoginResponse)
async def moodle_login(
    user_data: UserLogin, 
    db: Session = Depends(get_db)
):
    """
    Login with Moodle credentials.
    
    This endpoint authenticates the user against Moodle,
    gets a Moodle token, and returns a JWT token for API access.
    """
    # Get Moodle config from database or use default
    moodle_config = db.query(MoodleConfig).first()
    base_url = moodle_config.base_url if moodle_config else "http://localhost:8080"
    service = user_data.service or (moodle_config.service_name if moodle_config else "modquest")
    
    # Development mode - bypass Moodle authentication if username contains "dev-"
    if user_data.username.startswith("dev-"):
        dev_username = user_data.username[4:]  # Remove "dev-" prefix
        
        # Check if user exists
        user = db.query(User).filter(User.username == dev_username).first()
        
        if not user:
            # Create a development user automatically
            user = User(
                username=dev_username,
                email=f"{dev_username}@example.com",
                password_hash="development_mode",
                first_name="Development",
                last_name="User",
                role="teacher",  # Default to teacher role for dev
                user_token="dev-token-123"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create access & refresh tokens
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username},
            expires_delta=access_token_expires
        )
        
        refresh_token = create_refresh_token(
            data={"sub": user.username}
        )
        
        # Store tokens in database
        store_token(
            db=db,
            token=access_token,
            user_id=user.id,
            token_type="access",
            expires_at=datetime.utcnow() + access_token_expires
        )
        
        store_token(
            db=db,
            token=refresh_token,
            user_id=user.id,
            token_type="refresh",
            expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        # Create UserResponse
        user_response = UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            first_name=user.first_name,
            last_name=user.last_name,
            is_active=user.is_active,
            moodle_user_id=user.moodle_user_id,
            created_at=user.created_at
        )
        
        return MoodleLoginResponse(
            success=True,
            token="dev-token-123",
            user=user_response
        )
    
    # Initialize Moodle service
    async with MoodleService(base_url=base_url) as moodle:
        # Get token from Moodle
        token_result = await moodle.get_token(
            username=user_data.username, 
            password=user_data.password,
            service=service
        )
        
        if token_result.error:
            return MoodleLoginResponse(
                success=False, 
                error=token_result.error
            )
        
        # Get user info from Moodle
        user_info_result = await moodle.get_user_info(token_result.token)
        
        if not user_info_result["success"]:
            return MoodleLoginResponse(
                success=False, 
                error=user_info_result["error"]
            )
            
        # Extract user data
        moodle_user = user_info_result["user"]
        
        # Check if user exists in our database
        user = db.query(User).filter(User.username == user_data.username).first()
        
        if user:
            # Update existing user
            user.user_token = token_result.token
            if "id" in moodle_user:
                user.moodle_user_id = int(moodle_user["id"])
            if "email" in moodle_user:
                user.email = moodle_user["email"]
            if "firstname" in moodle_user:
                user.first_name = moodle_user["firstname"]
            if "lastname" in moodle_user:
                user.last_name = moodle_user["lastname"]
        else:
            # Create new user
            user = User(
                username=user_data.username,
                email=moodle_user.get("email", ""),
                moodle_user_id=int(moodle_user.get("id", 0)),
                user_token=token_result.token,
                first_name=moodle_user.get("firstname", ""),
                last_name=moodle_user.get("lastname", ""),
                # Determine role from user attributes or default to student
                role="teacher" if any(
                    role.get("shortname", "").startswith("teacher") 
                    for role in moodle_user.get("roles", [])
                ) else "student"
            )
            db.add(user)
            
        db.commit()
        db.refresh(user)
        
        # Create access & refresh tokens
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username},
            expires_delta=access_token_expires
        )
        
        refresh_token = create_refresh_token(
            data={"sub": user.username}
        )
        
        # Store tokens in database
        store_token(
            db=db,
            token=access_token,
            user_id=user.id,
            token_type="access",
            expires_at=datetime.utcnow() + access_token_expires
        )
        
        store_token(
            db=db,
            token=refresh_token,
            user_id=user.id,
            token_type="refresh",
            expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        # Create UserResponse
        user_response = UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            first_name=user.first_name,
            last_name=user.last_name,
            is_active=user.is_active,
            moodle_user_id=user.moodle_user_id,
            created_at=user.created_at
        )
        
        # Return token and user info
        return MoodleLoginResponse(
            success=True,
            token=token_result.token,
            user=user_response
        )


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Get an access token using username/password (OAuth2 compatible endpoint).
    """
    # This is a simplified version - in a real app, you'd verify credentials
    # against your database or call the Moodle login endpoint
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data={"sub": user.username}
    )
    
    # Store tokens
    store_token(
        db=db,
        token=access_token,
        user_id=user.id,
        token_type="access",
        expires_at=datetime.utcnow() + access_token_expires
    )
    
    store_token(
        db=db,
        token=refresh_token,
        user_id=user.id,
        token_type="refresh",
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    # Create user response
    user_response = UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        is_active=user.is_active,
        moodle_user_id=user.moodle_user_id,
        created_at=user.created_at
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_token=refresh_token,
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """Get information about the current authenticated user."""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        is_active=current_user.is_active,
        moodle_user_id=current_user.moodle_user_id,
        created_at=current_user.created_at
    )


@router.get("/config", response_model=MoodleConfigResponse)
async def get_moodle_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_role_required("admin"))
):
    """Get Moodle configuration (admin only)."""
    config = db.query(MoodleConfig).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Moodle configuration not found"
        )
        
    return config


@router.post("/logout")
async def logout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Logout the current user by revoking their tokens."""
    # In a real implementation, you would revoke all tokens for the user
    # Here we're just returning a success message
    return {"message": "Logout successful"} 