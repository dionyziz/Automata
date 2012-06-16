from bottle import Bottle, route, run, debug, request
from os import listdir, path
from sys import stderr
import models.db
import ConfigParser

stderr.write( "Automata Server is starting" )

config = ConfigParser.RawConfigParser()

if path.exists( 'automata-local.cfg' ):
    stderr.write( 'Using configuration file automata-local.cfg\n' )
    config.read( 'automata-local.cfg' )
elif path.exists( 'automata.cfg' ):
    stderr.write( 'Using configuration file automata.cfg\n' )
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

stderr.write( "Connecting to MySQL datatabase\n" )
initdb()
stderr.write( "Connected to MySQL database\n" )

stderr.write( "Initializing bottle.py app\n" )
app = Bottle()
stderr.write( "Bottle.py app initialized\n" )

stderr.write( "Loading controllers\n" )

for controller in listdir( 'controllers' ):
    if controller[ -3: ] == '.py' and controller != '__init__.py': 
        controllerName = controller[ :-3 ]
        controllerModule = __import__( 'controllers.' + controllerName )
        controllerClass = getattr( controllerModule, controllerName ).controller
        controllerClass( app, request )

stderr.write( "Controllers loaded\n" )

debug( True )
run( app, host = host, port = port, reloader = True )

stderr.write( "Automata server is shutting down\n" )
