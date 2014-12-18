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
