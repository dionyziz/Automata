var UI = {
    canvas: null,
    ctx: null,
    resize: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 39;
    },
    init: function() {
        // TODO: nfaview should not be a global variable here
        var editor;

        this.canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
        this.ctx = this.canvas.getContext( '2d' );

        window.onresize = UI.resize.bind( this );
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
            Server.Automaton.create( nfaview.serialize(), function( id ) {
                alert( 'Created automaton with id = ' + id );
            } );
            return false;
        } );

        // UI buttons
        $( '.toolbar .run' ).click( Runner.run.bind( Runner ) );
        $( '.runner .next' ).click( Runner.next.bind( Runner ) );
        $( '.runner .rewind' ).click( Runner.rewind );
        $( '.runner .prev' ).click( Runner.prev );
        $( '.runner .fastforward' ).click( Runner.fastforward );
        $( '.runner .close' ).click( Runner.close );

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

        Runner.init( editor );
    }
};
UI.init();
