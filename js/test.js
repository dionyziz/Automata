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
dfaview.states[ 's' ].position = {
    x: 100, y: 100
};
dfaview.states[ 'p' ].position = {
    x: 400, y: 100
};
dfaview.states[ 'q' ].position = {
    x: 400, y: 400
};
dfaview.states[ 't' ].position = {
    x: 100, y: 400
};
dfaview.transitions[ 'p' ][ 'b' ].importance = 'emphasis';

var canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
var editor = new Editor( canvas, dfaview );
editor.play();
