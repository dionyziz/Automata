class controller:
    def __init__( self, app, request ):
        @app.route( '/automaton/create', method = 'POST' )
        def create():
            pass
        @app.route( '/automaton/delete', method = 'POST' )
        def delete():
            pass
        @app.route( '/automaton/update', method = 'POST' )
        def update():
            pass
        @app.route( '/automaton/view', method = 'GET' )
        def view():
            pass
        @app.route( '/automaton/list', method = 'GET' )
        def list():
            pass
