#!/bin/bash
# backend/start.sh - Script to start the backend server

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Install dependencies
pip install -r requirements.txt

# Run the backend server with updated CORS configuration
uvicorn main:app --host 0.0.0.0 --port ${BACKEND_PORT:-8000} --reload