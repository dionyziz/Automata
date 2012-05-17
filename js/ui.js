var canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
var ctx = canvas.getContext( '2d' );
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight - 39;

window.onresize = resizeCanvas;
document.onselectstart = function() {
    return false;
};

function resizeCanvas() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight - 39;
};

$( '.toolbar .move' ).click( function() {
    $( '.toolbar li' ).removeClass( 'selected' );
    $( this ).addClass( 'selected' );
    editor.setMode( 'moveState' );
    return false;
} );
$( '.toolbar .transition' ).click( function() {
    $( '.toolbar li' ).removeClass( 'selected' );
    $( this ).addClass( 'selected' );
    editor.setMode( 'createTransition' );
    return false;
} );

var editor = new NFAEditor( canvas, nfaview );
editor.play();
