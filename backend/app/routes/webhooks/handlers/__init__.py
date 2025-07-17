"""
Handler initialization module.
"""

from .quiz_handlers import handle_quiz_attempt_submitted
from .assignment_handlers import handle_assign_submitted, handle_assign_graded
from .forum_handlers import handle_forum_post_created, handle_forum_discussion_created
from .lesson_handlers import handle_lesson_completed, handle_lesson_viewed
from .activity_handlers import (
    handle_course_completion_updated,
    handle_feedback_submitted,
    handle_choice_answer_submitted
)
from .resource_handlers import (
    handle_resource_file_viewed,
    handle_resource_book_viewed,
    handle_resource_page_viewed,
    handle_resource_url_viewed
)
from .misc_handlers import (
    handle_glossary_entry_created,
    handle_wiki_page_created,
    handle_wiki_page_updated,
    handle_chat_message_sent
)

__all__ = [
    "handle_quiz_attempt_submitted",
    "handle_assign_submitted",
    "handle_assign_graded",
    "handle_forum_post_created",
    "handle_forum_discussion_created",
    "handle_lesson_completed",
    "handle_lesson_viewed",
    "handle_course_completion_updated",
    "handle_feedback_submitted",
    "handle_choice_answer_submitted",
    "handle_resource_file_viewed",
    "handle_resource_book_viewed",
    "handle_resource_page_viewed",
    "handle_resource_url_viewed",
    "handle_glossary_entry_created",
    "handle_wiki_page_created",
    "handle_wiki_page_updated",
    "handle_chat_message_sent"
]
