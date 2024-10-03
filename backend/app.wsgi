import sys
import os

# Add your project directory to the sys.path
sys.path.insert(0, os.path.dirname(__file__))

from server import app as application  # Import the Flask app object from server.py
