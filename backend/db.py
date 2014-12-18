import MySQLdb
import MySQLdb.cursors
import logging

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

    def query(self, sql, data=[]):
        logging.debug("Executing SQL query: %s\n", sql)

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
        """SELECT (select) FROM (table) WHERE (where)"""
        sql = "SELECT %s FROM %s " % (', '.join(select), table)
        if len(where) == 0:
            return self.query(sql, ())
        data = []
        operator = 'WHERE '
        for w in where:
            sql += operator + str(w) + " = %s "
            data.append(where[w])
            operator = 'AND '
        return self.query(sql, tuple(data))

    # Runs a SELECT but return only first row
    def selectOne(self, table, where={}, select=('*')):
        rows = self.select(table, where, select)
        if len(rows) == 0:
            return None
        return rows[0]

    def insert(self, table, data):
        """INSERT (data) INTO (table)"""
        cols = tuple(data.keys())
        values = tuple(data.values())
        sql = "INSERT INTO %s ( %s ) VALUES ( %s )" % (
              table, ', '.join(cols), ', '.join(['%s' for col in cols]))
        self.query(sql, values)
        return self.conn.insert_id()

    def delete(self, table, where={}):
        """DELETE row FROM (table) WHERE (where)"""
        sql = "DELETE FROM %s " %  (table)
        data = []
        operator = 'WHERE '
        for w in where:
            sql += operator + str(w) + " = %s "
            data.append(where[w])
            operator = 'AND '
        return self.query(sql, tuple(data))

    def update(self, table, data, where={}):
        """UPDATE (table) SET (column=value) WHERE (where)"""
        cols = tuple(data.keys())
        values = tuple(data.values())
        values += tuple(where.values())
        sql = 'UPDATE %s SET %s ' % (
                table, ' = %s, '.join(cols) + ' = %s' )
        operator = 'WHERE '
        for w in where:
            sql += operator + str(w) + " = %s"
            operator = "AND "
        return self.query(sql, values)


singletonDB = None


def db():
    global singletonDB

    if singletonDB is None:
        raise NameError('Database has not been initialized')
    return singletonDB


def init(hostname, username, password, database):
    global singletonDB

    singletonDB = Database(hostname, username, password, database)
