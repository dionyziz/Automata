var canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
var ctx = canvas.getContext( '2d' );
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight - 39;
var editor = new NFAEditor( canvas, nfaview );
editor.play();
