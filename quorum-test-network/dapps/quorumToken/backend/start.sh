#!/bin/bash
# backend/start.sh - Script to start the backend server

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Install dependencies
pip install -r requirements.txt

# Run the backend server with updated CORS configuration
uvicorn main:app --host localhost --port ${BACKEND_PORT:-8000} --reload