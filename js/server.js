var Server = {
    Automaton: {
        create: function( data, callback ) {
            $.post( 'api/automaton/create', {
                name: '',
                data: data
            }, function( result ) {
                callback( result.id );
            }, 'json' );
        },
        view: function( id, callback ) {
            $.get( 'api/automaton/' + id, {}, function( result ) {
                callback( result );
            }, 'json' );
        }
    }
};
