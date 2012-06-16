import models.automaton

class controller:
    def __init__( self, app, request ):
        @app.route( '/automaton/create', method = 'POST' )
        def create():
            print( "Processing automaton/create request" )

            name = request.forms.name
            data = request.forms.data

            print( "Creating new automaton" )
            id = models.automaton.create( name, data )
            print( "New automaton was created with id %i" % ( id ) )

            return { 'id': id }
        @app.route( '/automaton/delete', method = 'POST' )
        def delete():
            pass
        @app.route( '/automaton/update', method = 'POST' )
        def update():
            pass
        @app.route( '/automaton/<id:int>', method = 'GET' )
        def view( id ):
            print( "Processing automaton/view request with id %i" % ( id ) )

            print( "Retrieving automaton" )
            item = models.automaton.item( id )
            print( "Automaton successfully retrieved" )

            return item
        @app.route( '/automaton/list', method = 'GET' )
        def list():
            pass
