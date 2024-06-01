from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql+asyncpg://postgres.wurqgdtneajkbdwrzttu:my-pydatabase123@aws-0-ca-central-1.pooler.supabase.com:6543/postgres"

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

Base = declarative_base()

async def init_db():
    async with engine.begin() as conn:
        # This will create all tables defined in the Base metadata
        await conn.run_sync(Base.metadata.create_all)