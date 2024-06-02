import io
import sys
import logging
import pandas
import scipy
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from uuid import UUID
from .db.models import Submission
from .db.database import engine, SessionLocal, Base
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

app = FastAPI()

Base.metadata.create_all(bind=engine)

# Configure CORS (Cross-Origin Resource Sharing) to allow requests from the frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the data model for the code execution request
class CodeRequest(BaseModel):
    code: str = Field(min_length=1)

# Define the data model for the code submission request
class CodeSubmit(BaseModel):
    username: str = Field(min_length=1)
    code: str = Field(min_length=0)
    output: str = Field(min_length=0)

# Gets the current session of the db
def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

# Endpoint to submit the code
@app.post("/submit/")
def submit_code(submitted_code: CodeSubmit, db: Session = Depends(get_db)):
    # Creates a submission
    submission_model = Submission()
    submission_model.code = submitted_code.code
    submission_model.output = submitted_code.output
    submission_model.username = submitted_code.username

    # Adds and commits changes to the db
    db.add(submission_model)
    db.commit()

    return submission_model.to_dict()

# Endpoint to open submission from id
@app.get("/open/{id}")
def get_submissions_by_id(id: str, db: Session = Depends(get_db)):
    curr_submission = db.query(Submission).filter(Submission.id == int(id)).first()
    
    if not curr_submission:
        raise HTTPException(status_code=404, detail="No submissions found for this id")

    # Return the submissions along with the count
    return curr_submission

# Endpoint to see how many submissions have been made
@app.get("/submissions/{username}")
def get_submissions_by_username(username: str, db: Session = Depends(get_db)):
    submissions = db.query(Submission).filter(Submission.username == username).all()
    
    if not submissions:
        return 0

    # Return the submissions along with the count
    return len(submissions)

# Endpoint to test the code
@app.post("/test/")
async def test_code(request: CodeRequest):
    try:
        # Redirect stdout and stderr to capture prints and errors
        old_stdout = sys.stdout  
        old_stderr = sys.stderr
        sys.stdout = io.StringIO() 
        sys.stderr = io.StringIO() 

        # Create a restricted environment for code execution
        restricted_globals = {
            "__builtins__": {
                "print": print,
                "range": range,
                "len": len,
                "__import__": __import__
            },
            
        }

        # Execute the provided code within the restricted environment
        exec(request.code, restricted_globals, {})

        # Capture the output from stdout and stderr
        stdout_output = sys.stdout.getvalue()
        stderr_output = sys.stderr.getvalue()

        # Reset stdout and stderr to their original values
        sys.stdout = old_stdout
        sys.stderr = old_stderr

        # Return the captured output and errors
        return {"results": stdout_output, "error": stderr_output}

    except Exception as e:
        # Log the exception and reset stdout and stderr
        logging.exception("Error executing code")
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        return {"results": "", "error": str(e)}
