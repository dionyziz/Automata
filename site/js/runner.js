var Runner = {
    editor: null,
    enabled: false,
    inputString: 'abba',
    runStep: 0,
    init: function( editor ) {
        this.editor = editor;
    },
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
    },
    displayStep: function() {
        $( '#runinput .state' ).removeClass( 'selected' );
        $( $( '#runinput .state' )[ this.runStep ] ).addClass( 'selected' );
    },
    isAccepted: function() {
        for ( var state in nfaview.nfa.currentStates ) {
            if ( nfaview.nfa.accept[ state ] ) {
                return true;
            }
        }
        return false;
    },
    open: function() {
        ol = $( '#runinput' );
        ol.empty();
        for ( var i = 0; i < this.inputString.length; ++i ) {
            ol.append(
                $( '<li class="state">&nbsp;</li>' )
            );
            ol.append(
                $( '<li class="transition">' + this.inputString[ i ] + '</li>' )
            );
        }
        ol.append(
            $( '<li class="state">&nbsp;</li>' )
        );
        $( '.runner' ).show();
    },
    run: function() {
        this.editor.inputSubmit();
        var s = prompt( 'Enter input string: ', this.inputString ) + '';
        for ( var i = 0; i < s.length; ++i ) {
            if ( !( s[ i ] in nfaview.nfa.alphabet ) ) {
                alert( 'Input string must contain only symbols from the alphabet' );
                return false;
            }
        }
        this.inputString = s;
        this.editor.run( this.inputString );
        this.open();
        this.enabled = true;
        this.runStep = 0;
        this.step( 0 )
        return false;
    },
    step: function ( step ) {
        if ( step < 0 ) {
            step = 0;
        }
        if ( step <= this.inputString.length ) {
            var oldStep = this.runStep;
            this.runStep = this.editor.gotoStep( this.inputString, step );

            if ( this.runStep == this.inputString.length ) {
                if ( this.isAccepted() ) {
                    this.displayAcceptedStatus();
                }
                else {
                    this.displayRejectedStatus();
                }
            }
            else {
                if ( oldStep != this.runStep || oldStep == step ) {
                    this.displayRunStatus();
                }
                else {
                    this.displayRejectedStatus();
                }
            }
            this.displayStep();
            this.editor.renderer.requestRendering();
        }
        return false;
    },
    next: function() {
        this.step( this.runStep + 1 );
        return false;
    },
    first: function() {
        this.step( 0 );
        return false;
    },
    previous: function() {
        this.step( this.runStep - 1 );
        return false;
    },
    last: function() {
        this.step( this.inputString.length );
        return false;
    },
    close: function() {
        this.editor.setRun( false );
        $( '.runner' ).hide();
        this.enabled = false;
        this.editor.renderer.requestRendering();
        return false;
    }
};
