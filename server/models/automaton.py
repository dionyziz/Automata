from models.db import db


def create(name, data):
    return db().insert('automata', {'name': name, 'data': data})


def item(id):
    return db().selectOne('automata', {'id': id}, ('id', 'name', 'data'))
