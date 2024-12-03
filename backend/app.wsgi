import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
print(os.path.dirname(__file__))  # Debug print of directory
try:
    from server import app as application
    print("Import successful")
except Exception as e:
    print(f"Import failed: {e}")
