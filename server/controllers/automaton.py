import models.automaton

class controller:
    def __init__( self, app, request ):
        @app.route( '/automaton/create', method = 'POST' )
        def create():
            name = request.forms.post( 'name' )
            data = request.forms.pots( 'data' )

            models.automaton.create( name, data )
        @app.route( '/automaton/delete', method = 'POST' )
        def delete():
            pass
        @app.route( '/automaton/update', method = 'POST' )
        def update():
            pass
        @app.route( '/automaton/<id:int>', method = 'GET' )
        def view( id ):
            return models.automaton.item( id )
        @app.route( '/automaton/list', method = 'GET' )
        def list():
            pass
