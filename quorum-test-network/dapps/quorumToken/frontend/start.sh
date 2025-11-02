#!/bin/bash
# frontend/start.sh - Script to start the frontend server

# Install dependencies
npm install

# Start the development server
npm run dev -- --host 0.0.0.0 --port 8080