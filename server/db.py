import MySQLdb
import MySQLdb.cursors
from sys import stderr


class Database:
    def __init__(self, hostname, username, password, database):
        self.hostname = hostname
        self.username = username
        self.password = password
        self.database = database

        self.reconnect()

    def reconnect(self):
        self.conn = MySQLdb.connect(
            host=self.hostname,
            user=self.username,
            passwd=self.password,
            db=self.database,
            use_unicode=True,
            charset='UTF8',
            cursorclass=MySQLdb.cursors.DictCursor
        )

    def close(self):
        self.conn.close()

    def query(self, sql, data):
        stderr.write("Executing SQL query: %s\n" % (sql))

        cursor = self.conn.cursor()
        try:
            cursor.execute(sql, data)
        except (AttributeError, MySQLdb.OperationalError):
            # Attempt to reconnect lost connection.
            # If this fails again, it means that it's not a ping issue,
            # so allow exception to be thrown through the callstack and
            # logged or caught at a higher level.
            self.reconnect()
            cursor = self.conn.cursor()
            cursor.execute(sql, data)
        return cursor.fetchall()

    def select(self, table, where={}, select=('*')):
        """Runs a SELECT query in this form:
            SELECT select FROM table
            WHERE i in where < %s"""
        sql = """SELECT %s FROM %s""" % (', '.join(select), table)
        if len(where) == 0:
            return self.query(sql, ())

        sql += """ WHERE"""
        data = []
        for w in where:
            sql += """ """ + str(w) + """ = %s"""
            data.append(where[w])
        return self.query(sql, tuple(data))

    def selectOne(self, table, where={}, select=('*')):
        rows = self.select(table, where, select)
        if len(rows) == 0:
            return None
        return rows[0]

    def insert(self, table, data):
        """Runs an INSERT query of this form:
            INSERT INTO table ( cols )
            VALUES ( %s in values )"""
        cols = tuple(data.keys())
        values = tuple(data.values())
        sql = """INSERT INTO %s ( %s ) VALUES ( %s )""" % (table, ', '.join(cols),
                                                           ', '.join(['%s' for col in cols]))
        self.query(sql, values)
        return self.conn.insert_id()

singletonDB = None


def db():
    global singletonDB

    if singletonDB is None:
        raise NameError('Database has not been initialized')
    return singletonDB


def init(hostname, username, password, database):
    global singletonDB

    singletonDB = Database(hostname, username, password, database)
