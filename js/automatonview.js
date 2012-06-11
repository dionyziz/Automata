function NFAView( nfa ) {
    var self = this;
    // state -> state view object
    this.states = {};
    this.transitions = {};
    this.viewtransitions = {};
    this.invtransitions = {};
    this.stateName = {};
    // state object:
    this.nfa = nfa;
    this.newtransition = {
        position: new Vector( 0, 0 ),
        importance: 'normal',
        detached: true,
        usedInRun: false,
    };
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
            self.viewtransitions[ state ][ to ] = {
                position: new Vector( 0, 0 ),
                importance: 'normal',
                detached: false,
                usedInRun: false,
            };
            self.viewtransitions[ to ][ state ] = {
                position: new Vector( 0, 0 ),
                importance: 'normal',
                detached: false,
                usedInRun: false
            };
        }

        for ( var sigma in nfa.alphabet ) {
            self.transitions[ state ][ sigma ] = {};
            for ( var to in nfa.transitions[ state ][ sigma ] ) {
                self.invtransitions[ state ][ to ] = {};
                self.invtransitions[ state ][ to ][ sigma ] = sigma;
                self.transitions[ state ][ sigma ][ to ] = [ {
                    position: new Vector( 0, 0 ),
                    importance: 'normal',
                    detached: false,
                    usedInRun: false
                } ];
            }
        }
        self.transitions[ state ][ '$$' ] = {};
        for  ( var to in nfa.transitions[ state ][ '$$' ] ) {
            self.transitions[ state ][ sigma ][ to ] = [ {
                position: new Vector( 0, 0 ),
                importance: 'normal',
                detached: false,
                usedInRun: false
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
            detached: false,
            usedInRun: false
        };
        self.invtransitions[ from ][ to ][ via ] = via;
    } );
    this.nfa.on( 'transitiondeleted', function( from, via, to ) {
        delete self.transitions[ from ][ via ][ to ];
        delete self.invtransitions[ from ][ to ][ via ];
    } );
    this.nfa.on( 'symboladded' , function( sigma ) {
        for ( var state in nfa.states ) {
            self.transitions[ state ][ sigma ] = {};
        }
    } );
    this.nfa.on( 'removeprevstep', function() {
        for ( var from in nfa.states ) {
            for ( var to in nfa.states ) {
                self.viewtransitions[ from ][ to ].usedInRun = false;
            }
        }
    } );
    this.nfa.on( 'addusedtransition', function( from, to, symbol ) {
        if ( self.viewtransitions[ from ][ to ].usedInRun == false ){
            self.viewtransitions[ from ][ to ].usedInRun = symbol;
        }
        else {
            self.viewtransitions[ from ][ to ].usedInRun = symbol;
        }
    } );
}
NFAView.prototype = {
    constructor: NFAView,
    serialize: function() {
        return JSON.stringify( {
            states: this.states,
            transitions: this.transitions,
            viewtransitions: this.viewtransitions,
            invtransitions: this.invtransitions,
            stateName: this.stateName,
            nfa: this.nfa.serialize()
        } );
    },
    deserialize: function( source ) {
        console.log( 'Deserializing NFAView' );
        source = JSON.parse( source );
        for ( var attr in source ) {
            switch( attr ) {
                case 'nfa':
                    this.nfa.deserialize( source[ attr ] );
                    break;
                default:
                    this[ attr ] = source[ attr ];
                    break;
            }
        }

        for ( var from in this.nfa.states ) {
            var r1 = this.states[ from ].position;

            this.states[ from ].position = new Vector( r1.x, r1.y );

            for ( var to in this.nfa.states ) {
                var r2 = this.viewtransitions[ from ][ to ].position;

                this.viewtransitions[ from ][ to ].position = new Vector( r2.x, r2.y );
                this.viewtransitions[ from ][ to ].usedInRun = false;

                for ( var sigma in this.nfa.alphabet ) {
                    if ( typeof this.transitions[ from ][ sigma ][ to ] != 'undefined' ) {
                        var r3 = this.transitions[ from ][ sigma ][ to ].position;

                        this.transitions[ from ][ sigma ][ to ].position = new Vector( r3.x, r3.y );
                        this.transitions[ from ][ sigma ][ to ].usedInRun = false;
                    }
                }
            }
        }
    }
};
