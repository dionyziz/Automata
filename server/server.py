from bottle import Bottle, route, run, debug, request
from os import listdir
import models.db
import settings

# models.db.db( settings.host, settings.user, settings.passwd, settings.name )

app = Bottle()

for controller in listdir( 'controllers' ):
    if controller[ -3: ] == '.py' and controller != '__init__.py': 
        controllerName = controller[ :-3 ]
        controllerModule = __import__( 'controllers.' + controllerName )
        controllerClass = getattr( controllerModule, controllerName ).controller
        controllerClass( app, request )

debug( True )
run( app, host = '0.0.0.0', port = 5080, reloader = True )
