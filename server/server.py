from bottle import route, run, debug

@route( '/hello', method='GET' )
def get_hello():
    return "Hello world."

debug( True )
run( host='0.0.0.0', port=5080 )
