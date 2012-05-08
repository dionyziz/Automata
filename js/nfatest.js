var nfa = new NFA( [ 'a', 'b', 'c', 'd' ] );
var nfaview = new NFAView( nfa );

nfa.addState( 'p' );
nfa.addState( 'q' );
nfa.addState( 't' );
nfa.addTransition( 's', 'b', 's' );
nfa.addTransition( 's', 'a', 'p' );
nfa.addTransition( 'p', 'b', 'q' );
nfa.addTransition( 'q', 'a', 't' );
nfa.addTransition( 'q', 'a', 's' );
nfa.addAcceptingState( 't' );
nfaview.states[ 's' ].position = new Vector( 100, 100 );
nfaview.states[ 'p' ].position = new Vector( 400, 100 );
nfaview.states[ 'q' ].position = new Vector( 400, 300 );
nfaview.states[ 't' ].position = new Vector( 100, 300 );

var canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
var editor = new NFAEditor( canvas, nfaview );
editor.play();
