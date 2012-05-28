function NFAView( nfa ) {
    var self = this;
    // state -> state view object
    this.states = {};
    this.transitions = {};
    this.viewtransitions = {};
    this.invtransitions = {};
    this.stateName = {};
    this.alphabet = {};
    // state object:
    this.nfa = nfa;
    var j = 200;
    for ( var symbol in nfa.alphabet ){
        self.alphabet[ symbol ] = {
            position: new Vector( j, 400 ),
            importance: 'normal',
            zindex: 0,
            symbol: symbol,
        };
        j += 25;
    }
    this.newtransition = {
        position: new Vector( 0, 0 ),
        importance: 'normal',
        detached: true
    } ;
    this.newtransitionFrom = false;
    function stateAdded( state ) {
        self.states[ state ] = {
            position: new Vector( 0, 0 ),
            importance: 'normal',
            zindex: 0,
            state: state
        };
        self.stateName[ state ] = state;
        self.transitions[ state ] = {};
        self.viewtransitions[ state ] = {};
        self.invtransitions[ state ] = {};
        for ( var to in nfa.states ) {
            self.invtransitions[ state ][ to ] = {};
            self.invtransitions[ to ][ state ] = {};
            self.viewtransitions[ state ][ to ] = [ {
                    position: new Vector( 0, 0 ),
                    importance: 'normal',
                    detached: false
                } ];
            self.viewtransitions[ to ][ state ] = [ {
                    position: new Vector( 0, 0 ),
                    importance: 'normal',
                    detached: false
                } ];
        }

        for ( var sigma in nfa.alphabet ) {
            self.transitions[ state ][ sigma ] = {};
            for ( var to in nfa.transitions[ state ][ sigma ] ) {
                self.invtransitions[ state ][ to ] = {};
                self.invtransitions[ state ][ to ][ sigma ] = sigma;
                self.transitions[ state ][ sigma ][ to ] = [ {
                    position: new Vector( 0, 0 ),
                    importance: 'normal',
                    detached: false
                } ];
            }
        }
        self.transitions[ state ][ '$$' ] = {};
        for  ( var to in nfa.transitions[ state ][ '$$' ] ) {
            self.transitions[ state ][ sigma ][ to ] = [ {
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
        delete self.viewtransitions[ state ];
        for ( var from in nfa.states ) {
            for ( var sigma in self.invtransitions[ from ][ state ] ) {
                delete self.transitions[ from ][ sigma ][ state ];
            }
            delete self.invtransitions[ from ][ state ];
            delete self.viewtransitions[ from ][ state ];
        }
        delete self.invtransitions[ state ];
    } );
    this.nfa.on( 'transitionadded', function( from, via, to ) {
        self.transitions[ from ][ via ][ to ] = {
            position: new Vector( 0, 0 ),
            importance: 'normal',
            detached: false
        };
        self.invtransitions[ from ][ to ][ via ] = via;
    } );
    this.nfa.on( 'transitiondeleted', function( from, via, to ) {
        delete self.transitions[ from ][ via ][ to ];
        delete self.invtransitions[ from ][ to ][ via ];
    } );
}
