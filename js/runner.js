var Runner = {
    editor: null,
    enabled: false,
    inputString: '',
    runStep: '',
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
        $( '#runinput .state' ).removeClass( 'selected' );
        $( $( '#runinput .state' )[ this.runStep ] ).addClass( 'selected' );
    },
    displayAcceptanceResult: function() {
        if ( this.runStep == this.inputString.length ) {
            var accepting = false;

            for ( var state in nfaview.nfa.currentStates ) {
                if ( nfaview.nfa.accept[ state ] ) {
                    accepting = true;
                    break;
                }
            }
            if ( accepting ) {
                this.displayAcceptedStatus();
            }
            else {
                this.displayRejectedStatus();
            }
        }
        else if ( nfaview.nfa.currentStates.length == 0 ) {
            this.displayRejectedStatus();
        }
    },
    begin: function() {
        this.runStep = 0;
        this.editor.run( this.inputString );
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

        this.displayRunStatus();
        this.enabled = true;
    },
    run: function() {
        this.editor.inputSubmit();
        this.inputString = prompt( 'Enter input string: ', 'abba' );

        if ( typeof this.inputString != 'string' ) {
            return false;
        }
        for ( var i = 0; i < this.inputString.length; ++i ) {
            if ( !( this.inputString[ i ] in nfaview.nfa.alphabet ) ) {
                return false;
            }
        }

        this.begin();
        return false;
    },
    next: function() {
        ++this.runStep;
        if ( this.runStep > this.inputString.length ) {
            this.runStep = this.inputString.length;
            return false;
        }

        if ( this.editor.runStep() ) {
            this.displayRunStatus();
            this.displayAcceptanceResult();
        }
        else {
            this.displayRejectedStatus();
        }
        return false;
    },
    rewind: function() {
        this.begin();
        return false;
    },
    prev: function() {
        var step = Math.max( 0, this.runStep - 1 );

        this.begin();

        this.runStep = step;

        this.editor.gotoStep( this.inputString, this.runStep );
        this.displayRunStatus();

        return false;
    },
    fastforward: function() {
        this.begin();
        this.runStep = this.inputString.length;
        this.editor.gotoStep( this.inputString, this.runStep );
        this.displayRunStatus();
        this.displayAcceptanceResult();

        return false;
    },
    close: function() {
        this.editor.setRun( false );
        $( '.runner' ).hide();
        this.enabled = false;
        return false;
    }
};
