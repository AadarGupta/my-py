from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .database import Base

class CodeSubmission(Base):
    __tablename__ = 'submission'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(Text)
    stdout = Column(Text)
    stderr = Column(Text)
