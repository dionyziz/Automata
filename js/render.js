function DFAView( dfa ) {
    var self = this;
    // state -> state view object
    this.states = {};
    this.transitions = {};
    // state object:
    this.dfa = dfa;
    function stateAdded( state ) {
        self.states[ state ] = {
            position: new Vector( 0, 0 ),
            importance: 'normal',
            zindex: 0,
            state: state
        };
        self.transitions[ state ] = {};
        for ( var sigma in dfa.alphabet ) {
            self.transitions[ state ][ sigma ] = {
                position: new Vector( 0, 0 ),
                importance: 'normal',
                detached: false
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
    this.dfa.on( 'transitionadded', function( from, via, to ) {
        self.transitions[ from ][ via ] = {
            position: new Vector( 0, 0 ),
            importance: 'normal',
            detached: false
        };
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

        test = self.hitTest( new Vector( x, y ) );
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
                this.renderTransition( state, sigma, dfa.transitions[ state ][ sigma ], j / alphabetsize );
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

        // TODO: Display state name
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
    moveAtAngle: function( location, radius, angle ) {
        return {
            x: location.x + radius * Math.cos( angle ),
            y: location.y + radius * Math.sin( angle )
        };
    },
    renderTransition: function( from, via, to, angle ) {
        var strokeStyle = 'black';
        var ctx = this.ctx;
        var transitionView = this.dfaview.transitions[ from ][ via ];
        var start, end, target;
        var circular = false;

        ctx.save();
        ctx.fillStyle = ctx.strokeStyle = 'black';
        switch ( transitionView.importance ) {
            case 'normal':
                break;
            case 'strong': // used for selection in the editor
                ctx.fillStyle = ctx.strokeStyle = '#3297fd';
                break;
            case 'emphasis': // used for mouseover in the editor
                ctx.shadowColor = '#7985b1';
                ctx.shadowBlur = 15;
                // ctx.strokeStyle = 'red';
                break;
        }

        from = this.dfaview.states[ from ];
        if ( transitionView.detached ) {
            target = transitionView.position;
        }
        else {
            to = this.dfaview.states[ to ];
            target = to.position;
            circular = to.state == from.state;
        }
        if ( circular ) {
            // TODO: devise a deterministic algorithm for aligning transitions
            // so that they do not overlap
            angle *= 2 * Math.PI;
        }
        else {
            angle = from.position.minus( target ).theta();
        }
        var offset = Vector.fromPolar( this.STATE_RADIUS, angle );
        start = from.position.minus( offset );
        if ( circular ) {
            var center = start.minus( Vector.fromPolar( ( 1 / 2 ) * this.SELF_TRANSITION_RADIUS, angle ) );
            ctx.beginPath();
            ctx.arc( center.x, center.y, this.SELF_TRANSITION_RADIUS, 0, 2 * Math.PI, false );
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
            var d = from.position.minus( center );
            var D = d.length();
            var r1 = this.SELF_TRANSITION_RADIUS;
            var r2 = this.STATE_RADIUS;
            var d2 = ( D * D - r1 * r1 + r2 * r2 ) / ( 2 * D );
            var d1 = ( D * D - r2 * r2 + r1 * r1 ) / ( 2 * D );
            var k = D * D + r1 * r1 - r2 * r2;
            var h = Math.sqrt( r1 * r1 - k * k / ( 4 * D * D ) );
            var intersect = center.plus( Vector.fromPolar( d1, angle ) ).plus( Vector.fromPolar( h, angle ).rotate( Math.PI / 2 ) );

            // the arrowtheta is evaluated at the intersection point
            // we need to subtract a small amount (Math.PI / 10) to make
            // it tangent at the point of the center of the arrow head, not at the point
            // where the arrow points to
            var arrowtheta = intersect.minus( center ).theta() - Math.PI / 8;

            ctx.save();
            ctx.translate( intersect.x, intersect.y );
            ctx.rotate( -arrowtheta );
            this.renderArrowEnd();
            ctx.restore();

            this.renderText(
                center.minus( Vector.fromPolar( this.SELF_TRANSITION_RADIUS, angle ) ),
                via
            );
            return;
        }
        end = target.plus( Vector.fromPolar( this.STATE_RADIUS, angle ) );
        this.renderArrow( start, end );
        this.renderText( start.plus( end ).scale( 1 / 2 ), via );
        
        ctx.restore();
    },
    hitTest: function( mouse ) {
        // check if the user is hovering a state
        var dfaview = this.dfaview;
        var dfa = dfaview.dfa;
        var test = false;

        for ( var state in this.dfaview.states ) {
            test = this.hitTestState( mouse, state, dfaview.states[ state ].position );
            if ( test ) {
                return [ 'state', state ];
            }
        }
        for ( var state in this.dfaview.states ) {
            var j = 0;
            for ( var sigma in dfa.alphabet ) {
                test = this.hitTestTransition(
                    mouse, dfaview.states[ state ].position, sigma, dfaview.states[ dfa.transitions[ state ][ sigma ] ].position
                );
                if ( test ) {
                    return [ 'transition', [ state, sigma ] ];
                }
                ++j;
            }
        }
        return false;
    },
    hitTestState: function( mouse, state, position ) {
        var d = mouse.minus( position );

        return d.length() < this.STATE_RADIUS;
    },
    hitTestTransition: function( mouse, from, via, to, percentage ) {
        if ( from == to ) {
            // TODO: hit test circular transitions
            return false;
        }
        var arrowhead = to.minus(
            Vector.fromPolar( this.STATE_RADIUS, to.minus( from ).theta() )
        );
        var d = arrowhead.minus( mouse );

        if ( d.length() < this.ARROW_RADIUS ) {
            return true;
        }
    }
};
Renderer.extend( EventEmitter );
