"""checkpoint_before_engagement
alembic revision -m checkpoint_before_engagement

Revision ID: d9d547d697c6
Revises: add_quest_engagement_tracking
Create Date: 2025-09-30 14:24:28.693270

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd9d547d697c6'
down_revision = 'add_quest_engagement_tracking'
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
