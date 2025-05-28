from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
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
    MoodleConfigResponse,
    StoreUserRequest
)
from app.services.moodle import MoodleService
from app.utils.auth import (
    get_password_hash, 
    create_access_token, 
    create_refresh_token, 
    get_current_active_user, 
    get_role_required,
    store_token,
    validate_moodle_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS
)
import os
import logging
import requests
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# CORS Headers for responses
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With",
}


def sync_user_from_moodle(user: User, moodle_user: dict) -> None:
    """
    Synchronize user data from Moodle to our database.
    
    Args:
        user: User model to update
        moodle_user: Moodle user data dictionary
    """
    # Update basic user information
    if "id" in moodle_user:
        user.moodle_user_id = int(moodle_user["id"])
    if "email" in moodle_user:
        user.email = moodle_user["email"]
    if "firstname" in moodle_user:
        user.first_name = moodle_user["firstname"]
    if "lastname" in moodle_user:
        user.last_name = moodle_user["lastname"]
    
    # Update role based on Moodle roles
    roles = moodle_user.get("roles", [])
    is_teacher = False
    is_admin = False
    
    # Check various ways Moodle might provide role information
    if roles:
        # Standard roles array
        is_teacher = any(
            role.get("shortname", "").startswith("teacher") or
            role.get("shortname") == "editingteacher" or
            role.get("shortname") == "manager"
            for role in roles
        )
        
        is_admin = any(
            role.get("shortname") == "admin" or
            role.get("shortname") == "manager"
            for role in roles
        )
    elif "capabilities" in moodle_user:
        # Check for capabilities (alternative way Moodle might provide permissions)
        caps = moodle_user.get("capabilities", {})
        is_teacher = caps.get("moodle/course:manageactivities", False) or caps.get("moodle/course:update", False)
        is_admin = caps.get("moodle/site:config", False) or caps.get("moodle/site:doanything", False)
    elif "userroleid" in moodle_user:
        # Direct role ID from core_webservice_get_site_info
        role_id = int(moodle_user["userroleid"])
        # Common Moodle role IDs, may need adjustment for your instance
        is_admin = role_id in [1, 2]  # Admin, Manager
        is_teacher = role_id in [3, 4]  # Teacher, Non-editing teacher
    
    # Set appropriate role
    if is_admin:
        user.role = "admin"
    elif is_teacher:
        user.role = "teacher"
    else:
        user.role = "student"
    
    logger.info(f"Synchronized user {user.username} with Moodle data, role: {user.role}")
    

@router.options("/moodle/login", status_code=200)
async def options_moodle_login():
    """Handle preflight request for CORS"""
    return Response(headers=CORS_HEADERS)


