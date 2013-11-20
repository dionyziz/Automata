class controller:
    def __init__(self, app, request):
        @app.route('/user/create', method='POST')
        def create():
            password = request.forms.get('password')
            return 'User create'

        @app.route('/user/delete', method='POST')
        def delete():
            return 'User delete'

        @app.route('/user/update', method='POST')
        def update():
            return 'User update'

        @app.route('/user/view', method='GET')
        def view():
            import models.user
            return 'User view: ' + models.user
