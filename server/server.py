from bottle import Bottle, route, run, debug, request
from os import listdir, path
import models.db
import ConfigParser

print( "Automata Server is starting" )

config = ConfigParser.RawConfigParser()

if path.exists( 'automata-local.cfg' ):
    print( 'Using configuration file automata-local.cfg' )
    config.read( 'automata-local.cfg' )
elif path.exists( 'automata.cfg' ):
    print( 'Using configuration file automata.cfg' )
    config.read( 'automata.cfg' )
else:
    raise NameError( 'Automata is not configured' )

host = config.get( 'server', 'host' )
port = config.get( 'server', 'port' )
with open( '../.htaccess', 'w' ) as htaccess:
    htaccess.write( """<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule api/(.*) http://%s:%s/$1 [P,QSA]
</IfModule>""" % ( host, port ) )

def initdb():
    hostname = config.get( 'db', 'hostname' )
    username = config.get( 'db', 'username' )
    password = config.get( 'db', 'password' )
    database = config.get( 'db', 'database' )
    models.db.init( hostname, username, password, database )

print( "Connecting to MySQL datatabase" )
initdb()
print( "Connected to MySQL database" )

print( "Initializing bottle.py app" )
app = Bottle()
print( "Bottle.py app initialized" )

print( "Loading controllers" )

for controller in listdir( 'controllers' ):
    if controller[ -3: ] == '.py' and controller != '__init__.py': 
        controllerName = controller[ :-3 ]
        controllerModule = __import__( 'controllers.' + controllerName )
        controllerClass = getattr( controllerModule, controllerName ).controller
        controllerClass( app, request )

print( "Controllers loaded" )

debug( True )
run( app, host = host, port = port, reloader = True )

print( "Automata server is shutting down" )
