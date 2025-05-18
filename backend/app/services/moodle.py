import httpx
import json
import logging
import os
import ssl
import certifi
from typing import Dict, Any, Optional, Union
from app.schemas.auth import MoodleToken, UserResponse

logger = logging.getLogger(__name__)

class MoodleService:
    def __init__(self, base_url: str = None, verify_ssl: bool = False):
        """Initialize the Moodle service with the base URL."""
        if base_url is None:
            base_url = os.getenv("MOODLE_URL", "http://localhost:8080")
        self.base_url = base_url.rstrip("/")  # Remove trailing slash if present
        
        # Create SSL context with certificate verification disabled if requested
        ssl_context = None
        if not verify_ssl:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            logger.info("SSL certificate verification disabled")
        
        # Create HTTP client with SSL settings
        self.client = httpx.AsyncClient(
            timeout=30.0,
            verify=verify_ssl
        )
        
        logger.info(f"MoodleService initialized with base URL: {self.base_url}")

    async def get_token(self, username: str, password: str, service: str = "modquest") -> MoodleToken:
        """
        Authenticate with Moodle and get a token.
        
        Args:
            username: User's Moodle username
            password: User's Moodle password
            service: Moodle web service name
            
        Returns:
            MoodleToken object with token or error
        """
        url = f"{self.base_url}/login/token.php"
        
        params = {
            "username": username,
            "password": password,
            "service": service
        }
        
        try:
            logger.info(f"Attempting to connect to Moodle at URL: {url}")
            response = await self.client.get(url, params=params)
            logger.debug(f"Response status: {response.status_code}")
            response.raise_for_status()
            
            data = response.json()
            
            if "token" in data:
                logger.info("Successfully obtained Moodle token")
                return MoodleToken(token=data["token"])
            else:
                error_msg = data.get("error", "Unknown authentication error")
                logger.error(f"Moodle authentication error: {error_msg}")
                return MoodleToken(token="", error=error_msg)
                
        except httpx.HTTPStatusError as exc:
            error_msg = f"HTTP error occurred: {exc.response.status_code} - {exc.response.text}"
            logger.error(error_msg)
            return MoodleToken(token="", error=error_msg)
            
        except httpx.ConnectError as exc:
            error_msg = f"Connection error: Could not connect to {self.base_url}. Please verify the Moodle URL is correct and the server is running."
            logger.error(f"Connection error details: {str(exc)}")
            return MoodleToken(token="", error=error_msg)
            
        except httpx.RequestError as exc:
            error_msg = f"Request error: {str(exc)}"
            logger.error(error_msg)
            return MoodleToken(token="", error=error_msg)
            
        except Exception as exc:
            error_msg = f"Unexpected error: {str(exc)}"
            logger.error(error_msg)
            return MoodleToken(token="", error=error_msg)

    async def get_user_info(self, token: str) -> dict:
        """
        Get current user information from Moodle.
        
        Args:
            token: Moodle API token
            
        Returns:
            User information as dictionary or error
        """
        url = f"{self.base_url}/webservice/rest/server.php"
        
        # First try to get current user info with current username
        params = {
            "wstoken": token,
            "wsfunction": "core_user_get_users_by_field",
            "moodlewsrestformat": "json",
            "field": "username",
            "values[0]": "current"
        }
        
        try:
            logger.info(f"Fetching user info from Moodle at {url}")
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            logger.debug(f"User info response: {data}")
            
            # Moodle can return different formats depending on settings
            if isinstance(data, list) and len(data) > 0:
                user_data = data[0]
                logger.info(f"Successfully retrieved user info for user ID: {user_data.get('id', 'unknown')}")
                return {
                    "success": True,
                    "user": user_data
                }
            # Handle dictionary response format which some Moodle instances might return
            elif isinstance(data, dict) and "users" in data and len(data["users"]) > 0:
                user_data = data["users"][0]
                logger.info(f"Successfully retrieved user info for user ID: {user_data.get('id', 'unknown')}")
                return {
                    "success": True,
                    "user": user_data
                }
            # Check if response is an error message
            elif isinstance(data, dict) and "exception" in data:
                error_msg = f"Moodle API error: {data.get('message', 'Unknown error')}"
                logger.error(error_msg)
                return {"success": False, "error": error_msg}
            else:
                # Try fallback to core_webservice_get_site_info for older Moodle versions
                logger.warning("No user data returned from core_user_get_users_by_field, trying alternative method")
                return await self._get_user_info_fallback(token)
                
        except httpx.HTTPStatusError as exc:
            logger.error(f"HTTP error occurred: {exc.response.status_code} - {exc.response.text}")
            return {"success": False, "error": f"HTTP error: {exc.response.status_code}"}
            
        except Exception as exc:
            logger.error(f"Error getting user info: {str(exc)}")
            return {"success": False, "error": str(exc)}
    
    async def _get_user_info_fallback(self, token: str) -> dict:
        """
        Fallback method to get user info using core_webservice_get_site_info.
        
        Args:
            token: Moodle API token
            
        Returns:
            User information as dictionary or error
        """
        url = f"{self.base_url}/webservice/rest/server.php"
        
        params = {
            "wstoken": token,
            "wsfunction": "core_webservice_get_site_info",
            "moodlewsrestformat": "json"
        }
        
        try:
            logger.info("Trying fallback method to get user info")
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if "userid" in data:
                # Convert site_info format to match user info format
                user_data = {
                    "id": data.get("userid"),
                    "username": data.get("username", ""),
                    "firstname": data.get("firstname", ""),
                    "lastname": data.get("lastname", ""),
                    "email": data.get("useremail", data.get("username", "") + "@example.com"),
                    "roles": []
                }
                
                logger.info(f"Successfully retrieved user info via fallback for user ID: {user_data['id']}")
                return {
                    "success": True,
                    "user": user_data
                }
            else:
                error_msg = "No user data returned from fallback method"
                logger.error(error_msg)
                return {"success": False, "error": error_msg}
                
        except Exception as exc:
            logger.error(f"Fallback method failed: {str(exc)}")
            return {"success": False, "error": str(exc)}

    async def get_user_courses(self, token: str, user_id: str) -> dict:
        """
        Get courses for a specific user.
        
        Args:
            token: Moodle API token
            user_id: Moodle user ID
            
        Returns:
            List of courses or error
        """
        url = f"{self.base_url}/webservice/rest/server.php"
        
        params = {
            "wstoken": token,
            "wsfunction": "core_enrol_get_users_courses",
            "moodlewsrestformat": "json",
            "userid": user_id
        }
        
        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            return {
                "success": True,
                "courses": data
            }
                
        except Exception as exc:
            logger.error(f"Error getting user courses: {str(exc)}")
            return {"success": False, "error": str(exc)}

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close() 