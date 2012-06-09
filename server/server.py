from bottle import Bottle, route, run, debug, request
from os import listdir, path
import models.db
import ConfigParser

config = ConfigParser.RawConfigParser()

if path.exists( 'automata-local.cfg' ):
    print( 'Using configuration file automata-local.cfg' )
    config.read( 'automata-local.cfg' )
elif path.exists( 'automata.cfg' ):
    print( 'Using configuration file automata.cfg' )
    config.read( 'automata.cfg' )
else:
    raise NameError( 'Automata is not configured' )

def initdb():
    hostname = config.get( 'db', 'hostname' )
    username = config.get( 'db', 'username' )
    password = config.get( 'db', 'password' )
    database = config.get( 'db', 'database' )
    models.db.init( hostname, username, password, database )

initdb()

app = Bottle()

for controller in listdir( 'controllers' ):
    if controller[ -3: ] == '.py' and controller != '__init__.py': 
        controllerName = controller[ :-3 ]
        controllerModule = __import__( 'controllers.' + controllerName )
        controllerClass = getattr( controllerModule, controllerName ).controller
        controllerClass( app, request )

debug( True )
run( app, host = config.get( 'server', 'host' ), port = config.get( 'server', 'port' ), reloader = True )
