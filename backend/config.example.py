"""
config.py: Default configuration.
Rename this file to `config.py` and modify it
"""

# Server:
DEVELOPMENT = True                             # Keep True for Docker
DEPLOY_PATH = "/var/www/discrete.gr/automata"  # Path to automata root
SERVER = 'wsgiref'
BASE_URI = 'https://automata.discrete.gr'
HOST = 'localhost'                             # 0.0.0.0 for Docker
PORT = 8080                                    # Restart script depends on this


# MySQL (Local or Remote)
class SQL:
    HOST     = "127.0.0.1"          # Use ip to avoid unix socket in docker
    USERNAME = "user"               #
    PASSWORD = "password"           # Google cloud SQL can be used
    DATABASE = "automata"           # Just use the appropriate setup


# Google login & Analytics
class GOOGLE:
    CLIENT_ID = 'your-client-id'
    CLIENT_SECRET = 'your-client-secret'
    ANALYTICS = 'your-tracking-id'
