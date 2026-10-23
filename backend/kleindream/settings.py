import os
import sys
from pathlib import Path
from datetime import timedelta
from urllib.parse import parse_qsl, unquote, urlsplit
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Add apps directory to Python path
sys.path.insert(0, str(BASE_DIR / 'apps'))

load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-kleindream-fashion-luxury-secret-key-2026-xyz')

DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*'] if DEBUG else os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,.vercel.app,.vercel.com').split(',')


# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',

    # KleinDream local apps
    'apps.accounts',
    'apps.catalog',
    'apps.cart',
    'apps.orders',
    'apps.inventory',
    'apps.promotions',
    'apps.content',
    'apps.contact',
    'apps.analytics',
    'apps.store_settings',
    'apps.ai_studio',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'kleindream.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'kleindream.wsgi.application'

DEFAULT_DB_URL = 'postgresql://neondb_owner:npg_Tj3yVxn2gEko@ep-twilight-grass-b4cebi66-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
DATABASE_URL = (os.getenv('DATABASE_URL') or DEFAULT_DB_URL).strip()
if DATABASE_URL:
    database_url = urlsplit(DATABASE_URL)
    if database_url.scheme not in ('postgres', 'postgresql') or not database_url.hostname or not database_url.path.strip('/'):
        raise ValueError('DATABASE_URL must be a valid PostgreSQL connection URL.')

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': unquote(database_url.path.lstrip('/')),
            'USER': unquote(database_url.username or ''),
            'PASSWORD': unquote(database_url.password or ''),
            'HOST': database_url.hostname,
            'PORT': database_url.port or '',
            'CONN_MAX_AGE': int(os.getenv('DB_CONN_MAX_AGE', '60')),
            'OPTIONS': dict(parse_qsl(database_url.query, keep_blank_values=True)),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# In-memory cache (fast for development; swap to Redis in production)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'kleindream-cache',
        'TIMEOUT': 60,  # 60 seconds cache for catalog data
    }
}

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 24,  # Slightly larger page for shop grid
}

# Simple JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS settings
from corsheaders.defaults import default_headers

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-guest-token',
]

# Prevent 500 on POST requests missing trailing slashes
APPEND_SLASH = False

# Email settings (Console backend for development)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'KleinDream Luxury <noreply@kleindream.com>'

# AI Studio Provider Keys (Optional environment variables)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
STABILITY_API_KEY = os.getenv('STABILITY_API_KEY', '')
REPLICATE_API_TOKEN = os.getenv('REPLICATE_API_TOKEN', '')
MESHY_API_KEY = os.getenv('MESHY_API_KEY', '')
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY', '')
