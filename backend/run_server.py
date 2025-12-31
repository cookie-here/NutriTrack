#!/usr/bin/env python3
"""
Simple startup script for the NutriTrack backend server.
This script sets up the Python path and starts the uvicorn server.
"""

import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        reload_dirs=[backend_dir]
    )
