function DFA( alphabet ) {
    // each state is an int from 1 up to .numStates
    this.numStates = 0;
    // flip alphabet
    this.alphabet = {};
    for ( var i = 0; i < alphabet.length; ++i ) {
        this.alphabet[ alphabet[ i ] ] = true;
    }
    // array from state to dictionary from alphabet symbol to state
    this.transitions = [];
    this.currentState = this.startState = 1;
    // set of states that accept, array from state to true/false
    this.accept = [];
    EventEmitter.call( this );
}

DFA.prototype = {
    constructor: DFA,
    addTransition: function( from, via, to ) {
        assert( typeof this.alphabet[ via ] != 'undefined' );
        this.increaseStatesTo( from );
        this.increaseStatesTo( to );
        this.transitions[ from ][ via ] = to;
    },
    increaseStatesTo: function( numStates ) {
        for ( var i = this.numStates + 1; i <= numStates; ++i ) {
            this.accept[ i ] = false;
            this.transitions[ i ] = {};
        }
        if ( numStates > this.numStates ) {
            console.log( 'Increasing automaton states to ' + numStates );
            this.emit( 'statesincreased', this.numStates, numStates );
            this.numStates = numStates;
        }
    },
    addState: function() {
        this.increaseStatesTo( this.numStates + 1 );
        return this.numStates;
    },
    addAcceptingState: function( state ) {
        this.increaseStatesTo( state );
        this.accept[ state ] = true;
    },
    removeAcceptingState: function( state ) {
        this.increaseStatesTo( state );
        this.accept[ state ] = false;
    },
    reset: function() {
        assert( this.numStates );
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
