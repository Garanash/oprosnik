import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import pool
from alembic import context
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models import Base
from database import DATABASE_URL

config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata

def run_migrations_offline():
    url = DATABASE_URL
    context.configure(
        url=url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"}
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    connectable = create_async_engine(
        DATABASE_URL,
        poolclass=pool.NullPool
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
 