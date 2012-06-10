var UI = {
    canvas: null,
    ctx: null,
    inputString: '',
    runStep: '',
    displayRunDone: function() {
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
        $( '#runstatus' ).html( 'Running' );
        $( '#runstatus' ).removeClass( 'reject accept icon' );
        $( '#runinput .state' ).removeClass( 'selected' );
        $( $( '#runinput .state' )[ this.runStep ] ).addClass( 'selected' );
    },
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
            alert( 'Coming soon! :)' );
            return false;
        } );

        this.runStep = 0;
        var self = this;

        function beginRunning() {
            self.runStep = 0;
            editor.run( self.inputString );
            ol = $( '#runinput' );
            ol.empty();
            for ( var i = 0; i < self.inputString.length; ++i ) {
                ol.append(
                    $( '<li class="state">&nbsp;</li>' )
                );
                ol.append(
                    $( '<li class="transition">' + self.inputString[ i ] + '</li>' )
                );
            }
            ol.append(
                $( '<li class="state">&nbsp;</li>' )
            );
            $( '.runner' ).show();
            self.displayRunStatus();
            runner.enabled = true;
        }

        $( '.toolbar .run' ).click( function() {
            self.inputString = prompt( 'Enter input string: ', 'abba' );

            if ( typeof self.inputString != 'string' ) {
                return false;
            }
            for ( var i = 0; i < self.inputString.length; ++i ) {
                if ( !( self.inputString[ i ] in nfaview.nfa.alphabet ) ) {
                    return false;
                }
            }

            beginRunning();
            return false;
        } );
        function displayAcceptanceResult() {
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
        var runner = {
            enabled: false,
            next: function() {
                ++self.runStep;
                if ( self.runStep > self.inputString.length ) {
                    self.runStep = self.inputString.length;
                    return false;
                }

                if ( editor.runStep() ) {
                    self.displayRunStatus();
                    displayAcceptanceResult();
                }
                else {
                    self.displayRejectedStatus();
                }
                return false;
            },
            rewind: function() {
                beginRunning();
                return false;
            },
            prev: function() {
                var step = Math.max( 0, self.runStep - 1 );

                beginRunning();

                self.runStep = step;

                editor.gotoStep( self.inputString, self.runStep );
                self.displayRunStatus();

                return false;
            },
            fastforward: function() {
                beginRunning();
                self.runStep = self.inputString.length;
                editor.gotoStep( self.inputString, self.runStep );
                self.displayRunStatus();
                displayAcceptanceResult();

                return false;
            },
            close: function() {
                editor.setRun( false );
                $( '.runner' ).hide();
                this.enabled = false;
                return false;
            }
        };

        // UI buttons
        $( '.runner .next' ).click( runner.next );
        $( '.runner .rewind' ).click( runner.rewind );
        $( '.runner .prev' ).click( runner.prev );
        $( '.runner .fastforward' ).click( runner.fastforward );
        $( '.runner .close' ).click( runner.close );

        // Arrow keys
        $( document ).keydown( function( e ) {
            console.log( e.keyCode );
            switch ( e.keyCode ) {
                case 37: // left
                    if ( runner.enabled ) {
                        runner.prev();
                    }
                    break;
                case 38: // up
                    if ( runner.enabled ) {
                        runner.rewind();
                    }
                    break;
                case 39: // right
                    if ( runner.enabled ) {
                        runner.next();
                    }
                    break;
                case 40: // down
                    if ( runner.enabled ) {
                        runner.fastforward();
                    }
                    break;
                case 27: // escape
                    if ( runner.enabled ) {
                        runner.close();
                    }
                    break;
            }
        } );

        var inputSymbol = document.getElementById( 'inputSymbol' );
        var errorSymbol = document.getElementById( 'errorSymbol' );
        var changeStateName = document.getElementById( 'changeStateName' );
        editor = new NFAEditor( this.canvas, nfaview, [ inputSymbol, errorSymbol ], changeStateName );
        editor.play();
    }
};
UI.init();
