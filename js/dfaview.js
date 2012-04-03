function DFAView( dfa ) {
    var self = this;
    // state -> state view object
    this.states = {};
    this.transitions = {};
    // state object:
    this.dfa = dfa;
    function stateAdded( state ) {
        self.states[ state ] = {
            position: new Vector( 0, 0 ),
            importance: 'normal',
            zindex: 0,
            state: state
        };
        self.transitions[ state ] = {};
        for ( var sigma in dfa.alphabet ) {
            self.transitions[ state ][ sigma ] = {
                position: new Vector( 0, 0 ),
                importance: 'normal',
                detached: false
            };
        }
    }
    this.dfa.on( 'stateadded', stateAdded );
    for ( var state in dfa.states ) {
        stateAdded( state );
    }
    this.dfa.on( 'statedeleted', function( state ) {
        delete self.states[ state ];
        delete self.transitions[ state ];
    } );
    this.dfa.on( 'transitionadded', function( from, via, to ) {
        self.transitions[ from ][ via ] = {
            position: new Vector( 0, 0 ),
            importance: 'normal',
            detached: false
        };
    } );
}