@router.post("/moodle/login", response_model=MoodleLoginResponse)
async def moodle_login(
    user_data: UserLogin, 
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Login with Moodle credentials.
    
    This endpoint authenticates the user against Moodle,
    gets a Moodle token, and returns a JWT token for API access.
    """
    # Add CORS headers
    for key, value in CORS_HEADERS.items():
        response.headers[key] = value
    
    # Get Moodle config from database or use default
    moodle_config = db.query(MoodleConfig).first()
    base_url = moodle_config.base_url if moodle_config else os.getenv("MOODLE_URL", "http://localhost:8080")
    service = user_data.service or (moodle_config.service_name if moodle_config else "modquest")
    
    logger.info(f"Attempting to login with Moodle at {base_url}")
    
    # Development mode - bypass Moodle authentication if username contains "dev-"
    if user_data.username.startswith("dev-"):
        dev_username = user_data.username[4:]  # Remove "dev-" prefix
        
        # Check if user exists
        user = db.query(User).filter(User.username == dev_username).first()
        
        if not user:
            # Create a development user automatically with properly hashed password
            dev_password_hash = get_password_hash("development_mode_password")
            
            user = User(
                username=dev_username,
                email=f"{dev_username}@example.com",
                password_hash=dev_password_hash,
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
    async with MoodleService(base_url=base_url, verify_ssl=False) as moodle:
        # Check if user exists and has a valid token
        user = db.query(User).filter(User.username == user_data.username).first()
        
        if user and user.user_token:
            # User exists and has a token, let's verify if it's still valid
            is_valid = await validate_moodle_token(user.user_token, moodle)
            
            if is_valid:
                # Token is valid, update user info and proceed with login
                user_info_result = await moodle.get_user_info(user.user_token)
                
                if not user_info_result["success"]:
                    # Token validated but couldn't get user info - unusual, get a new token
                    logger.warning(f"Token validated but user info failed: {user_info_result['error']}")
                else:
                    # Update user info with the latest from Moodle
                    moodle_user = user_info_result["user"]
                    sync_user_from_moodle(user, moodle_user)
                    db.commit()
                    
                    # Generate JWT tokens for our API
                    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
                    access_token = create_access_token(
                        data={"sub": user.username},
                        expires_delta=access_token_expires
                    )
                    
                    refresh_token = create_refresh_token(
                        data={"sub": user.username}
                    )
                    
                    # Store JWT tokens in database
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
                    
                    logger.info(f"User {user.username} logged in successfully with existing token")
                    return MoodleLoginResponse(
                        success=True,
                        token=user.user_token,
                        user=user_response
                    )
        
        # If we reach here, we need to get a new token from Moodle
        logger.info(f"Getting new Moodle token for user {user_data.username}")
        # Get token from Moodle
        token_result = await moodle.get_token(
            username=user_data.username, 
            password=user_data.password,
            service=service
        )
        
        if token_result.error:
            logger.error(f"Failed to get token: {token_result.error}")
            return MoodleLoginResponse(
                success=False, 
                error=token_result.error
            )
        
        # Get user info from Moodle
        user_info_result = await moodle.get_user_info(token_result.token)
        
        if not user_info_result["success"]:
            logger.error(f"Failed to get user info: {user_info_result['error']}")
            return MoodleLoginResponse(
                success=False, 
                error=user_info_result["error"]
            )
            
        # Extract user data
        moodle_user = user_info_result["user"]
        
        # Check if user exists in our database
        user = db.query(User).filter(User.username == user_data.username).first()
        
        if user:
            # Update existing user with new token and info
            user.user_token = token_result.token
            sync_user_from_moodle(user, moodle_user)
        else:
            # Create new user with all Moodle data
            role = "student"  # Default role
            
            # Determine role from user attributes
            roles = moodle_user.get("roles", [])
            if roles:
                if any(role.get("shortname") == "admin" for role in roles):
                    role = "admin"
                elif any(role.get("shortname", "").startswith("teacher") for role in roles):
                    role = "teacher"
            
            # Hash the actual user login password for the password_hash field
            # This way we store the actual credentials that worked with Moodle
            password_hash = get_password_hash(user_data.password)
            
            user = User(
                username=user_data.username,
                email=moodle_user.get("email", ""),
                password_hash=password_hash,  # Use the hashed login password
                moodle_user_id=int(moodle_user.get("id", 0)),
                user_token=token_result.token,
                first_name=moodle_user.get("firstname", ""),
                last_name=moodle_user.get("lastname", ""),
                role=role,
                created_at=datetime.utcnow()  # Explicitly set creation time
            )
            logger.info(f"Created new user {user_data.username} with role {role}")
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
            created_at=user.created_at or datetime.utcnow()
        )
        
        logger.info(f"User {user.username} logged in successfully with new token")
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
    refresh_from_moodle: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get information about the current authenticated user.
    
    Args:
        refresh_from_moodle: If True, refresh user data from Moodle before returning
    """
    if refresh_from_moodle and current_user.user_token:
        # Get Moodle config
        moodle_config = db.query(MoodleConfig).first()
        base_url = moodle_config.base_url if moodle_config else os.getenv("MOODLE_URL", "http://localhost:8080")
        
        try:
            # Connect to Moodle and get latest user data
            async with MoodleService(base_url=base_url, verify_ssl=False) as moodle:
                is_valid = await validate_moodle_token(current_user.user_token, moodle)
                
                if is_valid:
                    user_info_result = await moodle.get_user_info(current_user.user_token)
                    
                    if user_info_result["success"]:
                        # Update user with latest Moodle data
                        moodle_user = user_info_result["user"]
                        sync_user_from_moodle(current_user, moodle_user)
                        db.commit()
                        logger.info(f"Refreshed user data for {current_user.username} from /me endpoint")
        except Exception as e:
            # Log error but don't fail the request
            logger.error(f"Failed to refresh user data from Moodle: {str(e)}")
    
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


@router.post("/refresh-token", response_model=MoodleLoginResponse)
async def refresh_moodle_token(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Refresh a user's Moodle token.
    
    This is used when the token might be expiring or has expired.
    """
    if not current_user.user_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a Moodle token"
        )
    
    # Get Moodle config
    moodle_config = db.query(MoodleConfig).first()
    base_url = moodle_config.base_url if moodle_config else os.getenv("MOODLE_URL", "http://localhost:8080")
    
    # Check if token is still valid
    async with MoodleService(base_url=base_url, verify_ssl=False) as moodle:
        is_valid = await validate_moodle_token(current_user.user_token, moodle)
        
        if is_valid:
            # Token is still valid, no need to refresh but update user info
            user_info_result = await moodle.get_user_info(current_user.user_token)
            
            if user_info_result["success"]:
                # Update user with latest Moodle data
                moodle_user = user_info_result["user"]
                sync_user_from_moodle(current_user, moodle_user)
                db.commit()
                logger.info(f"Refreshed user data for {current_user.username} from Moodle")
            
            # Create UserResponse
            user_response = UserResponse(
                id=current_user.id,
                username=current_user.username,
                email=current_user.email,
                role=current_user.role,
                first_name=current_user.first_name,
                last_name=current_user.last_name,
                is_active=current_user.is_active,
                moodle_user_id=current_user.moodle_user_id,
                created_at=current_user.created_at or datetime.utcnow()
            )
            
            return MoodleLoginResponse(
                success=True,
                token=current_user.user_token,
                user=user_response
            )
        else:
            # Token is invalid, we need to get credentials to generate a new one
            logger.warning(f"Token for user {current_user.username} has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Moodle token has expired. Please login again with username and password."
            )


@router.post("/moodle/store-user", response_model=MoodleLoginResponse)
async def store_moodle_user(
    user_data: StoreUserRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Store Moodle user information in the database.
    
    This endpoint checks if a user already exists by moodleId or username,
    and either updates the existing user or creates a new one.
    """
    # Add CORS headers
    for key, value in CORS_HEADERS.items():
        response.headers[key] = value
    
    try:
        # Check if user already exists by Moodle ID
        user = db.query(User).filter(User.moodle_user_id == user_data.moodleId).first()
        
        if not user:
            # Also check by username
            user = db.query(User).filter(User.username == user_data.username).first()
        
        if user:
            # User exists, update their information
            user.username = user_data.username
            user.email = user_data.email
            user.first_name = user_data.firstName
            user.last_name = user_data.lastName
            user.moodle_user_id = user_data.moodleId
            user.user_token = user_data.token
            user.role = user_data.role or "student"  # Default to student if no role provided
            
            # Update last login time
            user.last_login = datetime.utcnow()
            
            logger.info(f"Updated existing user: {user.username} (ID: {user.id})")
        else:
            # Create a new user
            user = User(
                username=user_data.username,
                email=user_data.email,
                first_name=user_data.firstName,
                last_name=user_data.lastName,
                moodle_user_id=user_data.moodleId,
                user_token=user_data.token,
                role=user_data.role,  # Default role
                is_active=True,
                password_hash="moodle_user",  # Placeholder as we use Moodle auth
                created_at=datetime.utcnow()  # Explicitly set creation time
            )
            db.add(user)
            logger.info(f"Created new Moodle user: {user_data.username}")
        
        # Commit changes
        db.commit()
        db.refresh(user)
        
        # Generate JWT for API access
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username},
            expires_delta=access_token_expires
        )
        
        refresh_token = create_refresh_token(
            data={"sub": user.username}
        )
        
        # Store token
        store_token(
            db=db,
            token=access_token,
            user_id=user.id,
            token_type="access",
            expires_at=datetime.utcnow() + access_token_expires
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
            created_at=user.created_at or datetime.utcnow()
        )
        
        return MoodleLoginResponse(
            success=True,
            token=access_token,
            user=user_response
        )
    except Exception as e:
        logger.error(f"Error storing Moodle user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store user: {str(e)}"
        )


