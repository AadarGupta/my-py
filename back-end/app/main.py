import io
import sys
import logging
import pandas
import scipy
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID, uuid4
from .db.database import AsyncSessionLocal, init_db
from .db.models import CodeSubmission
import greenlet


app = FastAPI()

# Configure CORS (Cross-Origin Resource Sharing) to allow requests from the frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a simple root endpoint to test if the server is running
@app.get("/")
def read_root():
    return {"Hello": "World"}

# Define the data model for the code execution request
class CodeRequest(BaseModel):
    code: str

class CodeData(BaseModel):
    id: UUID = Field(default=None, description="The unique identifier for the code submission.")
    code: str = Field(..., description="The source code executed.")
    output: Optional[str] = Field(default=None, description="The output of the executed code.")
    error: Optional[str] = Field(default=None, description="Any errors from the executed code.")

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

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.put("/submit/", response_model=CodeData)
async def submit_code(code_data: CodeData, db: AsyncSession = Depends(AsyncSessionLocal)):
    async with db:
        new_submission = CodeSubmission(
            code=code_data.code,
            stdout=code_data.output,
            stderr=code_data.error
        )
        db.add(new_submission)
        await db.commit()
        return code_data  # Returning the passed data as it includes ID if it was generated

