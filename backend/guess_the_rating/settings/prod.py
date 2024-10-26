# settings/prod.py
from .base import *

DEBUG = True

DATABASES['default']['HOST'] = 'db'
DATABASES['default']['PORT'] = '5432'
