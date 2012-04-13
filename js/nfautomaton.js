function DFA( alphabet ) {
    // flip alphabet
    this.alphabet = {};
    this.transitions = {
        s: {}
    };
    for ( var i = 0; i < alphabet.length; ++i ) {
        this.alphabet[ alphabet[ i ] ] = true;
        this.transitions[ 's' ][ alphabet[ i ] ] = 's';
    }
    // array from state to dictionary from alphabet symbol to state
    this.numStates = 1;
    this.states = {
        's': true
    };
    this.startState = 's';
    // set of states that accept, array of state keys
    this.accept = [];
    this.reset();
    EventEmitter.call( this );
}

DFA.prototype = {
    constructor: DFA,
    addTransition: function( from, via, to ) {
        assert( typeof this.alphabet[ via ] != 'undefined' );
        assert( typeof this.states[ from ] != 'undefined' );
        assert( typeof this.states[ to ] != 'undefined' );
        this.transitions[ from ][ via ] = to;

        this.emit( 'transitionadded', from, via, to );
    },
    addState: function( state ) {
        this.states[ state ] = true;
        this.transitions[ state ] = {};
        for ( var sigma in this.alphabet ) {
            this.transitions[ state ][ sigma ] = state;
        }
        ++this.numStates;
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
                var to = this.transitions[ from ][ via ];
                if ( to == state ) {
                    // fix transitions that were going to the
                    // delete state to point to self-transitions
                    this.transitions[ from ][ via ] = from;
                }
            }
        }
        delete this.transitions[ state ];
        delete this.states[ state ];
        this.emit( 'statedeleted', state );
        --this.numStates;

        return this.numStates;
    },
    removeAcceptingState: function( state ) {
        assert( typeof this.states[ state ] != 'undefined' );
        this.accept[ state ] = false;
    },
    reset: function() {
        assert( this.numStates > 0 );
        assert( typeof this.states[ this.startState ] != 'undefined' );
        this.currentState = this.startState;
    },
    run: function( input ) {
        this.reset();

        while ( input.length ) {
            this.next( input[ 0 ] );
            input = input.substr( 1 );
        }

        return this.accept[ this.currentState ];
    },
    next: function( symbol ) {
        var nextState = this.transitions[ this.currentState ][ symbol ];

        if ( typeof nextState == 'undefined' ) {
            throw 'Undefined transition from state ' + this._currentState + ' via symbol ' + symbol;
        }
        this.currentState = nextState;
    }
};
DFA.extend( EventEmitter );
