function NFARenderer( canvas, nfaview ) {
    var self = this;

    this.canvas = canvas;
    this.ctx = this.canvas.getContext( '2d' );
    this.nfaview = nfaview;
    this.mouseOverElement = [];
    this.selectedStates = {};
    this.offset = new Vector( canvas.offsetLeft, canvas.offsetTop );

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
        var x = e.clientX - self.offset.x;
        var y = e.clientY - self.offset.y;

        test = self.hitTest( new Vector( x, y ) );
        if ( !same( test, self.mouseOverElement ) ) {
            if ( self.mouseOverElement !== false ) {
                mouseOut( self.mouseOverElement, e );
            }
            if ( test !== false ) {
                mouseOver( test, e );
            }
        }
        if ( test !== false ) {
            mouseMove( test, e );
        }
        self.mouseOverElement = test;
        self.emit( 'mousemove', e );
    }
    nfaview.nfa.on( 'beforestatedeleted', function( state ) {
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
NFARenderer.prototype = {
    STATE_RADIUS: 25,
    ACCEPT_RADIUS: 18,
    ARROW_RADIUS: 15,
    ALPHABET_RADIUS: 15,
    ARROW_ANGLE: Math.PI / 6,
    SELF_TRANSITION_RADIUS: 20,
    ARC_TRANSITION_OFFSET: 20,
    constructor: NFARenderer,
    freezeEditor: false,
    mode : 'moveState',
    runMode : false,
    flash: 0,
    flashBl : false,
    selectionRectShow : false,
    selectionRectFrom : new Vector( 100, 100 ),
    selectionRectTo : new Vector( 300, 300 ),
    timeOffset: 0,
    render: function() {
        this.ctx.clearRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );
        var nfa = this.nfaview.nfa;
        var alphabetsize = 0;
        var stateArray = [];

        for ( var sigma in nfa.alphabet ) {
            ++alphabetsize;
        }
        for ( var state in nfa.states ) {
            var j = 0;
            stateArray.push( this.nfaview.states[ state ] );
        }
        stateArray.sort( function ( x, y ) {
            return x.zindex - y.zindex;
        } );

        if ( this.runMode ) {
            var par = Math.abs( ( new Date() * 1 ) - this.timeOffset );
            this.flash = Math.sin( 2 * Math.PI * par / 2000 ) + 1;
        }

        var RectMinx = Math.min( this.selectionRectFrom.x, this.selectionRectTo.x );
        var RectMiny = Math.min( this.selectionRectFrom.y, this.selectionRectTo.y );
        var RectMaxx = Math.max( this.selectionRectFrom.x, this.selectionRectTo.x );
        var RectMaxy = Math.max( this.selectionRectFrom.y, this.selectionRectTo.y );

        for ( var i = 0; i < nfa.numStates; ++i ) {
            if ( typeof stateArray[ i ] != 'undefined' ) {
                var state = stateArray[ i ].state;
                var outstatesnum = nfa.transitionsNum[ state ];

                for ( var j = 0; j < nfa.numStates; ++j ) {
                    var outstring = '';
                    if ( typeof stateArray[ j ] != 'undefined' ) {
                        var to = stateArray[ j ].state;
                        for ( var sigma in nfaview.invtransitions[ state ][ to ] ) {
                            if ( sigma != '$$' ) {
                                outstring += sigma + ', ';
                            }
                        }

                        outstring = outstring.slice( 0, -2 );
                        if ( outstring != '' ) {
                            var arc = false;
                            for ( var sigma in nfaview.invtransitions[ to ][ state ] ) {
                                if ( sigma != '$$' ) {
                                    arc = true;
                                }
                            }
                            this.renderTransition( state, outstring, to, true, arc );
                        }
                    }
                }

                if ( this.nfaview.newtransitionFrom != false ) {
                    this.renderTransition( this.nfaview.newtransitionFrom, '$$', false, false );
                }

                for ( var to in nfa.transitions[ state ][ '$$' ] ) {
                    this.renderTransition( state, '$$', to, false );
                    ++j;
                }

                this.renderState(
                    state, stateArray[ i ].position,
                    stateArray[ i ].importance,
                    nfa.accept[ stateArray[ i ].state ]
                );

                if ( this.selectionRectShow ) {
                    var statePosition = this.nfaview.states[ state ].position;
                    if ( ( RectMinx <= statePosition.x )
                    &&   ( RectMiny <= statePosition.y )
                    &&   ( RectMaxx >= statePosition.x )
                    &&   ( RectMaxy >= statePosition.y ) ) {
                        this.selectedStates[ state ] = state;
                        this.nfaview.states[ state ].importance = 'strong';
                    }
                    else {
                        delete this.selectedStates[ state ];
                        this.nfaview.states[ state ].importance = 'normal';
                    }
                }
            }
        }

        if ( this.selectionRectShow ) {
            this.renderRect( this.selectionRectFrom, this.selectionRectTo );
        }
    },
    renderRect : function( from, to ) {
        var ctx = this.ctx;

        ctx.save();
        ctx.strokeStyle = '#00aaff';
        ctx.fillStyle = '#6eddff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.strokeRect( from.x, from.y, to.x - from.x, to.y - from.y );
        ctx.fillRect( from.x, from.y, to.x - from.x, to.y - from.y );
        ctx.restore();
    },
    renderState: function( state, position, importance, accepting ) {
        var ctx = this.ctx;
        var radgrad = ctx.createRadialGradient( 0, 0, 0, 0, 0, this.STATE_RADIUS );

        ctx.save();
        if ( this.runMode && this.nfaview.nfa.currentStates[ state ] == state ) {
            if ( !this.nfaview.nfa.accept[ state ] ) {
                radgrad.addColorStop( 0, '#ff9999' );
                radgrad.addColorStop( 0.8, '#ff3030' );
                radgrad.addColorStop( 1, '#ff9999' );
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#ff4040';
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 5 + ( this.flash * 10 );
            }
            else {
                radgrad.addColorStop( 0, '#ccffcc' );
                radgrad.addColorStop( 0.8, '#00ff00' );
                radgrad.addColorStop( 1, '#ccffcc' );
                ctx.strokeStyle = 'green';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#00ff00';
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 5 + ( this.flash * 10 );
            }
        }
        else {
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
        }

        ctx.translate( position.x, position.y );
        ctx.beginPath();
        ctx.arc( 0, 0, this.STATE_RADIUS, 0, 2 * Math.PI, true );
        ctx.stroke();
        ctx.fillStyle = radgrad;
        ctx.fill();
        ctx.linewidth = 1;
        ctx.beginPath();
        if ( this.nfaview.nfa.accept[ state ] ) {
            ctx.arc( 0, 0, this.ACCEPT_RADIUS, 0, 2 * Math.PI, true );
        }
        ctx.stroke();
        if ( !( this.runMode && ( this.nfaview.nfa.currentStates[ state ] == state ) ) ) {
            ctx.fill();
        }

        this.renderText( new Vector(0, 0), nfaview.stateName[ state ], false, false );
        ctx.restore();

        if ( this.nfaview.nfa.startState == state ) {
            if ( position.x - 70 > 0 ) {
                var start = new Vector( position.x - 70, position.y );
            }
            else {
                var start = new Vector( 2 , position.y );
            }
            var end = new Vector( position.x - this.STATE_RADIUS, position.y );
            this.renderArrow( start, end );
        }
    },
    renderArrow: function( from, to, arc ) {
        var ctx = this.ctx;
        var theta = Math.atan2( to.y - from.y, to.x - from.x );

        if ( arc ) {
            var cycl = Geometry.findCycle( from, to, this.ARC_TRANSITION_OFFSET );
            var center = cycl[ 0 ];

            var fromToCenter = from.minus( center );
            var toToCenter = to.minus( center );
            var fromTheta = fromToCenter.theta(); // Math.acos( Vector.innerProduct( fromToCenter, new Vector( 1, 0 ) ) / fromToCenter.length() );
            var toTheta = toToCenter.theta(); //Math.acos( Vector.innerProduct( toToCenter, new Vector( 1, 0 ) ) / toToCenter.length() );
            var radius = cycl[ 1 ];
            var rotTheta = Math.atan( - ( 1 / Math.tan( toTheta ) ) );
            if ( Math.abs( theta - rotTheta ) > ( Math.PI / 2 ) ) {
                theta = rotTheta + Math.PI;
            }
            else {
                theta = rotTheta;
            }

            ctx.beginPath();
            // draw arrow line
            ctx.arc( center.x, center.y, radius, fromTheta, toTheta, false );
            ctx.moveTo( from.x, from.y );
            ctx.save();
            ctx.translate( to.x, to.y );
            ctx.rotate( theta );
            ctx.save();
            //ctx.lineTo( 0, 0 );
            ctx.stroke();

            this.renderArrowEnd();

            ctx.restore();
            ctx.restore();
        }
        else {
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

        }
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
    renderText: function( location, text, stroke, importantChar ) {
        var ctx = this.ctx;
        var deftext = '';
        var subtext = '';

        var findsubtext = false;
        for ( var j = 0; j < text.length; ++j ) {
            var character = text.charAt( j );
            if ( character == '_' ) {
                findsubtext = true;
            }
            else {
                if ( findsubtext ) {
                    subtext += character;
                }
                else {
                    deftext += character;
                }
            }
        }

        if ( subtext != '' ) {
            ctx.save();
            ctx.fillStyle = 'black';
            ctx.font = '12pt Verdana';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 6;

            var defdim = ctx.measureText( deftext );
            var subdim = ctx.measureText( subtext );
            var fontHeight = ctx.measureText( 'o' ).width;

            if ( stroke ) {
                ctx.strokeText( deftext, location.x - defdim.width / 2, location.y + ( fontHeight / 2 ) );
            }
            ctx.fillText( deftext, location.x - defdim.width / 2, location.y + ( fontHeight / 2 ) );

            ctx.font = '8pt Verdana';
            if ( stroke ) {
                ctx.strokeText( subtext, location.x + defdim.width / 2 + 1, location.y + ( fontHeight / 2 ) + 4 );
            }
            ctx.fillText( subtext, location.x + defdim.width / 2 + 1, location.y + ( fontHeight / 2 ) + 4 );
            ctx.restore();
        }
        else {

            var symbols = text.split(', ');
            var widthToPass = -symbols.length;

            ctx.save();

            for ( var i = 0; i < symbols.length; ++i ) {
                if ( i == ( symbols.length - 1 ) ) {
                    var sigmaShow = symbols[ i ];
                }
                else {
                    var sigmaShow = symbols[ i ] + ', ';
                }

                if ( ( ( importantChar + ', ' ) === sigmaShow ) || ( importantChar === sigmaShow ) ) {
                    ctx.fillStyle = 'red';
                    ctx.font = 'bold 12pt Verdana';
                }
                else {
                    ctx.fillStyle = 'black';
                    ctx.font = '12pt Verdana';
                }
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 6;

                var dim = ctx.measureText( text );
                var sigmadim = ctx.measureText( sigmaShow );
                var fontHeight = ctx.measureText( 'o' ).width;

                if ( stroke ) {
                    ctx.strokeText( sigmaShow, location.x - ( dim.width / 2 ) + widthToPass, location.y + ( fontHeight / 2 ) );
                }
                ctx.fillText( sigmaShow, location.x - ( dim.width / 2 ) + widthToPass, location.y + ( fontHeight / 2 ) );

                widthToPass += sigmadim.width + 1;
            }

            ctx.restore();
        }
    },
    renderTransition: function( from, via, to, showText, arc) {
        var strokeStyle = 'black';
        var ctx = this.ctx;
        var angle = 1 / 2;

        if ( to == false ) {
            var transitionView = this.nfaview.newtransition;
        }
        else {
            var transitionView = this.nfaview.viewtransitions[ from ][ to ];
        }
        var start, end, target;
        var circular = false;
        var arcView = arc && ( !transitionView.detached );

        ctx.save();

        if ( !transitionView.usedInRun ) {
            ctx.fillStyle = ctx.strokeStyle = 'black';
        }
        else {
            ctx.fillStyle = ctx.strokeStyle = 'red';
        }
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

        from = this.nfaview.states[ from ];
        if ( transitionView.detached ) {
            target = transitionView.position;
        }
        else {
            to = this.nfaview.states[ to ];
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
            if ( arcView ) {
                angle -= Math.PI / 8;
            }
        }
        var offset = Vector.fromPolar( this.STATE_RADIUS, angle );
        start = from.position.minus( offset );
        if ( circular ) {
            var center = start.minus( Vector.fromPolar( ( 1 / 2 ) * this.SELF_TRANSITION_RADIUS, angle ) );
            ctx.beginPath();
            ctx.arc( center.x, center.y, this.SELF_TRANSITION_RADIUS, 0, 2 * Math.PI, true );
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

            if ( showText ) {
                this.renderText(
                    center.minus( Vector.fromPolar( this.SELF_TRANSITION_RADIUS, angle ) ),
                    via, true, transitionView.usedInRun
                );
            }
            ctx.restore();
            return;
        }
        end = target;
        if ( !transitionView.detached ) {
            if ( arcView ) {
                angle += Math.PI / 4;
            }
            end = end.plus( Vector.fromPolar( this.STATE_RADIUS, angle ) );
        }
        this.renderArrow( start, end, ( arc && (! transitionView.detached ) ) );

        if ( showText ) {
            if ( arcView ) {
                var perpVector = Geometry.perpVector( start, end, this.ARC_TRANSITION_OFFSET );
            }
            else {
                var perpVector = new Vector( 0, 0 );
            }
            if ( !transitionView.usedInRun ) {
                var importantChar = '';
            }
            else {
                var importantChar = transitionView.usedInRun;
            }
            this.renderText( start.plus( end ).scale( 1 / 2 ).plus( perpVector ), via, true, importantChar );
        }

        ctx.restore();
    },
    hitTest: function( mouse ) {
        // check if the user is hovering a state
        var nfaview = this.nfaview;
        var nfa = nfaview.nfa;
        var test = false;
        var alphabetsize = 0;

        if ( !this.freezeEditor ){
            for ( var state in this.nfaview.states ) {
                test = this.hitTestState( mouse, state, nfaview.states[ state ].position );
                if ( test ) {
                    return [ 'state', state ];
                }
            }
            for ( var state in this.nfaview.states ) {
                var j = 0;
                for ( var sigma in nfa.alphabet ) {
                    for ( var to in nfa.transitions[ state ][ sigma ] ) {
                        try { 
                            test = this.hitTestTransition(
                                mouse,
                                nfaview.states[ state ].position,
                                sigma,
                                nfaview.states[ to ].position
                            );
                            if ( test ) {
                                return [ 'transition', [ state, sigma, to ] ];
                            }
                        }
                        catch ( e ) {
                            console.log( 'We got a problem' );
                        }
                        ++j;
                    }
                }
            }
        }
        return false;
    },
    hitTestState: function( mouse, state, position ) {
        var d = mouse.minus( position );

        return d.length() < this.STATE_RADIUS;
    },
    hitTestTransition: function( mouse, from, via, to ) {
        var arrowhead;

        if ( from == to ) {
            var offset = Vector.fromPolar( this.STATE_RADIUS, Math.PI );
            var start = from.minus( offset );
            var center = start.minus( Vector.fromPolar( ( 1 / 2 ) * this.SELF_TRANSITION_RADIUS, Math.PI ) );
            var d = from.minus( center );
            var D = d.length();
            var r1 = this.SELF_TRANSITION_RADIUS;
            var r2 = this.STATE_RADIUS;
            var d2 = ( D * D - r1 * r1 + r2 * r2 ) / ( 2 * D );
            var d1 = ( D * D - r2 * r2 + r1 * r1 ) / ( 2 * D );
            var k = D * D + r1 * r1 - r2 * r2;
            var h = Math.sqrt( r1 * r1 - k * k / ( 4 * D * D ) );
            var intersect = center.plus( Vector.fromPolar( d1, Math.PI ) ).plus( Vector.fromPolar( h, Math.PI ).rotate( Math.PI / 2 ) );
            arrowhead = intersect;
        }
        else {
            arrowhead = to.minus(
                Vector.fromPolar( this.STATE_RADIUS, to.minus( from ).theta() )
            );
        }
        var d = arrowhead.minus( mouse );

        return d.length() < this.ARROW_RADIUS;
    },
};
NFARenderer.inherit( EventEmitter );
