var dfa = new DFA( [ 'a', 'b' ] );
//var nfa = new NFA( [ 'a', 'b' ] );
var dfaview = new DFAView( dfa );
//var nfaview = new NFAView( nfa );

dfa.addState( 'p' );
dfa.addState( 'q' );
dfa.addState( 't' );
dfa.addTransition( 's', 'b', 's' );
dfa.addTransition( 's', 'a', 'p' );
dfa.addTransition( 'p', 'b', 'q' );
dfa.addTransition( 'q', 'a', 't' );
dfa.addAcceptingState( 't' );
dfaview.states[ 's' ].position = new Vector( 100, 100 );
dfaview.states[ 'p' ].position = new Vector( 400, 100 );
dfaview.states[ 'q' ].position = new Vector( 400, 400 );
dfaview.states[ 't' ].position = new Vector( 100, 400 );

// nfa.addState( 'p' );
// nfa.addState( 'q' );
// nfa.addState( 't' );
// nfa.addTransition( 's', 'b', 's' );
// nfa.addTransition( 's', 'a', 'p' );
// nfa.addTransition( 'p', 'b', 'q' );
// nfa.addTransition( 'q', 'a', 't' );
// nfa.addAcceptingState( 't' );
// nfaview.states[ 's' ].position = new Vector( 100, 100 );
// nfaview.states[ 'p' ].position = new Vector( 400, 100 );
// nfaview.states[ 'q' ].position = new Vector( 400, 400 );
// nfaview.states[ 't' ].position = new Vector( 100, 400 );

var canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
var editor = new Editor( canvas, dfaview );
editor.play();
