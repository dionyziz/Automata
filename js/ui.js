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

// TODO: Encapsulate these into an object
var runStep = 0;
var inputString;

function displayRunStatus() {
    $( '.runtoolbar code' ).html(
          '<span class="seen">'
        + inputString.substr( 0, runStep )
        + '</span>'
        + '<span class="current">'
        + inputString.substr( runStep, 1 )
        + '</span>'
        + inputString.substr( runStep + 1 )
    );
    $( '.runtoolbar .step' ).show();
    $( '.runtoolbar .edit' ).hide();
    $( '#runstatus' ).html( 'Running' );
}
function displayAcceptedStatus() {
    $( '#runstatus' ).html( 'Accepted' );
    $( '#runstatus' ).addClass( 'accept icon' );
    displayRunDone();
}
function displayRejectedStatus() {
    $( '#runstatus' ).html( 'Rejected' );
    $( '#runstatus' ).addClass( 'reject icon' );
    displayRunDone();
}
function displayRunDone() {
    $( '.runtoolbar .step' ).hide();
    $( '.runtoolbar .edit' ).show();
}

$( '.toolbar .run' ).click( function() {
    inputString = prompt( 'Enter input string: ' );
    $( '.runtoolbar' ).show();
    $( '.toolbar' ).hide();
    $( '#runstatus' ).removeClass( 'accept' );
    $( '#runstatus' ).removeClass( 'reject' );
    runStep = 0;
    editor.run( inputString );
    displayRunStatus();
    return false;
} );
$( '.runtoolbar .step' ).click( function() {
    if ( editor.runStep() ) {
        ++runStep;
        displayRunStatus();
        if ( runStep == inputString.length ) {
            var accepting = false;

            for ( var state in nfaview.nfa.currentStates ) {
                if ( nfaview.nfa.accept[ state ] ) {
                    accepting = true;
                    break;
                }
            }
            if ( accepting ) {
                displayAcceptedStatus();
            }
            else {
                displayRejectedStatus();
            }
        }
        else if ( nfaview.nfa.currentStates.length == 0 ) {
            displayRejectedStatus();
        }
    }
    return false;
} );
$( '.runtoolbar .edit' ).click( function() {
    // run the final step
    editor.runStep();
    $( '.runtoolbar' ).hide();
    $( '.toolbar' ).show();
    return false;
} );

var inputSymbol = document.getElementById( 'inputSymbol' );
var errorSymbol = document.getElementById( 'errorSymbol' );
var changeStateName = document.getElementById( 'changeStateName' );
var editor = new NFAEditor( canvas, nfaview, [ inputSymbol, errorSymbol ], changeStateName );
editor.play();
