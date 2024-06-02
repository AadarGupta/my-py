# RunPy
Python 3.0 Compiler (with pandas and scipy support) for DataCurve assessment

## How To Run

### Front-End
1. Navigate to the ```front-end``` folder
2. Run ```npm install``` to download the required packages
3. Run ```npm run dev``` to start the front-end server

### Back-End 
1. Navigate to the ```back-end``` folder
2. On Mac/Linux: ```source venv/bin/activate``` and on Windows: ```.\venv\Scripts\activate```
3. Run ```uvicorn app.main:app --reload``` to run the backend server

## Features

1. Write and run python code
2. Submit your code to the database (based on username)
3. View how many submissions you have made
4. Open a previous submission using the id
