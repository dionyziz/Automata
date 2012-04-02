var dfa = new DFA( [ 'a', 'b' ] );
var dfaview = new DFAView( dfa );

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

var canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
var editor = new Editor( canvas, dfaview );
editor.play();
