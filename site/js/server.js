function makeErrorHandler( error ) {
    return function( jqXHR, settings, thrownError ) {
        error( thrownError );
    };
}

var Server = {
    Automaton: {
        create: function( data, callback, error ) {
            $.post( 'api/automaton/create', {
                name: '',
                data: data
            }, function( result ) {
                callback( result );
            }, 'json' ).error( makeErrorHandler( error ) );
        },
        view: function( id, callback, error ) {
            $.get( 'api/automaton/' + id, {}, function( result ) {
                callback( result );
            }, 'json' ).error( makeErrorHandler( error ) );
        }
    },
    Session: {
        view: function( callback, error ) {
            $.get( 'api/user', {}, function( result ) {
                callback( result );
            }, 'json' ).error( makeErrorHandler( error ) );
        }
    },
    User: {
        get: function( gid, callback, error ) {
            $.get( 'api/user/' + gid, {}, function( result ) {
                callback( result );
            }, 'json' ).error( makeErrorHandler( error ) );
        },
        automata: function( gid, callback, error ) {
            $.get( 'api/user/' + gid + '/automata', {}, function( result ) {
                callback( result );
            }, 'json' ).error( makeErrorHandler( error ) );
        }
    }
};