@router.get("/courses", response_model=dict)
async def get_user_courses(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get courses where the current user is enrolled in from Moodle and store them in the database.
    
    This endpoint fetches the user's courses from Moodle using core_enrol_get_users_courses
    and saves them to our database.
    """
    try:
        # Get Moodle config
        moodle_config = db.query(MoodleConfig).first()
        base_url = moodle_config.base_url if moodle_config else os.getenv("MOODLE_URL", "http://localhost:8080")
        
        # Check if user has a valid Moodle token
        if not current_user.user_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User does not have a valid Moodle token"
            )
            
        # Initialize Moodle service
        async with MoodleService(base_url=base_url, verify_ssl=False) as moodle:
            # Verify token validity
            is_valid = await validate_moodle_token(current_user.user_token, moodle)
            
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired Moodle token"
                )
            
            # Get user courses from Moodle
            if not current_user.moodle_user_id:
                # First get user info to get Moodle user ID
                user_info_result = await moodle.get_user_info(current_user.user_token)
                if not user_info_result["success"]:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Failed to get user info from Moodle: {user_info_result['error']}"
                    )
                
                # Update user with Moodle ID
                moodle_user = user_info_result["user"]
                if "id" in moodle_user:
                    current_user.moodle_user_id = int(moodle_user["id"])
                    db.commit()
            
            # Get user courses
            courses_result = await moodle.get_user_courses(
                token=current_user.user_token,
                user_id=str(current_user.moodle_user_id)
            )
            
            if not courses_result["success"]:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to get courses from Moodle: {courses_result['error']}"
                )
            
            # Process and store courses
            from app.models.course import Course as CourseModel
            from app.models.enrollment import CourseEnrollment
            
            course_ids = []
            for course_data in courses_result["courses"]:
                # Check if course already exists
                course = db.query(CourseModel).filter(CourseModel.moodle_course_id == course_data["id"]).first()
                
                if not course:
                    # Create new course
                    course = CourseModel(
                        title=course_data.get("fullname", ""),
                        description=course_data.get("summary", ""),
                        short_name=course_data.get("shortname", ""),
                        course_code=f"MOODLE-{course_data['id']}",
                        teacher_id=current_user.id,  # Default to current user as teacher
                        is_active=True,
                        moodle_course_id=course_data["id"],
                        format=course_data.get("format", ""),
                        visible=course_data.get("visible", True)
                    )
                    db.add(course)
                    db.flush()
                
                # Add course enrollment if not exists
                enrollment = db.query(CourseEnrollment).filter(
                    CourseEnrollment.user_id == current_user.id,
                    CourseEnrollment.course_id == course.id
                ).first()
                
                if not enrollment:
                    # Determine role from Moodle course data
                    role = "student"
                    if current_user.role == "teacher" or current_user.role == "admin":
                        role = "teacher"
                    
                    enrollment = CourseEnrollment(
                        user_id=current_user.id,
                        course_id=course.id,
                        moodle_enrollment_id=course_data.get("id", None),
                        role=role,
                        status="active",
                        last_access=datetime.utcnow()
                    )
                    db.add(enrollment)
                else:
                    # Update last access time
                    enrollment.last_access = datetime.utcnow()
                
                course_ids.append(course.id)
            
            # Commit all changes
            db.commit()
            
            # Fetch all courses the user is enrolled in
            enrollments = db.query(CourseEnrollment).filter(
                CourseEnrollment.user_id == current_user.id
            ).all()
            
            enrolled_course_ids = [enrollment.course_id for enrollment in enrollments]
            
            courses = db.query(CourseModel).filter(CourseModel.id.in_(enrolled_course_ids)).all()
            
            # Convert to dict for response
            courses_data = []
            for course in courses:
                courses_data.append({
                    "id": course.id,
                    "title": course.title,
                    "short_name": course.short_name,
                    "description": course.description,
                    "moodle_course_id": course.moodle_course_id,
                    "is_active": course.is_active
                })
            
            return {
                "success": True,
                "courses": courses_data,
                "message": f"Successfully fetched and stored {len(courses_data)} courses"
            }
    
    except Exception as e:
        logger.error(f"Error in get_user_courses: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user courses: {str(e)}"
        )


@router.get("/get-activities", response_model=dict)
async def get_activities(
    request: Request,
    course_ids: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Fetch all available activities (assignments, quizzes, lessons, forums, etc.) from Moodle using core_course_get_contents.
    Each activity will include an 'is_assigned' boolean indicating if it is already tied to a quest.
    This allows the frontend to filter for assigned, unassigned, or all activities.
    """
    import requests
    token = request.cookies.get("moodleToken")
    if not token:
        raise HTTPException(status_code=401, detail="No Moodle token found in cookies. Please login first.")

    # Get Moodle config
    moodle_config = db.query(MoodleConfig).first()
    base_url = moodle_config.base_url if moodle_config else os.getenv("MOODLE_URL", "http://localhost")
    base_url = base_url.rstrip("/")

    # Determine course IDs
    if course_ids:
        try:
            course_id_list = [int(cid.strip()) for cid in course_ids.split(",") if cid.strip()]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid course_ids format. Use comma-separated integers.")
    else:
        # Get all courses for the user from Moodle
        user_info_params = {
            "wstoken": token,
            "wsfunction": "core_webservice_get_site_info",
            "moodlewsrestformat": "json"
        }
        user_info_url = f"{base_url}/webservice/rest/server.php"
        user_info_resp = requests.get(user_info_url, params=user_info_params, verify=False)
        user_info = user_info_resp.json()
        if "exception" in user_info:
            raise HTTPException(status_code=401, detail="Invalid or expired Moodle token")
        user_id = user_info.get("userid")
        if not user_id:
            raise HTTPException(status_code=500, detail="Could not get user ID from Moodle token")
        # Now get the courses for this user
        course_params = {
            "wstoken": token,
            "wsfunction": "core_enrol_get_users_courses",
            "userid": user_id,
            "moodlewsrestformat": "json"
        }
        url = f"{base_url}/webservice/rest/server.php"
        response = requests.get(url, params=course_params, verify=False)
        courses_result = response.json()
        if isinstance(courses_result, dict) and "exception" in courses_result:
            raise HTTPException(status_code=400, detail=f"Moodle API error: {courses_result.get('message', 'Unknown error')}")
        if not isinstance(courses_result, list):
            raise HTTPException(status_code=500, detail="Unexpected response format from Moodle API")
        course_id_list = [course.get("id") for course in courses_result if isinstance(course, dict) and course.get("id")]

    # Get all assigned moodle_activity_id values from quests table
    from app.models.quest import Quest
    assigned_ids = set(row[0] for row in db.query(Quest.moodle_activity_id).filter(Quest.moodle_activity_id != None).all())

    activities = []
    assignments = []
    quizzes = []
    lessons = []
    forums = []
    others = []

    for course_id in course_id_list:
        params = {
            "wstoken": token,
            "wsfunction": "core_course_get_contents",
            "courseid": course_id,
            "moodlewsrestformat": "json"
        }
        url = f"{base_url}/webservice/rest/server.php"
        try:
            resp = requests.get(url, params=params, verify=False)
            course_contents = resp.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch from Moodle: {str(e)}")

        # Parse course_contents for activities
        if not isinstance(course_contents, list):
            logger.warning(f"Unexpected course contents format for course {course_id}: {course_contents}")
            continue
            
        for section in course_contents:
            if not isinstance(section, dict):
                continue
            for mod in section.get("modules", []):
                activity = {
                    "id": mod.get("id"),
                    "name": mod.get("name"),
                    "modname": mod.get("modname"),
                    "instance": mod.get("instance"),
                    "course": course_id,
                    "description": mod.get("description", ""),
                    "type": mod.get("modname"),
                    "is_assigned": mod.get("id") in assigned_ids,
                    "raw": mod
                }
                activities.append(activity)
                if mod.get("modname") == "assign":
                    assignments.append(activity)
                elif mod.get("modname") == "quiz":
                    quizzes.append(activity)
                elif mod.get("modname") == "lesson":
                    lessons.append(activity)
                elif mod.get("modname") == "forum":
                    forums.append(activity)
                else:
                    others.append(activity)

    return {
        "success": True,
        "assignments": assignments,
        "quizzes": quizzes,
        "lessons": lessons,
        "forums": forums,
        "others": others,
        "activities": activities,
        "count": len(activities)
    }


@router.get("/get-course")
async def get_course(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Fetch course details from Moodle using the token from cookies.
    Uses the Moodle user ID associated with the token.
    Also saves/updates the fetched courses to the local database.
    """
    token = request.cookies.get("moodleToken")
    if not token:
        raise HTTPException(
            status_code=401,
            detail="No Moodle token found in cookies. Please login first."
        )

    # Get Moodle config
    moodle_config = db.query(MoodleConfig).first()
    base_url = moodle_config.base_url if moodle_config else os.getenv("MOODLE_URL", "http://localhost")
    base_url = base_url.rstrip("/")

    try:
        # First get user info to get Moodle user ID
        user_info_params = {
            "wstoken": token,
            "wsfunction": "core_webservice_get_site_info",
            "moodlewsrestformat": "json"
        }
        user_info_url = f"{base_url}/webservice/rest/server.php"
        user_info_resp = requests.get(user_info_url, params=user_info_params, verify=False)
        user_info = user_info_resp.json()

        if "exception" in user_info:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired Moodle token"
            )

        user_id = user_info.get("userid")
        if not user_id:
            raise HTTPException(
                status_code=500,
                detail="Could not get user ID from Moodle token"
            )

        # Now get the courses for this user
        course_params = {
            "wstoken": token,
            "wsfunction": "core_enrol_get_users_courses",
            "userid": user_id,
            "moodlewsrestformat": "json"
        }

        url = f"{base_url}/webservice/rest/server.php"
        response = requests.get(url, params=course_params, verify=False)
        courses_result = response.json()

        # Check for Moodle API errors
        if isinstance(courses_result, dict) and "exception" in courses_result:
            raise HTTPException(
                status_code=400,
                detail=f"Moodle API error: {courses_result.get('message', 'Unknown error')}"
            )

        # Process and format the courses
        courses = []
        from app.models.course import Course as CourseModel
        for course in courses_result:
            # Upsert logic: check if course exists by moodle_course_id
            db_course = db.query(CourseModel).filter(CourseModel.moodle_course_id == course.get("id")).first()
            if db_course:
                # Update existing course
                db_course.title = course.get("fullname", db_course.title)
                db_course.short_name = course.get("shortname", db_course.short_name)
                db_course.description = course.get("summary", db_course.description)
                db_course.format = course.get("format", db_course.format)
                db_course.visible = course.get("visible", db_course.visible)
                db_course.is_active = True
            else:
                # Insert new course
                db_course = CourseModel(
                    title=course.get("fullname", ""),
                    short_name=course.get("shortname", ""),
                    description=course.get("summary", ""),
                    course_code=f"MOODLE-{course.get('id')}",
                    teacher_id=1,  # Default teacher_id, adjust as needed
                    is_active=True,
                    moodle_course_id=course.get("id"),
                    format=course.get("format", ""),
                    visible=course.get("visible", True)
                )
                db.add(db_course)
            courses.append({
                "id": course.get("id"),
                "fullname": course.get("fullname"),
                "shortname": course.get("shortname"),
                "categoryid": course.get("category"),
                "summary": course.get("summary", ""),
                "format": course.get("format"),
                "startdate": course.get("startdate"),
                "enddate": course.get("enddate"),
                "visible": course.get("visible", True),
                "raw": course
            })
        db.commit()

        return {
            "success": True,
            "courses": courses,
            "count": len(courses),
            "message": f"Fetched and saved {len(courses)} courses to the local database."
        }

    except Exception as e:
        logger.error(f"Failed to fetch or save courses from Moodle: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch or save courses from Moodle: {str(e)}"
        )

