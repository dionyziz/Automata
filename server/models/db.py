import _mysql

class Database:
    def __init__( self, hostname, username, password, database ):
        self.hostname = hostname
        self.username = username
        self.database = database

        self.conn = _mysql.connect( host = hostname, user = username, passwd = password, db = database )

    def eq( value ):
        return [ str( x ) + ' = \'' + str( value[ x ] ) + '\'' for x in value ]

    def close( self ):
        self.conn.close()

    def query( self, sql ):
        self.conn.query( sql )
        return self.conn.store_result()

    def array( self, sql ):
        return self.query( sql ).fetch_row( maxrows = 0, how = 1 )

    def select( self, table, where = {}, select = [ '*' ] ):
        if len( where ) == 0:
            return self.array( 'SELECT %s FROM %s' % ( ','.join( select ), table ) )
        return self.array( 'SELECT %s FROM %s WHERE %s' % ( ','.join( select ), table, ' AND '.join( self.eq( where ) ) ) )

    def insert( self, table, value ):
        self.query( 'INSERT INTO %s SET %s' % ( table, ','.join( self.eq( value ) ) ) )
        return self.conn.insert_id()

db = None

def getdb():
    global db

    if db is None:
        raise NameError( 'Database has not been initialized' )
    return db

def init( hostname, username, password, database ):
    global db

    db = Database( hostname, username, password, database )
