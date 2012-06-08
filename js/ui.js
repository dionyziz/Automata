var UI = {
    canvas: null,
    ctx: null,
    inputString: '',
    runStep: '',
    displayRunDone: function() {
        $( '.runtoolbar .step' ).hide();
        $( '.runtoolbar .edit' ).show();
    },
    displayRejectedStatus: function() {
        $( '#runstatus' ).html( 'Rejected' );
        $( '#runstatus' ).addClass( 'reject icon' );
        this.displayRunDone();
    },
    displayAcceptedStatus: function() {
        $( '#runstatus' ).html( 'Accepted' );
        $( '#runstatus' ).addClass( 'accept icon' );
        this.displayRunDone();
    },
    displayRunStatus: function() {
        $( '.runtoolbar code' ).html(
              '<span class="seen">'
            + this.inputString.substr( 0, this.runStep )
            + '</span>'
            + '<span class="current">'
            + this.inputString.substr( this.runStep, 1 )
            + '</span>'
            + this.inputString.substr( this.runStep + 1 )
        );
        $( '.runtoolbar .step' ).show();
        $( '.runtoolbar .edit' ).hide();
        $( '#runstatus' ).html( 'Running' );
    },
    resize: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 39;
    },
    init: function() {
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
            alert( 'Coming soon! :)' );
            return false;
        } );

        this.runStep = 0;
        var self = this;

        $( '.toolbar .run' ).click( function() {
            self.inputString = prompt( 'Enter input string: ', 'abba' );
            $( '.runtoolbar' ).show();
            $( '.toolbar' ).hide();
            $( '#runstatus' ).removeClass( 'accept' );
            $( '#runstatus' ).removeClass( 'reject' );
            self.runStep = 0;
            editor.run( self.inputString );
            self.displayRunStatus();
            return false;
        } );
        $( '.runtoolbar .step' ).click( function() {
            if ( editor.runStep() ) {
                ++self.runStep;
                self.displayRunStatus();
                if ( self.runStep == self.inputString.length ) {
                    var accepting = false;

                    for ( var state in nfaview.nfa.currentStates ) {
                        if ( nfaview.nfa.accept[ state ] ) {
                            accepting = true;
                            break;
                        }
                    }
                    if ( accepting ) {
                        self.displayAcceptedStatus();
                    }
                    else {
                        self.displayRejectedStatus();
                    }
                }
                else if ( nfaview.nfa.currentStates.length == 0 ) {
                    self.displayRejectedStatus();
                }
            }
            return false;
        } );
        $( '.runtoolbar .edit' ).click( function() {
            // run the final step
            editor.runStep();
            $( '.runtoolbar' ).hide();
            $( '.toolbar' ).show();
            return false;
        } );

        var inputSymbol = document.getElementById( 'inputSymbol' );
        var errorSymbol = document.getElementById( 'errorSymbol' );
        var changeStateName = document.getElementById( 'changeStateName' );
        var editor = new NFAEditor( this.canvas, nfaview, [ inputSymbol, errorSymbol ], changeStateName );
        editor.play();
    }
};
UI.init();
