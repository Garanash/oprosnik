"""add token to survey

Revision ID: 6549620cee16
Revises: 4381442b8795
Create Date: 2025-07-10 08:52:23.029456

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6549620cee16'
down_revision: Union[str, Sequence[str], None] = '4381442b8795'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('surveys', sa.Column('token', sa.String(), nullable=True))
    # Заполняем токены для всех существующих опросов
    import uuid
    conn = op.get_bind()
    surveys = conn.execute(sa.text('SELECT id FROM surveys')).fetchall()
    for row in surveys:
        conn.execute(sa.text('UPDATE surveys SET token = :token WHERE id = :id'), {'token': str(uuid.uuid4()), 'id': row[0]})
    # Делаем поле NOT NULL и unique
    op.alter_column('surveys', 'token', nullable=False)
    op.create_index(op.f('ix_surveys_token'), 'surveys', ['token'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_surveys_token'), table_name='surveys')
    op.drop_column('surveys', 'token')
