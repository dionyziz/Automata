import MySQLdb
import MySQLdb.cursors

class Database:
    def __init__( self, hostname, username, password, database ):
        self.hostname = hostname
        self.username = username
        self.database = database

        self.conn = MySQLdb.connect(
            host = hostname,
            user = username,
            passwd = password,
            db = database,
            use_unicode = True,
            charset = 'UTF8',
            cursorclass = MySQLdb.cursors.DictCursor
        )

    def close( self ):
        self.conn.close()

    def query( self, sql, data ):
        cursor = self.conn.cursor()
        cursor.execute( sql, data )
        return cursor.fetchall()

    def select( self, table, where = {}, select = ( '*' ) ):
        """Runs a SELECT query in this form:
            SELECT select FROM table
            WHERE i in where < %s"""
        sql = """SELECT %s FROM %s""" % ( ', '.join( select ), table )
        if len( where ) == 0:
            return self.query( sql, () )

        sql += """ WHERE"""
        data = []
        for w in where:
            sql += """ """ + str( w ) + """ = %s"""
            data.append( where[ w ] )
        return self.query( sql, tuple( data ) )

    def selectOne( self, table, where = {}, select = ( '*' ) ):
        rows = self.select( table, where, select )
        if rows is None:
            return None
        return rows[ 0 ]

    def insert( self, table, data ):
        """Runs an INSERT query of this form:
            INSERT INTO table ( cols )
            VALUES ( %s in values )"""
        cols = tuple( data.keys() )
        values = tuple( data.values() )
        sql = """INSERT INTO %s ( %s ) VALUES ( %s )""" % ( table,
            ', '.join( cols ),
            ', '.join( [ '%s' for col in cols ] ) )
        cursor = self.conn.cursor()
        cursor.execute( sql, values )
        return self.conn.insert_id()

singletonDB = None

def db():
    global singletonDB

    if singletonDB is None:
        raise NameError( 'Database has not been initialized' )
    return singletonDB

def init( hostname, username, password, database ):
    global singletonDB

    singletonDB = Database( hostname, username, password, database )
