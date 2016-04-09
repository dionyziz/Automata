import bottle
import json
import rauth
import config
import models
import logging
from models import User

user_info_uri = 'https://www.googleapis.com/oauth2/v1/userinfo'
oauth2 = rauth.OAuth2Service
google = oauth2(
    client_id=config.GOOGLE.CLIENT_ID,
    client_secret=config.GOOGLE.CLIENT_SECRET,
    name='google',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    base_url='https://accounts.google.com/o/oauth2/auth',
)

if config.DEVELOPMENT:
    redirect_uri = '{base_uri}/api/success'.format(
                   base_uri=config.BASE_URI)
else:
    redirect_uri = config.BASE_URI + "/api/success"

page = open('../index.html', "r").read()


class StaticFiles:
    def __init__(self):
        @bottle.route('/site/<path:re:(images|css|js)\/.+>')
        def server_static(path):
            return bottle.static_file(path, root='../site')


class Routes:
    def __init__(self):
        @bottle.route('/', methods=['GET'])
        def index():
            return bottle.template(page, t_id=config.GOOGLE.ANALYTICS)


class Automaton:
    def __init__(self):
        @bottle.route('/api/automaton/create', method='POST')
        def create():
            session = bottle.request.environ.get('beaker.session')
            logging.info("Processing automaton/create request\n")

            name = bottle.request.forms.name
            data = bottle.request.forms.data

            if 'user' in session:
                id = models.Automaton().create(name, data, session['user'])
                logging.info("""New automaton was created with id %i
                                under user %s""", id, session['user'])
            else:
                id = models.Automaton().create(name, data)
                logging.info("New automaton was created with id %i. ", id)

            return str(id)

        @bottle.route('/api/automaton/<id:int>', method='GET')
        def view(id):
            logging.info("Retrieving automaton with id %s\n", id)
            item = models.Automaton().view(id)
            logging.info("Automaton successfully retrieved\n")

            return item

        @bottle.route('/api/automaton/<id:int>/delete', method='POST')
        def delete(id):
            if models.Automaton().view(id):
                session = bottle.request.environ.get('beaker.session')
                uid = models.Automaton().view(id).get('uid')
                if session['user'] == uid:
                    logging.info("Deleting automaton with id %s\n", id)
                    return models.Automaton().delete(id)
                else:
                    logging.info("Unauthorised user %s\n tried to remove Automaton %i",
                            session['user'], id)
            else:
                logging.info("Automation with id %s is nonexistant\n", id)

            return None

        @bottle.route('/api/automaton/<id:int>/update', method='POST')
        def update(id):
             logging.info("Updating automaton with id %s\n", (id))

             name = bottle.request.forms.name
             data = bottle.request.forms.data

             return models.Automaton().update(id, name, data)


class Session:
    def __init__(self):
        @bottle.route('/api/user', method='GET')
        def view():
            session = bottle.request.environ.get('beaker.session')
            if 'user' in session:
                return session['user']
            return "0"

        @bottle.route('/api/login<:re:/?>')
        def create():
            params = {
                'scope': 'email profile',
                'response_type': 'code',
                'redirect_uri': redirect_uri}
            url = google.get_authorize_url(**params)

            bottle.redirect(url)

        @bottle.route('/api/logout')
        def delete():
            session = bottle.request.environ.get('beaker.session')
            if 'user' in session:
                del session['user']

            bottle.redirect('/')

        @bottle.route('/api/success<:re:/?>')
        def login_success():
            user = User()
            session = bottle.request.environ.get('beaker.session')

            auth_session = google.get_auth_session(
                data={'code': bottle.request.params.get('code'),
                      'redirect_uri': redirect_uri,
                      'grant_type': 'authorization_code'},
                decoder=json.loads)

            session_json = auth_session.get(user_info_uri).json()
            session_json = dict((k, unicode(v).encode('utf-8')) for k, v in
                           session_json.iteritems())  # For non-Ascii characters

            # Checks if user exists, if not creates new one
            if user.get(session_json['id']) is None:
                user_info = {
                    'google_id': session_json['id'],
                    'name': session_json['name'],
                    'email': session_json['email'],
                    'picture': session_json['picture']}
                logging.info("Hurray!! %s joined us.\n", user_info['name'])
                user.create(user_info)
                logging.info("Created user %s \n", user_info['google_id'])

            # Creates user session
            session['user'] = session_json['id']

            bottle.redirect('/')


class Users:
    def __init__(self):
        @bottle.route('/api/user/<gid:int>', method='GET')
        def view(gid):
            user = User()
            return user.get(gid)

        @bottle.route('/api/user/<gid:int>/automata', method='GET')
        def get_automata(gid):
            user = User()
            automata = json.dumps( user.automata(gid) )

            return automata
