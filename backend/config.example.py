"""
config.py: Default configuration.
Rename this file to `config.py` and modify it
"""

# Server:
DEVELOPMENT = True                # False for Deployment
SERVER = 'wsgiref'
BASE_URI = 'http://automata.discrete.gr/'
HOST = 'localhost'
PORT = 8080


# MySQL (Local or Remote)
class SQL:
    HOST     = "localhost"          # Here configure your mysql database.
    USERNAME = "user"               #
    PASSWORD = "password"           # Google cloud SQL can be used
    DATABASE = "automata"           # Just use the appropriate setup


# Google login
class GOOGLE:
    CLIENT_ID = 'your-client-id'
    CLIENT_SECRET = 'your-client-secret'
