# settings/prod.py
from .base import *

DEBUG = False

DATABASES['default']['HOST'] = 'db'
