import _mysql

class Database:
    def __init__( self, hostname, username, password, database ):
        self.hostname = hostname
        self.username = username
        self.database = database

        self.conn = _mysql.connect( host = hostname, user = username, passwd = password, db = database )

    def close( self ):
        self.conn.close()

    def query( self, sql ):
        self.conn.query( sql )
        return self.conn.store_result()

    def array( self, sql ):
        return self.query( sql ).fetch_row( maxrows = 0, how = 1 )

db = None

def getdb():
    global db

    if db is None:
        raise NameError( 'Database has not been initialized' )
    return db

def init( hostname, username, password, database ):
    global db

    db = Database( hostname, username, password, database )
