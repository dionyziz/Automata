function NFA( alphabet ) {
    // flip alphabet
    this.alphabet = {
        'ε': true
    };
    this.transitions = {
        s: {
           'ε': {},
           '$$' : {}
        }
    };
    this.transitionsNum = {
        s: 0
    };

    for ( var i = 0; i < alphabet.length; ++i ) {
        this.alphabet[ alphabet[ i ] ] = true;
        this.transitions[ 's' ][ alphabet[ i ] ] = {};
    }
    // array from state to dictionary from alphabet symbol to state
    this.numStates = 1;
    this.nextNumState = 1;
    this.states = {
        's': true
    };
    this.startState = 's';
    // set of states that accept, array of state keys
    this.accept = {};
    this.input = '';
    this.reset();
    EventEmitter.call( this );
}

NFA.prototype = {
    constructor: NFA,
    addSymbol: function( sigma ) {
        this.alphabet[ sigma ] = true;
        for ( var state in this.states ) {
            this.transitions[ state ][ sigma ] = {};
        }

        this.emit( 'symboladded', sigma );
    },
    addTransition: function( from, via, to ) {
        if ( via != '$$' ) {
            if ( via.length > 1 ) {
                return false;
            }
            if ( typeof this.alphabet[ via ] == 'undefined' ) {
                this.addSymbol( via );
            }
        }
        assert( typeof this.states[ from ] != 'undefined' );
        assert( typeof this.states[ to ] != 'undefined' );
        this.transitions[ from ][ via ][ to ] = to;
        ++this.transitionsNum[ from ];

        this.emit( 'transitionadded', from, via, to );

        return true;
    },
    deleteTransition: function( from, via, to ) {
        if ( via != '$$' ) {
            assert( typeof this.alphabet[ via ] != 'undefined' );
        }
        assert( typeof this.states[ from ] != 'undefined' );
        assert( typeof this.states[ to ] != 'undefined' );
        if ( to in this.transitions[ from ][ via ] ){
            delete this.transitions[ from ][ via ][ to ];
        }
        ++this.transitionsNum[ from ];

        this.emit( 'transitiondeleted', from, via, to );
    },
    addState: function( state ) {
        this.states[ state ] = true;
        this.transitions[ state ] = {};
        this.transitionsNum[ state ] = 0
        for ( var sigma in this.alphabet ) {
            this.transitions[ state ][ sigma ] = {};
        }

        this.transitions[ state ][ '$$' ] = {};

        ++this.numStates;
        ++this.nextNumState;
        this.emit( 'stateadded', state );

        return this.numStates;
    },
    addAcceptingState: function( state ) {
        assert( typeof this.states[ state ] != 'undefined' );
        this.accept[ state ] = true;
    },
    deleteState: function( state ) {
        this.emit( 'beforestatedeleted', state );
        for ( from in this.transitions ) {
            for ( via in this.transitions[ from ] ) {
                if ( state in this.transitions[ from ][ via ] ) {
                    delete this.transitions[ from ][ via ][ state ];
                }
            }
        }
        delete this.transitions[ state ];
        delete this.transitionsNum[ state ];
        delete this.states[ state ];
        this.emit( 'statedeleted', state );
        --this.numStates;

        if ( this.numStates == 0 ) {
            this.nextNumState = 0;
            this.accept = {};
            this.startState = 'q_0';
        }

        return this.numStates;
    },
    removeAcceptingState: function( state ) {
        assert( typeof this.states[ state ] != 'undefined' );
        this.accept[ state ] = false;
    },
    reset: function() {
        assert( this.numStates > 0 );
        assert( typeof this.states[ this.startState ] != 'undefined' );
        this.currentStates = {};
        this.currentStates[ this.startState ] = this.startState;
        if ( this.states[ this.startState ] ) {
            this.epsilonClose();
        }
    },
    run: function( input ) {
        // To run the NFA do BFS to the tree that will be produced by NFA
        this.reset();

        if ( this.states[ this.startState ] ) {
            while ( input.length
                 && this.currentStates.length ) {
                this.next( input[ 0 ] );
                input = input.substr( 1 );
            }

            for ( var finalState in this.currentStates ) {
                if ( this.accept[ finalState ] ) {
                    return true;
                }
            }
        }

        return false;
    },
    next: function( symbol ) {
        var nextLevelStates = {};

        this.emit( 'removeprevstep' );
        for ( state in this.currentStates ){
            if ( typeof this.transitions[ state ][ symbol ] != 'undefined' ) {
                for ( var to in this.transitions[ state ][ symbol ] ){
                    nextLevelStates[ to ] = to;
                    this.emit( 'addusedtransition', state, to, symbol );
                }
            }
        }

        this.currentStates = nextLevelStates;
        this.epsilonClose();
    },
    epsilonClose: function() {
        var changeFlag = false;

        do {
            changeFlag = false;
            for ( var state in this.currentStates ) {
                for ( var to in this.transitions[ state ][ 'ε' ] ) {
                    if ( !( to in this.currentStates ) ) {
                        changeFlag = true;
                        this.currentStates[ to ] = to;
                        this.emit( 'addusedtransition', state, to, 'ε' );
                    }
                }
            }
        } while ( changeFlag );
    },
    nextStepByStep: function() {
        // function for the step by step running
        if ( ( this.input.length > 0 ) && ( this.states[ this.startState ] ) ) {
            this.next( this.input[ 0 ] );
            this.input = this.input.substr( 1 );

            for ( var i in this.currentStates ) {
                return true;
            }
            return false;
        }
        return false;
    },
    gotoStep: function( step ) {
        this.reset();
        this.emit( 'removeprevstep' );
        for ( var i = 0; i < step; ++i ) {
            this.nextStepByStep();
        }
    },
    serialize: function() {
        return JSON.stringify( {
            states: this.states,
            transitions: this.transitions,
            accept: this.accept,
            startState: this.startState,
            transitionsNum: this.transitionsNum,
            alphabet: this.alphabet,
            nextNumState: this.nextNumState,
            numStates: this.numStates
        } );
    },
    deserialize: function( source ) {
        console.log( 'Deserializing NFA' );

        source = JSON.parse( source );
        for ( var attr in source ) {
            this[ attr ] = source[ attr ];
        }
    }
};
NFA.inherit( EventEmitter );
