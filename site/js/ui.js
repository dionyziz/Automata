var UI = {
    canvas: null,
    ctx: null,
    resize: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 39;
    },
    button_load: function() {
        var id = document.location.toString().split( '#v' )[1];
        if ( id ) $( ".update, .delete" ).show();
    },
    init: function() {
        // TODO: nfaview should not be a global variable here
        var editor;

        this.canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
        this.ctx = this.canvas.getContext( '2d' );

        $( window ).resize( UI.resize.bind( UI ) );

        UI.resize();
        document.onselectstart = function() {
            return false;
        };

        $( '.toolbar .move' ).click( function() {
            $( '.toolbar li' ).removeClass( 'selected' );
            $( this ).addClass( 'selected' );
            editor.setMode( 'moveState' );
            return false;
        } );
        $( '.toolbar .transition' ).click( function() {
            $( '.toolbar li' ).removeClass( 'selected' );
            $( this ).addClass( 'selected' );
            editor.setMode( 'createTransition' );
            return false;
        } );
        $( '.toolbar .share' ).click( function() {
            document.body.style.cursor = 'wait';
            Server.Automaton.create( nfaview.serialize(), function( id ) {
                document.body.style.cursor = 'default';
                var input = $( '#sharer input' )[ 0 ];
                input.value = document.location.toString().split( '#v' )[0] + '#v' + id;
                $( '#sharer' ).show();
                input.select();
                input.focus();
            }, function( error ) {
                alert( 'We are sorry, but we failed to store your automaton at this time. Please try again in a moment.\n\n' + error );
                document.body.style.cursor = 'default';
            } );
            return false;
        } );
        $( '.toolbar .update' ).click( function() {
            document.body.style.cursor = 'wait';
            Server.Automaton.update( nfaview.serialize(), document.location.toString().split( '#v' )[1], function( ) {
                document.body.style.cursor = 'default';
                var input = $( '#sharer input' )[ 0 ];
                input.value = document.location.toString();
                $( '#sharer' ).show();
                input.select();
                input.focus();
            }, function( error ) {
                alert( 'We are sorry, but we failed to store your automaton at this time. Please try again in a moment.\n\n' + error );
                document.body.style.cursor = 'default';
            } );
            return false;
        } );
        $( '.toolbar .delete' ).click( function() {
            document.body.style.cursor = 'wait';
            id = document.location.toString().split( '#v' )[1]
            Server.Automaton.delete( id, function( ) {
                document.body.style.cursor = 'default';
                alert( 'Succesfully removed Automaton with id ' + id );
            }, function( error ) {
                alert( 'We are sorry, but we failed to remove your automaton at this time. Please try again in a moment.\n\n' + error );
                document.body.style.cursor = 'default';
            } );
            return false;
        } );
 
        $( '#sharer .close' ).click( function() {
            $( '#sharer' ).hide();
            return false;
        } );

        // UI buttons
        $( '.toolbar .run' ).click( Runner.run.bind( Runner ) );
        $( '.runner .next' ).click( Runner.next.bind( Runner ) );
        $( '.runner .rewind' ).click( Runner.rewind.bind( Runner ) );
        $( '.runner .prev' ).click( Runner.prev.bind( Runner ) );
        $( '.runner .fastforward' ).click( Runner.fastforward.bind( Runner ) );
        $( '.runner .close' ).click( Runner.close.bind( Runner ) );

        // Arrow keys
        $( document ).keydown( function( e ) {
            switch ( e.keyCode ) {
                case 37: // left
                    if ( Runner.enabled ) {
                        Runner.prev();
                    }
                    break;
                case 38: // up
                    if ( Runner.enabled ) {
                        Runner.rewind();
                    }
                    break;
                case 39: // right
                    if ( Runner.enabled ) {
                        Runner.next();
                    }
                    break;
                case 40: // down
                    if ( Runner.enabled ) {
                        Runner.fastforward();
                    }
                    break;
                case 27: // escape
                    if ( Runner.enabled ) {
                        Runner.close();
                    }
                    break;
            }
        } );

        var inputSymbol = document.getElementById( 'inputSymbol' );
        var errorSymbol = document.getElementById( 'errorSymbol' );
        var changeStateName = document.getElementById( 'changeStateName' );
        editor = new NFAEditor( this.canvas, nfaview, [ inputSymbol, errorSymbol ], changeStateName );
        editor.play();

        // Rerender the content when the window is resized
        $( window ).resize( editor.renderer.render.bind( editor.renderer ) );

        Runner.init( editor );

        var oldHash = '';

        function checkHash() {
            UI.button_load();
            if ( oldHash != document.location.hash ) {
                oldHash = document.location.hash;
                if ( document.location.hash.substr( 0, 2 ) == '#v' ) {
                    var nfaId = document.location.hash.split( 'v' )[ 1 ];

                    document.body.style.cursor = 'wait';

                    console.log( 'Loading NFA ' + nfaId );

                    Server.Automaton.view( nfaId, function ( automaton ) {
                        document.body.style.cursor = 'default';
                        nfaview.deserialize( automaton.data );
                    }, function( error ) {
                        alert( 'We are sorry, but we failed to load your automaton at this time. Please try again in a moment. You can still edit a new automaton!\n\n' + error );
                        document.body.style.cursor = 'default';
                    } );
                }
            }
        }
        checkHash();
        setInterval( checkHash, 250 );

        Server.Session.view( function ( session ) {
            if ( session ) {
                Server.User.get( session, function ( user ) {
                    $( '#profile' ).show();
                    $( '#user' ).append( user.name );
                    $( '#uimage' ).attr( "src", user.picture );
                    $( '#uimage' ).attr( "alt", user.name );
                }, function( error ) {
                    alert( 'Sorry, but we could not load user \n\n' + error );
                    document.body.style.cursor = 'default';
                } );
            }
            else {
                $('#login').show();
            }
        }, function( error ) {
            alert( 'Sorry, but something went wrong\n\n' + error );
            document.body.style.cursor = 'default';
        } );
    }
};
UI.init();
