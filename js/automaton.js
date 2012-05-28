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
    this.transitionsnum = {
        s: 0
    };

    for ( var i = 0; i < alphabet.length; ++i ) {
        this.alphabet[ alphabet[ i ] ] = true;
        this.transitions[ 's' ][ alphabet[ i ] ] = {};
    }
    // array from state to dictionary from alphabet symbol to state
    this.numStates = 1;
    this.nextnumState = 2;
    this.states = {
        's': true
    };
    this.startState = 's';
    // set of states that accept, array of state keys
    this.accept = [];
    this.input = '';
    this.reset();
    EventEmitter.call( this );
}

NFA.prototype = {
    constructor: NFA,
    addTransition: function( from, via, to ) {
        if ( via != '$$' ) {
            if ( typeof this.alphabet[ via ] == 'undefined' ) {
                return false;
            }
        }
        assert( typeof this.states[ from ] != 'undefined' );
        assert( typeof this.states[ to ] != 'undefined' );
        this.transitions[ from ][ via ][ to ] = to;
        ++this.transitionsnum[ from ];

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
        ++this.transitionsnum[ from ];

        this.emit( 'transitiondeleted', from, via, to );
    },
    addState: function( state ) {
        this.states[ state ] = true;
        this.transitions[ state ] = {};
        this.transitionsnum[ state ] = 0
        for ( var sigma in this.alphabet ) {
            this.transitions[ state ][ sigma ] = {};
        }

        this.transitions[ state ][ '$$' ] = {};

        ++this.numStates;
        ++this.nextnumState;
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
        delete this.transitionsnum[ state ];
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
        this.currentStates = {};
        this.currentStates[ this.startState ] = this.startState;
        this.epsilonClose();
    },
    run: function( input ) {
        // To run the NFA do BFS to the tree that will be produced by NFA
        this.reset();

        while (     input.length
                &&  this.currentStates.length ) {
            this.next( input[ 0 ] );
            input = input.substr( 1 );
        }

        for ( finalstate in this.currentStates ) {
            if ( this.accept[ finalstate ] ) {
                return true;
            }
        }

        return false;
    },
    next: function( symbol ) {
        var nextLevelStates = {};

        for ( state in this.currentStates ){
            if ( typeof this.transitions[ state ][ symbol ] != 'undefined' ) {
                // throw 'Undefined transition from state ' + state + ' via symbol ' + symbol;

                for ( var to in this.transitions[ state ][ symbol ] ){
                    nextLevelStates[ to ] = to;
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
                    if ( ! ( to in this.currentStates ) ) {
                        changeFlag = true;
                        this.currentStates[ to ] = to;
                    }
                }
            }
        } while( changeFlag );
    },
    nextStepByStep: function() {
        if ( this.input.length > 0 ) {
            this.next( this.input[ 0 ] );
            this.input = this.input.substr( 1 );
            return true;
        }
        else {
            return false;
        }
    }
};
NFA.extend( EventEmitter );
