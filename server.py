import bottle
from beaker.middleware import SessionMiddleware
import logging
import backend.config as config
import backend.controllers as Controllers

session_opts = {
    'session.type': 'file',
    'session.data_dir': '.data',
    'session.auto': True
}

app = SessionMiddleware(bottle.app(), session_opts)
logging.info("Application initialized with session\n")

# Importing controllers
Controllers.StaticFiles()
Controllers.Routes()
Controllers.Automaton()

logging.info("Controllers imported\n")

if config.DEVELOPMENT:
    bottle.debug(True)

bottle.run(app, host=config.HOST, port=config.PORT, reloader=True)

logging.info("Automata server is shutting down\n")
