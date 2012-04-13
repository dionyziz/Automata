function NFAView( nfa ) {
    var self = this;
    // state -> state view object
    this.states = {};
    this.transitions = {};
    // state object:
    this.nfa = nfa;
    function stateAdded( state ) {
        self.states[ state ] = {
            position: new Vector( 0, 0 ),
            importance: 'normal',
            zindex: 0,
            state: state
        };
        self.transitions[ state ] = {};
        for ( var sigma in dfa.alphabet ) {
            self.transitions[ state ][ sigma ] = [ {
                position: new Vector( 0, 0 ),
                importance: 'normal',
                detached: false
            } ];
        }
    }
    this.nfa.on( 'stateadded', stateAdded );
    for ( var state in nfa.states ) {
        stateAdded( state );
    }
    this.nfa.on( 'statedeleted', function( state ) {
        delete self.states[ state ];
        delete self.transitions[ state ];
    } );
    this.nfa.on( 'transitionadded', function( from, via, to ) {
        self.transitions[ from ][ via ].push( {
            position: new Vector( 0, 0 ),
            importance: 'normal',
            detached: false
        } );
    } );
    this.nfa.on( 'transitiondeleted', function( from, via, to ) {
    } );
}
