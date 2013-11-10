class controller:
    def __init__(self, app, request):
        @app.route('/session/create', method='POST')
        def create():
            pass

        @app.route('/session/delete', method='POST')
        def delete():
            pass
