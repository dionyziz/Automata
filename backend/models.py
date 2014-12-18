import db
import config
import logging

logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s', filename='automata.log',
                    level=logging.DEBUG)

DB = db.Database(config.SQL.HOST, config.SQL.USERNAME,
                 config.SQL.PASSWORD, config.SQL.DATABASE)
logging.warning("Connected to SQL database\n")


class Automaton(object):

    def create(self, name, data, uid=''):
        return DB.insert('automata', {'name': name, 'data': data, 'uid': uid})

    def view(self, id):
        return DB.selectOne('automata', {'id': id}, ('id', 'name', 'data', 'uid'))

    def delete(self, id):
        pass
