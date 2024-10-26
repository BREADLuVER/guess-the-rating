# settings/dev.py
from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

DATABASES['default']['HOST'] = 'localhost'
