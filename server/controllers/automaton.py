import models.automaton
from sys import stderr


class controller:
    def __init__(self, app, request):
        @app.route('/automaton/create', method='POST')
        def create():
            stderr.write("Processing automaton/create request\n")

            name = request.forms.name
            data = request.forms.data

            stderr.write("Creating new automaton\n")
            id = models.automaton.create(name, data)
            stderr.write("New automaton was created with id %i\n" % (id))

            return {'id': id}

        @app.route('/automaton/delete', method='POST')
        def delete():
            pass

        @app.route('/automaton/update', method='POST')
        def update():
            pass

        @app.route('/automaton/<id:int>',
                   method='GET')
        def view(id):
            stderr.write("Processing automaton/view request with id %i\n"
                         % (id))

            stderr.write("Retrieving automaton\n")
            item = models.automaton.item(id)
            stderr.write("Automaton successfully retrieved\n")

            return item

        @app.route('/automaton/list', method='GET')
        def list():
            pass

