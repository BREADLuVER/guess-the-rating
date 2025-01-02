# settings/prod.py
from .base import *

DEBUG = False

DATABASES['default']['HOST'] = 'db'
DATABASES['default']['PORT'] = '5050'
