"""
Vercel serverless entrypoint for the KleinDream Django backend.

Vercel's Python buildpack detects this file and exposes the WSGI
``application`` callable as the request handler.
"""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kleindream.settings')

application = get_wsgi_application()