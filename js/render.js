function DFAView( dfa ) {
    var self = this;
    // state -> state view object
    this.states = {};
    this.transitions = {};
    // state object:
    // position: { x: 10, y: 10 },
    // fillColor: '#fff',
    // strokeColor: '#000'
    this.dfa = dfa;
    function stateAdded( state ) {
        // console.log( 'View observed that states increased from ' + oldStates + ' to ' + newStates );
        self.states[ state ] = {
            position: {
                x: 0,
                y: 0
            },
            importance: 'normal',
            zindex: 0,
            state: state
        };
        self.transitions[ state ] = {};
        for ( var sigma in dfa.alphabet ) {
            self.transitions[ state ][ sigma ] = {
                position: {
                    x: 0,
                    y: 0
                }
            };
        }
    }
    this.dfa.on( 'stateadded', stateAdded );
    for ( var state in dfa.states ) {
        stateAdded( state );
    }
    this.dfa.on( 'statedeleted', function( state ) {
        delete self.states[ state ];
        delete self.transitions[ state ];
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
            else {
                self.emit( evt + 'void', e );
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

        test = self.hitTest( x, y );
        if ( test[ 0 ] != self.mouseOverElement[ 0 ]
          && test[ 1 ] != self.mouseOverElement[ 1 ] ) {
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
    dfaview.dfa.on( 'beforestatedeleted', function( state ) {
        if ( self.mouseOverElement[ 0 ] == 'state' ) {
            if ( self.mouseOverElement[ 1 ] == state ) {
                mouseOut( self.mouseOverElement, false );
                self.mouseOverElement = false;
            }
        }
    } );

    canvas.addEventListener( 'mousemove', handleMouseMotion );

    EventEmitter.call( this );
};
Renderer.prototype = {
    STATE_RADIUS: 25,
    ARROW_RADIUS: 15,
    ARROW_ANGLE: Math.PI / 6,
    SELF_TRANSITION_RADIUS: 20,
    constructor: Renderer,
    render: function() {
        this.ctx.clearRect( 0, 0, 800, 800 );
        var dfa = this.dfaview.dfa;
        var alphabetsize = 0;
        var stateArray = [];

        for ( var sigma in dfa.alphabet ) {
            ++alphabetsize;
        }
        for ( var state in dfa.states ) {
            var j = 0;
            for ( var sigma in dfa.alphabet ) {
                if ( typeof dfa.transitions[ state ][ sigma ] != 'undefined' ) {
                    this.renderTransition( state, sigma, dfa.transitions[ state ][ sigma ] );
                }
                else {
                    this.renderTransition( state, sigma, null, j / alphabetsize );
                }
                ++j;
            }
            stateArray.push( this.dfaview.states[ state ] );
        }
        stateArray.sort( function ( x, y ) {
            return x.zindex - y.zindex;
        } );
        for ( var i = 0; i < dfa.numStates; ++i ) {
            this.renderState(
                stateArray[ i ].state, stateArray[ i ].position,
                stateArray[ i ].importance,
                dfa.accept[ stateArray[ i ].state ]
            );
        }
    },
    renderState: function( state, position, importance, accepting ) {
        var ctx = this.ctx;
        var radgrad = ctx.createRadialGradient( 0, 0, 0, 0, 0, this.STATE_RADIUS );

        ctx.save();
        radgrad.addColorStop( 0, '#fff' );
        radgrad.addColorStop( 0.8, '#e8ecf0' );
        radgrad.addColorStop( 1, '#fff' );
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba( 0, 0, 0, 0.3 )';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 5;
        switch ( importance ) {
            case 'normal':
                break;
            case 'strong':
                ctx.shadowColor = '#7985b1';
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#3297fd';
                break;
            case 'emphasis':
                ctx.shadowColor = '#7985b1';
                ctx.shadowBlur = 15;
                break;
        }

        // TODO: Dislpay state name
        ctx.translate( position.x, position.y );
        ctx.beginPath();
        ctx.arc( 0, 0, this.STATE_RADIUS, 0, 2 * Math.PI, true );
        ctx.stroke();
        ctx.fillStyle = radgrad;
        ctx.fill();
        ctx.restore();
    },
    renderArrow: function( from, to ) {
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
        
        ctx.save();
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
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
        ctx.restore();
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
        else {
            angle *= 2 * Math.PI;
        }
        var start = {
            x: from.position.x - this.STATE_RADIUS * Math.cos( angle ),
            y: from.position.y - this.STATE_RADIUS * Math.sin( angle )
        };
        if ( to == 0 ) { // no 'to' state is defined
            var center = {
                x: start.x - ( 2 / 4 ) * this.SELF_TRANSITION_RADIUS * Math.cos( angle ),
                y: start.y - ( 2 / 4 ) * this.SELF_TRANSITION_RADIUS * Math.sin( angle )
            };
            ctx.beginPath();
            ctx.arc( center.x, center.y, this.SELF_TRANSITION_RADIUS, 0, 2 * Math.PI, false );
            ctx.strokeStyle = 'black';
            ctx.stroke();
            /*
             * We need to determine the two points of intersection of the two circles
             * The state circle and the self-transition circle, so as to draw the arrow
             * head for the self-transition. We'll draw it to point to one of the two
             * intersection points at the correct angle.
             *
             * We're looking for a solution to the system of equations:
             * r1^2 = h^2 + d1^2
             * r2^2 = h^2 + d2^2
             * d1 + d2 = D
             * solving for unknowns h, d1, d2 and known r1, r2, D
             * where r1 is the radius of the self-transition
             *       r2 is the radius of the state
             *       D is the distance between the state center and self-transition center
             *       d1 is the distance from the self-transition center to
             *       the middle between the two points of intersection of the two circles
             *       on the line that connect them
             *       and +-h gives the high of the point at a distance perpendicular
             *       to the line that connects the two centers
             *       http://www.wolframalpha.com/input/?i=solve+for+d1%2C+d2%2C+h%3A+%7B+r1%5E2+%3D+h%5E2+%2B+d1%5E2%2C+r2%5E2+%3D+h%5E2+%2B+d2%5E2%2C+d1+%2B+d2+%3D+D+%7D
             */
            var dx = from.position.x - center.x;
            var dy = from.position.y - center.y;
            var D = Math.sqrt( dx * dx + dy * dy );
            var r1 = this.SELF_TRANSITION_RADIUS;
            var r2 = this.STATE_RADIUS;
            var d2 = ( D * D - r1 * r1 + r2 * r2 ) / ( 2 * D );
            var d1 = ( D * D - r2 * r2 + r1 * r1 ) / ( 2 * D );
            var k = D * D + r1 * r1 - r2 * r2;
            var h = Math.sqrt( r1 * r1 - k * k / ( 4 * D * D ) );
            var intersect = {
                x: center.x + d1 * Math.cos( angle ) - h * Math.sin( angle ),
                y: center.y + d1 * Math.sin( angle ) + h * Math.cos( angle )
            };

            // the arrowtheta is evaluated at the intersection point
            // we need to subtract a small amount (Math.PI / 10) to make
            // it tangent at the point of the center of the arrow head, not at the point
            // where the arrow points to
            var arrowtheta = Math.atan2( intersect.x - center.x, intersect.y - center.y ) - Math.PI / 8;

            ctx.save();
            ctx.translate( intersect.x, intersect.y );
            ctx.rotate( -arrowtheta );
            this.renderArrowEnd();
            ctx.restore();

            this.renderText( {
                x: center.x - this.SELF_TRANSITION_RADIUS * Math.cos( angle ),
                y: center.y - this.SELF_TRANSITION_RADIUS * Math.sin( angle )
            }, via );

            return;
        }
        var end = {
            x: to.position.x + this.STATE_RADIUS * Math.cos( angle ),
            y: to.position.y + this.STATE_RADIUS * Math.sin( angle )
        };

        this.renderArrow( start, end );
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

        for ( var state in this.dfaview.states ) {
            test = this.hitTestState( x, y, state, dfaview.states[ state ].position );
            if ( test ) {
                return [ 'state', state ];
            }
        }
        for ( var state in this.dfaview.states ) {
            var j = 0;
            for ( var sigma in dfa.alphabet ) {
                if ( typeof dfa.transitions[ state ][ sigma ] != 'undefined' ) {
                    test = this.hitTestTransition(
                        x, y, dfaview.states[ state ].position, sigma, dfaview.states[ dfa.transitions[ state ][ sigma ] ].position
                    );
                    if ( test ) {
                        return [ 'transition', [ state, sigma ] ];
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
    hitTestState: function( x, y, state, position ) {
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
