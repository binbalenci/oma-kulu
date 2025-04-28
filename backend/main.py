from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from config.supabase import supabase
from routers import transactions, categories
import toml
from pathlib import Path

# Load environment variables
load_dotenv()

# Get version from pyproject.toml
def get_version():
    pyproject_path = Path(__file__).parent / "pyproject.toml"
    with open(pyproject_path) as f:
        return toml.load(f)["tool"]["poetry"]["version"]

# Create FastAPI app
app = FastAPI(
    title="Oma Kulu API",
    description="API for Oma Kulu expense tracking application",
    version=get_version()
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(transactions.router)
app.include_router(categories.router)

# Basic health check endpoint
@app.get("/api/")
async def root():
    return {
        "message": "Welcome to Oma Kulu API",
        "version": get_version(),
        "status": "healthy"
    }

# Test Supabase connection
@app.get("/api/test-supabase")
async def test_supabase():
    """Test Supabase connection"""
    try:
        # Try to fetch a single row from the transactions table
        response = supabase.table("transactions").select("*").limit(1).execute()
        return {
            "status": "success",
            "message": "Successfully connected to Supabase",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount static files last
app.mount("/", StaticFiles(directory="static", html=True), name="static") 