function DFAView( dfa ) {
    var self = this;
    // state number -> state view object
    this.states = [];
    this.transitions = [];
    // state object:
    // position: { x: 10, y: 10 },
    // fillColor: '#fff',
    // strokeColor: '#000'
    this.dfa = dfa;
    this.dfa.on( 'statesincreased', function( oldStates, newStates ) {
        // console.log( 'View observed that states increased from ' + oldStates + ' to ' + newStates );
        for ( var i = oldStates + 1; i <= newStates; ++i ) {
            self.states[ i ] = {
                position: {
                    x: 0,
                    y: 0
                },
                fillColor: '#fff',
                strokeColor: '#000',
                zindex: 0,
                state: i
            };
            self.transitions[ i ] = {};
            for ( var sigma in dfa.alphabet ) {
                self.transitions[ i ][ sigma ] = {
                    position: {
                        x: 0,
                        y: 0
                    }
                };
            }
        }
    } );
}
function Renderer( canvas, dfaview ) {
    var self = this;

    this.canvas = canvas;
    this.ctx = this.canvas.getContext( '2d' );
    this.dfaview = dfaview;
    this.mouseOverElement = [];
    this.offsetLeft = canvas.offsetLeft;
    this.offsetTop = canvas.offsetTop;

    function mouseOut( element, e ) {
        self.emit( 'mouseout' + element[ 0 ], element[ 1 ], e );
    }
    function mouseOver( element, e ) {
        self.emit( 'mouseover' + element[ 0 ], element[ 1 ], e );
    }
    function mouseMove( element, e ) {
        self.emit( 'mousemove' + element[ 0 ], element[ 1 ], e );
    }
    function propagateEvent( evt ) {
        canvas.addEventListener( evt, function( e ) {
            handleMouseMotion.call( this, e );

            if ( self.mouseOverElement != false ) {
                self.emit( evt + self.mouseOverElement[ 0 ], self.mouseOverElement[ 1 ], e );
            }
            self.emit( evt, e );
        } );
    }
    propagateEvent( 'mousedown' );
    propagateEvent( 'mouseup' );
    propagateEvent( 'click' );
    propagateEvent( 'dblclick' );

    function handleMouseMotion( e ) {
        var x = e.clientX - this.offsetLeft;
        var y = e.clientY - this.offsetTop;

        test = renderer.hitTest( x, y );
        if ( test != self.mouseOverElement ) {
            if ( self.mouseOverElement != false ) {
                mouseOut( self.mouseOverElement, e );
            }
            if ( test != false ) {
                mouseOver( test, e );
            }
        }
        if ( test != false ) {
            mouseMove( test, e );
        }
        self.mouseOverElement = test;
        self.emit( 'mousemove', e );
    }

    canvas.addEventListener( 'mousemove', handleMouseMotion );

    EventEmitter.call( this );
};
Renderer.prototype = {
    STATE_RADIUS: 25,
    ARROW_RADIUS: 15,
    ARROW_ANGLE: Math.PI / 6,
    SELF_TRANSITION_RADIUS: 40,
    SELF_TRANSITION_ANGLE: Math.PI / 2,
    constructor: Renderer,
    render: function() {
        this.ctx.clearRect( 0, 0, 800, 800 );
        var dfa = this.dfaview.dfa;
        var alphabetsize = 0;

        for ( var sigma in dfa.alphabet ) {
            ++alphabetsize;
        }
        for ( var i = 1; i <= dfa.numStates; ++i ) {
            var j = 0;
            for ( var sigma in dfa.alphabet ) {
                if ( typeof dfa.transitions[ i ][ sigma ] != 'undefined' ) {
                    this.renderTransition( i, sigma, dfa.transitions[ i ][ sigma ] );
                }
                else {
                    this.renderTransition( i, sigma, 0, j / alphabetsize );
                }
                ++j;
            }
        }
        var states = this.dfaview.states.slice( 1 );
        states.sort( function ( x, y ) {
            return x.zindex - y.zindex;
        } );
        for ( var i = 0; i < dfa.numStates; ++i ) {
            this.renderState(
                i, states[ i ].position,
                states[ i ].strokeColor, states[ i ].fillColor,
                dfa.accept[ states[ i ].i ]
            );
        }
    },
    renderState: function( id, position, foreground, background, accepting ) {
        var ctx = this.ctx;

        var radgrad2 = ctx.createRadialGradient( 0, 0, 0, 0, 0, this.STATE_RADIUS );
        radgrad2.addColorStop( 0, '#fff' );
        radgrad2.addColorStop( 0.9, '#e8ecf0' );
        radgrad2.addColorStop( 0.9, '#fff' );
        radgrad2.addColorStop( 1, '#fff' );

        ctx.save();
        ctx.translate( position.x, position.y );
        ctx.beginPath();
        ctx.arc( 0, 0, this.STATE_RADIUS, 0, 2 * Math.PI, true );
        ctx.strokeStyle = foreground;
        ctx.fillStyle = background;
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba( 0, 0, 0, 0.3 )';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 5;
        ctx.stroke();
        ctx.fillStyle = radgrad2;
        ctx.fill();
        ctx.restore();
    },
    drawArrow: function( from, to ) {
        var ctx = this.ctx;
        var theta = Math.atan2( to.y - from.y, to.x - from.x );

        ctx.beginPath();
        // draw arrow line
        ctx.moveTo( from.x, from.y );
        ctx.save();
        ctx.translate( to.x, to.y );
        ctx.rotate( theta );
        ctx.save();
        ctx.lineTo( 0, 0 );
        ctx.strokeStyle = 'black';
        ctx.stroke();

        this.renderArrowEnd();

        ctx.restore();
        ctx.restore();
    },
    renderArrowEnd: function() {
        var ctx = this.ctx;
        
        // draw arrow head
        var lingrad = ctx.createLinearGradient( 0, 0, 0, 150 );
        lingrad.addColorStop( 0, '#035' );
        lingrad.addColorStop( 0.1, '#048' );

        ctx.beginPath();
        ctx.rotate( this.ARROW_ANGLE );
        ctx.translate( -this.ARROW_RADIUS, 0 );
        ctx.moveTo( 0, 0 );
        ctx.restore();
        ctx.lineTo( 0, 0 );
        ctx.save();
        ctx.rotate( -this.ARROW_ANGLE );
        ctx.translate( -this.ARROW_RADIUS, 0 );
        ctx.lineTo( 0, 0 );
        ctx.restore();
        ctx.save();
        ctx.rotate( Math.PI / 2 );
        ctx.fillStyle = lingrad;
        ctx.fill();
        ctx.closePath();
    },
    renderText: function( location, text ) {
        var ctx = this.ctx;
        var dim = ctx.measureText( text );

        ctx.save();
        ctx.fillStyle = 'black';
        ctx.font = '12pt Verdana';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 6;
        ctx.strokeText( text, location.x - dim.width, location.y + dim.width / 2 );
        ctx.fillText( text, location.x - dim.width, location.y + dim.width / 2 );
        ctx.restore();
    },
    renderTransition: function( from, via, to, angle ) {
        var ctx = this.ctx;
        ctx.save();

        from = this.dfaview.states[ from ];
        if ( to != 0 ) {
            to = this.dfaview.states[ to ];
            angle = Math.atan2( from.position.y - to.position.y, from.position.x - to.position.x );
        }
        var start = {
            x: from.position.x - this.STATE_RADIUS * Math.cos( angle ),
            y: from.position.y - this.STATE_RADIUS * Math.sin( angle )
        };
        if ( to == 0 ) { // no 'to' state is defined
            var end = {
                x: start.x - this.SELF_TRANSITION_RADIUS * Math.cos( angle ),
                y: start.y - this.SELF_TRANSITION_RADIUS * Math.sin( angle )
            };
            var upper = {
                x: start.x - this.SELF_TRANSITION_RADIUS * Math.cos( angle + this.SELF_TRANSITION_ANGLE ) / 2,
                y: start.y - this.SELF_TRANSITION_RADIUS * Math.sin( angle + this.SELF_TRANSITION_ANGLE ) / 2
            };
            var lower = {
                x: start.x - this.SELF_TRANSITION_RADIUS * Math.cos( angle - this.SELF_TRANSITION_ANGLE ) / 2,
                y: start.y - this.SELF_TRANSITION_RADIUS * Math.sin( angle - this.SELF_TRANSITION_ANGLE ) / 2
            };
            ctx.beginPath();
            ctx.moveTo( start.x, start.y );
            ctx.quadraticCurveTo( upper.x, upper.y, end.x, end.y );
            ctx.quadraticCurveTo( lower.x, lower.y, start.x, start.y );
            ctx.strokeStyle = 'black';
            ctx.stroke();
            this.renderText( {
                x: ( start.x + end.x + this.ARROW_RADIUS * Math.cos( this.ARROW_ANGLE ) * Math.cos( angle ) ) / 2,
                y: ( start.y + end.y + this.ARROW_RADIUS * Math.sin( this.ARROW_RADIUS ) * Math.sin( angle ) ) / 2
            }, via );
            return;
        }
        var end = {
            x: to.position.x + this.STATE_RADIUS * Math.cos( angle ),
            y: to.position.y + this.STATE_RADIUS * Math.sin( angle )
        };

        this.drawArrow( start, end );
        this.renderText( {
            x: ( start.x + end.x + this.ARROW_RADIUS * Math.cos( this.ARROW_ANGLE ) * Math.cos( angle ) ) / 2,
            y: ( start.y + end.y + this.ARROW_RADIUS * Math.sin( this.ARROW_RADIUS ) * Math.sin( angle ) ) / 2
        }, via );
        
        ctx.restore();
    },
    hitTest: function( x, y ) {
        // check if the user is hovering a state
        var dfaview = this.dfaview;
        var dfa = dfaview.dfa;
        var test = false;

        for ( var i = 1; i <= dfa.numStates; ++i ) {
            test = this.hitTestState( x, y, i, dfaview.states[ i ].position );
            if ( test ) {
                return [ 'state', i ];
            }
        }
        for ( var i = 1; i <= dfa.numStates; ++i ) {
            var j = 0;
            for ( var sigma in dfa.alphabet ) {
                if ( typeof dfa.transitions[ i ][ sigma ] != 'undefined' ) {
                    test = this.hitTestTransition(
                        x, y, dfaview.states[ i ].position, sigma, dfaview.states[ dfa.transitions[ i ][ sigma ] ].position
                    );
                    if ( test ) {
                        return [ 'transition', [ i, sigma ] ];
                    }
                }
                else {
                    /*
                    this.hitTestTransition(
                        x, y, dfaview.states[ i ].position, sigma, 0, j / alphabetsize
                    );
                    */
                }
                ++j;
            }
        }
        return false;
    },
    hitTestState: function( x, y, id, position ) {
        var dx = x - position.x;
        var dy = y - position.y;

        if ( dx * dx + dy * dy < this.STATE_RADIUS * this.STATE_RADIUS ) {
            return true;
        }
    },
    hitTestTransition: function( x, y, from, via, to, percentage ) {
        var theta = Math.atan2( to.y - from.y, to.x - from.x );

        var arrowheadx = to.x - this.STATE_RADIUS * Math.cos( theta );
        var arrowheady = to.y - this.STATE_RADIUS * Math.sin( theta );

        var dx = arrowheadx - x;
        var dy = arrowheady - y;

        if ( dx * dx + dy * dy < this.ARROW_RADIUS * this.ARROW_RADIUS ) {
            return true;
        }
    }
};
Renderer.extend( EventEmitter );
