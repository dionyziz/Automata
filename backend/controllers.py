import bottle
import json
import rauth
import config
import models
import logging

page = open('../index.html', "r").read()

class StaticFiles:
    def __init__(self):
        @bottle.route('/site/<path:re:(images|css|js)\/.+>')
        def server_static(path):
            return bottle.static_file(path, root='site')


class Routes:
    def __init__(self):
        @bottle.route('/', methods=['GET'])
        def index():
            return page


class Automaton:
    def __init__(self):
        @bottle.route('/api/automaton/create', method='POST')
        def create():
            session = bottle.request.environ.get('beaker.session')
            logging.info("Processing automaton/create request\n")

            name = bottle.request.forms.name
            data = bottle.request.forms.data

            logging.info("Creating new automaton\n")

            id = models.Automaton().create(name, data)

            logging.info("New automaton was created with id %i. ", (id))

            return str(id)

        @bottle.route('/api/automaton/<id:int>', method='GET')
        def view(id):
            logging.info("Retrieving automaton with id %s\n", (id))
            item = models.Automaton().view(id)
            logging.info("Automaton successfully retrieved\n")

            return item

        @bottle.route('/api/automaton/delete/<id:int>', method='POST')
        def delete(id):
            pass

        @bottle.route('/api/automaton/update/<id:int>', method='POST')
        def update(id):
            pass
