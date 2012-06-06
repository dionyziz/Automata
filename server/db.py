import _mysql
import settings

class db:
    def connect( self, host, user, passwd, name ):
        self.conn = _mysql.connect( host=host, user=user, passwd=passwd, db=name )

    def close( self ):
        self.conn.close()

    def query( self, sql ):
        conn.query( sql )
        return conn.store_result()

    def array( self, sql ):
        return db( conn, sql ).fetch_row( maxrows=0, how=1 )

db.connect( host, user, passwd, name )
