# This file makes the routes directory a Python package 

# Import and make routers available
from app.routes.quests import router as quests_router  
from app.routes.auth import router as auth_router

# Import the routers directly to make them available at the package level
router = auth_router 