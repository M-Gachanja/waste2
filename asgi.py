"""
WSGI wrapper for the Backend Django application.
This file should be placed in the project root.
"""

import os
import sys
from pathlib import Path

# Add the Backend directory to Python path
backend_path = Path(__file__).resolve().parent / 'Backend'
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

# Set Django settings module
settings_module = 'wastewise.deployment_settings' if 'RENDER_EXTERNAL_HOSTNAME' in os.environ else 'wastewise.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

# Import Django's WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()