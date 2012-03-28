var dfa = new DFA( [ 'a', 'b' ] );
var dfaview = new DFAView( dfa );

dfa.addTransition( 1, 'a', 2 );
dfa.addTransition( 2, 'a', 4 );
dfa.addTransition( 2, 'b', 3 );
dfa.addTransition( 3, 'a', 4 );
dfa.addAcceptingState( 3 );
dfaview.states[ 1 ].position = {
    x: 100, y: 100
};
dfaview.states[ 2 ].position = {
    x: 400, y: 100
};
dfaview.states[ 3 ].position = {
    x: 400, y: 400
};
dfaview.states[ 4 ].position = {
    x: 100, y: 400
};
dfaview.states[ 1 ].fillColor = '#eee';
dfaview.states[ 2 ].fillColor = '#eee';
dfaview.states[ 3 ].fillColor = '#eee';
dfaview.states[ 4 ].fillColor = '#eee';

var canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
var renderer = new Renderer( canvas, dfaview );

function mainLoop() {
    renderer.render();
    setTimeout( mainLoop, 17 );
}

var dragging = false;
var maxz = 1;

renderer.on( 'mouseoverstate', function( state ) {
    if ( !dragging ) {
        dfaview.states[ state ].fillColor = 'red';
    }
} );
function stateOut( state ) {
    dfaview.states[ state ].fillColor = '#eee';
}
renderer.on( 'mouseoutstate', stateOut );
renderer.on( 'mousedownstate', function( state, e ) {
    var x = e.clientX;
    var y = e.clientY;
    var sx = dfaview.states[ state ].position.x;
    var sy = dfaview.states[ state ].position.y;

    dragging = true;

    dfaview.states[ state ].zindex = maxz++;

    function move( e ) {
        var dx = e.clientX - x;
        var dy = e.clientY - y;

        dfaview.states[ state ].position = {
            x: sx + dx,
            y: sy + dy
        };
    }
    function up( e ) {
        renderer.removeListener( 'mousemove', move );
        renderer.on( 'mouseoutstate', stateOut );
        dragging = false;
    }
    renderer.on( 'mousemove', move );
    renderer.once( 'mouseup', up );
    renderer.removeListener( 'mouseoutstate', stateOut );
} );
renderer.on( 'clickstate', function( state ) {
} );
renderer.on( 'dblclick', function( e ) {
    dfaview.states[ dfaview.dfa.addState() ].position = {
        x: e.clientX - this.offsetLeft,
        y: e.clientY - this.offsetTop
    };
} );

mainLoop();
