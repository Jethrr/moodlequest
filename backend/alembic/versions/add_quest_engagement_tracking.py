"""Add quest engagement tracking

Revision ID: add_quest_engagement_tracking
Revises: b8fd08218a3f
Create Date: 2024-01-XX XX:XX:XX.XXXXXX

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_quest_engagement_tracking'
down_revision = 'b8fd08218a3f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add engagement tracking columns to quest_progress
    op.add_column('quest_progress', sa.Column('engagement_stage', sa.String(20), nullable=False, server_default='not_started'))
    op.add_column('quest_progress', sa.Column('first_interaction_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('quest_progress', sa.Column('last_interaction_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('quest_progress', sa.Column('interaction_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('quest_progress', sa.Column('engagement_score', sa.Integer(), nullable=False, server_default='0'))
    
    # Create quest_engagement_events table
    op.create_table('quest_engagement_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('quest_progress_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('event_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('engagement_points', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['quest_progress_id'], ['quest_progress.progress_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_quest_engagement_events_quest_progress_id', 'quest_engagement_events', ['quest_progress_id'])
    op.create_index('ix_quest_engagement_events_event_type', 'quest_engagement_events', ['event_type'])
    op.create_index('ix_quest_engagement_events_timestamp', 'quest_engagement_events', ['timestamp'])


def downgrade() -> None:
    op.drop_index('ix_quest_engagement_events_timestamp', table_name='quest_engagement_events')
    op.drop_index('ix_quest_engagement_events_event_type', table_name='quest_engagement_events')
    op.drop_index('ix_quest_engagement_events_quest_progress_id', table_name='quest_engagement_events')
    op.drop_table('quest_engagement_events')
    op.drop_column('quest_progress', 'engagement_score')
    op.drop_column('quest_progress', 'interaction_count')
    op.drop_column('quest_progress', 'last_interaction_at')
    op.drop_column('quest_progress', 'first_interaction_at')
    op.drop_column('quest_progress', 'engagement_stage')
