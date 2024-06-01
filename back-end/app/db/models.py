from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .db.database import Base

class Submission(Base):
    # Save it under the table "submissions"
    __tablename__ = "submissions"

    # Format for saving the data
    id = Column(Integer, primary_key=True, index=True)
    submitted_at = Column(DateTime, default=func.now(), index=True)
    username = Column(String, index=True)
    code = Column(String, index=True)
    output = Column(String, index=True)

    # Returns the data as a dictionary
    def to_dict(self):
        return {"id": self.id, "date": self.submitted_at, "username": self.username, "code": self.code, "output": self.output}
