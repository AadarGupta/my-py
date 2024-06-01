from sqlalchemy import Column, Integer, String
from .database import Base

class Submission(Base):
    # Save it under the table "submissions"
    __tablename__ = "submissions"

    # Format for saving the data
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, index=True)
    output = Column(String, index=True)

    # Returns the data as a dictionary
    def to_dict(self):
        return {"id": self.id, "code": self.code, "output": self.output}
