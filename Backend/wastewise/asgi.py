"""
ASGI config for wastewise project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

# Determine which settings to use
settings_module = 'wastewise.deployment_settings' if 'RENDER_EXTERNAL_HOSTNAME' in os.environ else 'wastewise.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

application = get_asgi_application()