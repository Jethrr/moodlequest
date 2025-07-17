"""
Webhooks module - now refactored into organized sub-modules.

This file maintains backward compatibility by re-exporting the router
from the new modular structure.

The original 1,702-line webhooks.py file has been refactored into:
- webhooks/router.py - Main router and event dispatcher
- webhooks/utils.py - Common utilities and XP configuration
- webhooks/handlers/ - Individual handler modules:
  - quiz_handlers.py - Quiz-related webhooks
  - assignment_handlers.py - Assignment-related webhooks
  - forum_handlers.py - Forum-related webhooks
  - lesson_handlers.py - Lesson-related webhooks
  - activity_handlers.py - General activity webhooks
  - resource_handlers.py - Resource viewing webhooks (TODO)
  - misc_handlers.py - Miscellaneous webhooks (TODO)
"""

# Import the router from the new modular structure
from .webhooks.router import router

# Re-export for backward compatibility
__all__ = ["router"]
