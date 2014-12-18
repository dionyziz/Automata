var Server = {
    Automaton: {
        create: function( data, callback, error ) {
            $.post( 'api/automaton/create', {
                name: '',
                data: data
            }, function( result ) {
                callback( result );
            }, 'json' ).error( function( jqXHR, settings, thrownError ) {
                error( thrownError );
            } );
        },
        view: function( id, callback, error ) {
            $.get( 'api/automaton/' + id, {}, function( result ) {
                callback( result );
            }, 'json' ).error( function( jqXHR, settings, thrownError ) {
                error( thrownError );
            } );
        }
    }
};
