import bottle
from beaker.middleware import SessionMiddleware
import logging
import config
import controllers as Controllers

session_opts = {
    'session.type': 'file',
    'session.data_dir': '.data',
    'session.auto': True
}

app = SessionMiddleware(bottle.app(), session_opts)
logging.info("Application initialized with session\n")

# Importing Controllers
Controllers.StaticFiles()
Controllers.Routes()
Controllers.Automaton()
Controllers.Session()
Controllers.Users()

logging.info("Controllers imported\n")

if config.DEVELOPMENT:
    bottle.debug(True)
    bottle.run(app, host=config.HOST, port=config.PORT, reloader=True)

logging.info("Automata server is shutting down\n")
