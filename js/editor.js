function NFAEditor( canvas, nfaview, input , changeStateName ) {
    this.canvas = canvas;
    this.nfaview = nfaview;
    this.nfa = nfaview.nfa;
    this.inputSymbol = input[ 0 ];
    this.errorSymbol = input[ 1 ];
    this.changeStateName = changeStateName;
    this.renderer = new NFARenderer( this.canvas, this.nfaview );
}
NFAEditor.prototype = {
    constructor: 'Editor',
    dragging: false,
    maxz: 1,
    selectedElement: false,
    transitionToChange: false,
    stateToChangeName: false,
    transitionToChangeName: false,
    mode: 'moveState',
    selectedRectStates: false,
    shiftPressed: false,
    setRun: function ( mode ) {
        this.nfa.emit( 'removeprevstep' );
        this.renderer.runMode = mode;
        this.renderer.flush = 0;
        this.renderer.flushBl = false;
        this.renderer.freezeEditor = mode;
        this.renderer.timeOffset = new Date() * 1
    },
    setMode: function( mode ) {
        // mode is one of 'moveState' or 'createTransition'
        this.mode = mode;
        this.renderer.mode = mode;
        this.elementDeselected();
    },
    elementSelected: function( element ) {
        var oldtype = this.selectedElement[ 0 ];
        var oldid = this.selectedElement[ 1 ];
        var type = element[ 0 ];
        var id = element[ 1 ];

        if ( oldtype != type || id != oldid ) {
            if ( this.selectedElement != false ) {
                this.elementDeselected();
            }
            switch ( type ) {
                case 'state':
                    this.nfaview.states[ id ].importance = 'strong';
                    break;
                case 'transition':
                    this.nfaview.viewtransitions[ id[ 0 ] ][ id[ 2 ] ].importance = 'strong';
                    break;
            }
            this.selectedElement = element;
        }
    },
    elementDeselected: function() {
        var type = this.selectedElement[ 0 ];
        var id = this.selectedElement[ 1 ];

        switch ( type ) {
            case 'state':
                this.nfaview.states[ id ].importance = 'normal';
                break;
            case 'transition':
                this.nfaview.viewtransitions[ id[ 0 ] ][ id[ 2 ] ].importance = 'normal';
                break;
        }
        this.selectedElement = false;

        for ( var selstate in this.selectedRectStates ) {
            this.nfaview.states[ selstate ].importance = 'normal';
        }
        this.selectedRectStates = {};
        this.renderer.selectedStates = {};
    },
    inverseOneAccepting: function( state ) {
        if ( nfa.accept[ state ] ){
            nfa.removeAcceptingState( state );
        }
        else {
            nfa.addAcceptingState( state );
        }
    },
    inverseAccepting: function() {
        if ( this.selectedElement[ 0 ] == 'state' ) {
            this.inverseOneAccepting( this.selectedElement[ 1 ] );
        }

        for ( var selstate in this.selectedRectStates ) {
            if ( selstate != this.selectedElement[ 1 ] ) {
                this.inverseOneAccepting( selstate );
            }
        }
    },
    inputSubmit: function() {
        if ( this.transitionToChange != false ) {
            var sigma = this.inputSymbol.value;
            var insertOk = false;
            var symboladded = sigma.split(',');
            for ( var i = 0; i < symboladded.length; ++i ) {
                symbol = symboladded[ i ];
                if ( symbol != '' ) {
                    insertOk = this.nfa.addTransition( this.transitionToChange[ 0 ], symbol, this.transitionToChange[ 2 ] );
                }
                else {
                    insertOk = this.nfa.addTransition( this.transitionToChange[ 0 ], 'ε', this.transitionToChange[ 2 ] );
                }
            }
            if ( insertOk ) {
                this.inputSymbol.value = '';
                this.nfa.deleteTransition( this.transitionToChange[ 0 ], this.transitionToChange[ 1 ], this.transitionToChange[ 2 ] );
                $( this.errorSymbol ).hide();
                $( this.inputSymbol ).hide();
                this.transitionToChange = false;
            }
            else {
                var newx = parseFloat( this.inputSymbol.style.left );
                var newy = parseFloat( this.inputSymbol.style.top ) + parseFloat( this.inputSymbol.style.height ) + 8;
                this.errorSymbol.style.left = '' + newx + 'px' ;
                this.errorSymbol.style.top = '' + newy + 'px' ;
                $( this.errorSymbol ).show();
            }
        }
        else if ( this.stateToChangeName != false ) {
            var newName = this.changeStateName.value;
            this.nfaview.stateName[ this.stateToChangeName ] = newName;
            this.changeStateName.value = '';
            $( this.changeStateName ).hide();
            this.stateToChangeName = false;
        }
        else if ( this.transitionToChangeName != false ) {
            var sigma = this.inputSymbol.value;
            var insertOk = false;
            var symboladded = sigma.split(',');
            var newSymbol = {};
            for ( var i = 0; i < symboladded.length; ++i ) {
                symbol = symboladded[ i ];
                if ( symbol != '' ) {
                    newSymbol[ symbol ] = symbol;
                    insertOk = this.nfa.addTransition( this.transitionToChangeName[ 0 ], symbol, this.transitionToChangeName[ 2 ] );
                }
                else {
                    newSymbol[ 'ε' ] = 'ε';
                    insertOk = this.nfa.addTransition( this.transitionToChangeName[ 0 ], 'ε', this.transitionToChangeName[ 2 ] );
                }
                if ( !insertOk ) {
                    break;
                }
            }
            if ( insertOk ) {
                this.inputSymbol.value = '';
                for ( var sigma in this.nfaview.invtransitions[ this.transitionToChangeName[ 0 ] ][ this.transitionToChangeName[ 2 ] ] ){
                    if ( ! ( sigma in newSymbol ) ) {
                        this.nfa.deleteTransition( this.transitionToChangeName[ 0 ], sigma, this.transitionToChangeName[ 2 ] );
                    }
                }
                $( this.errorSymbol ).hide();
                $( this.inputSymbol ).hide();
                this.elementDeselected();
                this.transitionToChangeName = false;
            }
            else {
                var newx = parseFloat( this.inputSymbol.style.left );
                var newy = parseFloat( this.inputSymbol.style.top ) + parseFloat( this.inputSymbol.offsetHeight ) + 8;
                this.errorSymbol.style.left = '' + newx + 'px' ;
                this.errorSymbol.style.top = '' + newy + 'px' ;
                $( this.errorSymbol ).show();
            }
        }
    },
    isSelectedRect : function () {
        for ( var selstate in this.selectedRectStates ) {
            return true;
        }

        return false;
    },
    isStateSelected: function( state ) {
        var ret =
            this.selectedElement != false
         && this.selectedElement[ 0 ] == 'state'
         && this.selectedElement[ 1 ] == state;
        return ret;
    },
    isTransitionSelected: function( transition ) {
        var ret =
            this.selectedElement != false
         && this.selectedElement[ 0 ] == 'transition'
         && same( this.selectedElement[ 1 ], transition )
        return ret;
    },
    run: function( input ) {
        // TODO: error message if there is no startState

        console.log( 'Running automaton on input ' + input );

        if ( this.nfa.states[ this.nfa.startState ]
          && !this.renderer.selectionRectShow ) {
            this.elementDeselected();
            this.setRun( true );
            this.nfa.reset();
            this.nfa.input = input;
        }
    },
    runStep: function() {
        if ( !this.nfa.nextStepByStep() ) {
            this.setRun( false );
            return false;
        }
        return true;
    },
    gotoStep: function( input, step ) {
        this.run( input );
        for ( var i = 0; i < step; ++i ) {
            this.runStep();
        }
    },
    play: function() {
        // TODO: This function is huge and it includes many closures
        //       which long-term can cause garbage collection issues.
        //       We need to split this into individual functions with
        //       no environment frames refering to local variables.
        //       In particular, the events the renderer fires are better
        //       written as separate functions of the editor object, not
        //       as closures.
        var nfa = this.nfa;
        var renderer = this.renderer;
        var canvas = this.canvas;
        var self = this;

        nfa.on( 'statedeleted', function( state ) {
            if (    self.selectedElement[ 0 ] == 'state'
                 && self.selectedElement[ 1 ] == state ) {
                self.selectedElement = false;
            }
        } );
        renderer.on( 'mouseoverstate', function( state ) {
            if ( ( typeof self.selectedRectStates[ state ] == 'undefined' ) && ( !renderer.selectionRectShow ) ) {
                if ( !self.dragging
                && !self.isStateSelected( state ) ) {
                    nfaview.states[ state ].importance = 'emphasis';
                }
            }
            if ( !renderer.selectionRectShow ) {
                canvas.style.cursor = 'pointer';
            }
        } );
        function stateOut( state ) {
            if ( typeof self.selectedRectStates[ state ] == 'undefined' ) {
                if ( !self.isStateSelected( state ) ) {
                    nfaview.states[ state ].importance = 'normal';
                }
            }
            canvas.style.cursor = 'default';
        }
        renderer.on( 'mouseovertransition', function( transition ) {
            if ( !self.dragging && !self.isTransitionSelected( transition ) ) {
                nfaview.transitions[ transition[ 0 ] ][ transition[ 1 ] ][ transition[ 2 ] ].importance = 'emphasis';
                nfaview.viewtransitions[ transition[ 0 ] ][ transition[ 2 ] ].importance = 'emphasis';
            }
            if ( !renderer.selectionRectShow ) {
                canvas.style.cursor = 'pointer';
            }
        } );
        function transitionOut( transition ) {
            if ( !self.isTransitionSelected( transition ) ) {
                if ( typeof nfaview.transitions[ transition[ 0 ] ][ transition[ 1 ] ][ transition[ 2 ] ] != 'undefined' ) {
                    nfaview.transitions[ transition[ 0 ] ][ transition[ 1 ] ][ transition[ 2 ] ].importance = 'normal';
                    nfaview.viewtransitions[ transition[ 0 ] ][ transition[ 2 ] ].importance = 'normal';
                }
            }
            canvas.style.cursor = 'default';
        }
        renderer.on( 'mouseouttransition', transitionOut );
        renderer.on( 'mouseoutstate', stateOut );
        renderer.on( 'mousedownstate', function( state, e ) {
            self.inputSubmit();

            if ( e.shiftKey ) {
                if ( self.selectedElement[ 1 ] != state ) {
                    if ( self.selectedElement[ 0 ] == 'state' ) {
                        self.selectedRectStates[ self.selectedElement[ 1 ] ] = self.selectedElement[ 1 ];
                        nfaview.states[ self.selectedElement[ 1 ] ].importance = 'strong';
                    }

                    if ( self.selectedRectStates[ state ] == state ) {
                        delete self.selectedRectStates[ state ];
                        nfaview.states[ state ].importance = 'normal';
                    }
                    else {
                        self.selectedRectStates[ state ] = state;
                        nfaview.states[ state ].importance = 'strong';
                    }
                    return;
                }
            }

            var client = new Vector( e.clientX, e.clientY );

            self.dragging = true;

            if ( self.selectedRectStates[ state ] != state ) {
                var s = nfaview.states[ state ].position;

                nfaview.states[ state ].zindex = self.maxz++;
                self.elementDeselected();
            }
            else {
                var s = {};
                for ( var selstate in self.selectedRectStates ) {
                    s[ selstate ] = nfaview.states[ selstate ].position;
                    nfaview.states[ selstate ].zindex = self.maxz++;
                }
            }

            function move( e ) {
                canvas.style.cursor = 'pointer';
                var newClient = new Vector( e.clientX, e.clientY );
                var d = newClient.minus( client );

                if ( self.selectedRectStates[ state ] == state ) {
                    for ( var selstate in self.selectedRectStates ) {
                        nfaview.states[ selstate ].position = s[ selstate ].plus( d );
                    }
                }
                else {
                    nfaview.states[ state ].position = s.plus( d );
                }
            }
            function up( e ) {
                // Enable this line to simulate 'once' EventEmmitter functionality from below
                document.removeEventListener( 'mouseup', up );
                renderer.removeListener( 'mousemove', move );
                renderer.on( 'mouseoutstate', stateOut );
                renderer.on( 'mouseouttransition', transitionOut );
                self.dragging = false;
                canvas.style.cursor = 'default';
            }
            // FIXED: up() function seems to be getting called on mouse down
            //       for some weird reason (a but in the renderer probably),
            //       and if it's removed then the create transition
            //       functionality fais to work correctly. Not sure what's going on here,
            //       but this needs to be replaced with a document.addEventListener
            //       so that when mouseup'ing outside the browser window, the automaton
            //       state that is being dragged is still released.
            // FIXED: enable this line:
            //       document.addEventListener( 'mouseup', up );
            // FIXED: disable this line:
            // Not sure why all this is happening.

            if ( self.mode == 'moveState' ) {
                renderer.on( 'mousemove', move );
                document.addEventListener( 'mouseup', up );
                renderer.removeListener( 'mouseoutstate', stateOut );
                renderer.removeListener( 'mouseouttransition', transitionOut );

                if ( self.selectedRectStates[ state ] != state ) {
                    self.elementSelected( [ 'state', state ] );
                }
            }
            else if ( self.mode == 'createTransition' ) {
                nfaview.newtransitionFrom = state;
                nfaview.newtransition.position = nfaview.states[ state ].position;
                nfaview.states[ state ].importance = 'normal';
                renderer.emit( 'mousenewtransition', [ state, '$$', false, false ], e );
            }
        } );
        renderer.on( 'mousenewtransition' , function( transition, e ) {
            if ( transition[ 3 ] == false ) {
                var transitionView = nfaview.newtransition;
                var to = self.nfaview.states[ transition[ 0 ] ].position;
                var oldClient = new Vector( e.clientX, e.clientY );
                var from = self.nfaview.states[ transition[ 0 ] ].position;
                var angle = from.minus( new Vector( e.clientX, e.clientY ) ).theta();
                var s = to.plus( Vector.fromPolar( this.STATE_RADIUS, angle ) );

                canvas.style.cursor = 'pointer';
                self.dragging = true;

                nfaview.states[ transition[ 0 ] ].zindex = self.maxz++;

                function move( e ) {
                    var client = new Vector( e.clientX, e.clientY );
                    var d = client.minus( oldClient );

                    transitionView.position = new Vector ( e.clientX, e.clientY - 39 ); // TODO fix this to be more general...
                }
                function up( e ) {
                    document.removeEventListener( 'mouseup', up );
                    var client = new Vector( e.clientX, e.clientY );
                    var test = renderer.hitTest( client.minus( renderer.offset ) );
                    if ( test[ 0 ] == 'state' ) {
                        nfaview.nfa.addTransition( transition[ 0 ], '$$', test[ 1 ] );
                        nfaview.newtransitionFrom = false;
                        transition[ 2 ] = test[ 1 ];
                    }

                    renderer.removeListener( 'mousemove', move );
                    renderer.removeListener( 'mouseup', up );
                    renderer.on( 'mouseoutstate', stateOut );
                    renderer.on( 'mouseouttransition', transitionOut );
                    self.dragging = false;
                    canvas.style.cursor = 'default';
                    if ( transition[ 2 ] != false ) {
                        nfaview.nfa.addTransition( transition[ 0 ], '$$', transition[ 2 ] );
                        nfaview.newtransitionFrom = false;
                        renderer.emit( 'mousedowntransition', [ transition[ 0 ], '$$', transition[ 2 ] ], e );
                    }
                    nfaview.newtransitionFrom = false;
                    self.elementDeselected();
                }

                renderer.on( 'mousemove', move );
                document.addEventListener( 'mouseup', up );
                renderer.removeListener( 'mouseoutstate', stateOut );
                renderer.removeListener( 'mouseouttransition', transitionOut );
            }
        } );
        renderer.on( 'mousedowntransition', function( transition, e ) {
            self.inputSubmit();
            if ( typeof transition[ 3 ] == 'undefined' ) {
                var transitionView = nfaview.viewtransitions[ transition[ 0 ] ][ transition[ 2 ] ];
                var to = self.nfaview.states[ transition[ 2 ] ].position;
                var oldClient = new Vector( e.clientX, e.clientY );
                var from = self.nfaview.states[ transition[ 0 ] ].position;
                var angle = from.minus( to ).theta();
                var s = to.plus( Vector.fromPolar( this.STATE_RADIUS, angle ) );

                self.dragging = true;

                nfaview.states[ transition[ 0 ] ].zindex = self.maxz++;

                function move( e ) {
                    var client = new Vector( e.clientX, e.clientY );
                    var d = client.minus( oldClient );

                    transitionView.position = s.plus( d );

                    transitionView.detached = true;
                }
                function up( e ) {
                    if ( transition[ 1 ] != '$$' ) {
                        var client = new Vector( e.clientX, e.clientY );
                        var test = renderer.hitTest( client.minus( renderer.offset ) );
                        if ( test[ 0 ] == 'state' ) {
                            transitionView.detached = false;
                            for ( var sigma in nfaview.invtransitions[ transition[ 0 ] ][ transition[ 2 ] ] ) {
                                nfaview.nfa.deleteTransition( transition[ 0 ], sigma, transition[ 2 ] );
                                nfaview.nfa.addTransition( transition[ 0 ], sigma, test[ 1 ] );
                            }
                            transition[ 2 ] = test[ 1 ];
                            self.elementDeselected();
                            self.elementSelected( [ 'transition', transition ] );
                        }
                    }

                    if ( transition[ 1 ] == '$$' ) {
                        var newx = ( ( nfaview.states[ transition[ 0 ] ].position.x
                                   + nfaview.states[ transition[ 2 ] ].position.x ) / 2 )
                                   - ( parseFloat( self.inputSymbol.style.width ) / 2 );
                        var newy = ( ( nfaview.states[ transition[ 0 ] ].position.y
                                   + nfaview.states[ transition[ 2 ] ].position.y ) / 2 )
                                   + ( parseFloat( self.inputSymbol.style.height ) / 2 ) + 20; //TODO fix 20 to samething more general
                        self.transitionToChange = transition;
                        self.inputSymbol.style.left = '' + newx + 'px' ;
                        self.inputSymbol.style.top = '' + newy + 'px' ;
                        $( self.inputSymbol ).show();
                        self.inputSymbol.focus();
                        self.elementDeselected();
                    }

                    renderer.removeListener( 'mousemove', move );
                    document.removeEventListener( 'mouseup', up );
                    renderer.on( 'mouseoutstate', stateOut );
                    renderer.on( 'mouseouttransition', transitionOut );
                    self.dragging = false;
                    canvas.style.cursor = 'default';
                    transitionView.detached = false;
                }
                renderer.on( 'mousemove', move );
                document.addEventListener( 'mouseup', up );
                renderer.removeListener( 'mouseoutstate', stateOut );
                renderer.removeListener( 'mouseouttransition', transitionOut );
                if ( transition[ 1 ] == '$$' ) {
                    up( e );
                }
                self.elementSelected( [ 'transition', transition ] );
            }
        } );
        renderer.on( 'mousedownvoid', function( e ) {
            self.elementDeselected();
            self.inputSubmit();

            if ( self.mode == 'moveState' && !renderer.freezeEditor ) {
                var client = new Vector( e.clientX, e.clientY - 39 ); //TODO find an more general type...

                self.dragging = true;

                renderer.selectionRectShow = true;
                renderer.selectionRectFrom = client;
                renderer.selectionRectTo = client;

                function move( e ) {
                    var newClient = new Vector( e.clientX, e.clientY - 39 ); //TODO find an more general type...

                    self.selectedRectStates = renderer.selectedStates;
                    renderer.selectionRectTo = newClient;
                }
                function up( e ) {
                    document.removeEventListener( 'mouseup', up );
                    renderer.removeListener( 'mousemove', move );
                    renderer.selectionRectShow = false;
                    renderer.on( 'mouseoutstate', stateOut );
                    renderer.on( 'mouseouttransition', transitionOut );
                    self.dragging = false;
                    canvas.style.cursor = 'default';
                }
                renderer.on( 'mousemove', move );
                document.addEventListener( 'mouseup', up );
                renderer.removeListener( 'mouseoutstate', stateOut );
                renderer.removeListener( 'mouseouttransition', transitionOut );
            }
        } );
        renderer.on( 'dblclick', function( e ) {
            self.elementDeselected();
            self.inputSubmit();
            var client = new Vector( e.clientX, e.clientY )
            var test = renderer.hitTest( client.minus( renderer.offset ) );
            if ( !test ) {
                // TODO: addState should produce the new state number
                //       The caller must remain agnostic of the way this is done.
                //       Therefore, .nextNumState must remain of private visibility.
                //       Instead, addState() should RETURN what it has produced.
                var newState = 'q_' + nfaview.nfa.nextNumState;

                nfaview.nfa.addState( newState );
                nfaview.states[ newState ].position = new Vector(
                    e.clientX - this.offset.x,
                    e.clientY - this.offset.y
                );
            }
            else if ( test[ 0 ] == 'state' ) {
                self.stateToChangeName = test[ 1 ];
                var newx = nfaview.states[ test[ 1 ] ].position.x - ( parseFloat( self.changeStateName.style.width ) / 2 ) - 2 ;
                var newy = nfaview.states[ test[ 1 ] ].position.y + ( parseFloat( self.changeStateName.style.height ) / 2 ) + 5;
                self.changeStateName.style.left = newx + 'px';
                self.changeStateName.style.top = newy + 'px';
                $( self.changeStateName ).show();
                self.changeStateName.value = nfaview.stateName[ test[ 1 ] ];
                self.changeStateName.focus();
            }
            else if ( test[ 0 ] == 'transition' ) {
                self.transitionToChangeName = test[ 1 ];
                var newx = ( ( nfaview.states[ self.transitionToChangeName[ 0 ] ].position.x
                            + nfaview.states[ self.transitionToChangeName[ 2 ] ].position.x ) / 2 )
                            - ( parseFloat( self.inputSymbol.style.width ) / 2 );
                var newy = ( ( nfaview.states[ self.transitionToChangeName[ 0 ] ].position.y
                            + nfaview.states[ self.transitionToChangeName[ 2 ] ].position.y ) / 2 )
                            + ( parseFloat( self.inputSymbol.style.height ) / 2 ) + 20; // TODO fix 20 to something more general
                var newPos = new Vector( newx, newy );
                var arcView = false;
                for ( var sigma in nfaview.invtransitions[ self.transitionToChangeName[ 2 ] ][ self.transitionToChangeName[ 0 ] ] ) {
                    if ( sigma != '$$' ) {
                        arcView = true;
                    }
                }

                if ( arcView ) {
                    var perpVector = Geometry.perpVector ( nfaview.states[ self.transitionToChangeName[ 0 ] ].position,
                                                         nfaview.states[ self.transitionToChangeName[ 2 ] ].position,
                                                         renderer.ARC_TRANSITION_OFFSET + 8 );
                }
                else {
                    var perpVector = new Vector( 0, 0 );
                }

                newPos = newPos.plus( perpVector );
                self.inputSymbol.style.left = newPos.x + 'px';
                self.inputSymbol.style.top = newPos.y + 'px';
                $( self.inputSymbol ).show();
                var currentVal = '';
                for ( var symbol in nfaview.invtransitions[ self.transitionToChangeName[ 0 ] ][ self.transitionToChangeName[ 2 ] ] ) {
                    currentVal += symbol + ',';
                }
                currentVal = currentVal.slice(0, -1);
                self.inputSymbol.value = currentVal;
                self.inputSymbol.focus();
            }
        } );
        document.onkeydown = function( e ) {
            switch ( e.keyCode ) {
                case 46: // delete
                    if ( self.isSelectedRect() ) {
                        for ( var selstate in self.selectedRectStates ) {
                            nfa.deleteState( selstate );
                        }
                        self.selectedRectStates = {};
                        renderer.selectedStates = {};
                        return;
                    }
                    if ( self.selectedElement == false ) {
                        return;
                    }
                    switch ( self.selectedElement[ 0 ] ) {
                        case 'state':
                            nfa.deleteState( self.selectedElement[ 1 ] );
                            break;
                        case 'transition':
                            for ( var sigma in nfaview.invtransitions[ self.selectedElement[ 1 ][ 0 ] ][ self.selectedElement[ 1 ][ 2 ] ] ){
                                nfa.deleteTransition( self.selectedElement[ 1 ][ 0 ], sigma, self.selectedElement[ 1 ][ 2 ] );
                            }
                            break;
                    }
                    break;
                case 13: //enter
                    self.inputSubmit();
                    break;
                case 27: //escape
                    if ( self.transitionToChange != false ) {
                        self.inputSymbol.value = '';
                        nfa.deleteTransition( self.transitionToChange[ 0 ], self.transitionToChange[ 1 ], self.transitionToChange[ 2 ] );
                        $( self.errorSymbol ).hide();
                        $( self.inputSymbol ).hide();
                        self.transitionToChange = false;
                    }
                    else if ( self.stateToChangeName != false ) {
                        self.changeStateName.value = '';
                        self.changeStateName.type = 'hidden';
                        self.stateToChangeName = false;
                    }
                    else if ( self.transitionToChangeName != false ) {
                        self.inputSymbol.value = '';
                        $( self.errorSymbol ).hide();
                        $( self.inputSymbol ).hide();
                        self.transitionToChangeName = false;
                    }
                    break;
                case 32: //space
                    self.inverseAccepting();
                    break;
                case 73: // i -- change initial state
                    if ( self.selectedElement[ 0 ] == 'state' ){
                        nfa.startState = self.selectedElement[ 1 ];
                    }
                    break;
            }
            renderer.requestRendering();
        };
        window.requestAnimFrame = ( function() {
            return window.requestAnimationFrame
                || window.webkitRequestAnimationFrame
                || window.mozRequestAnimationFrame
                || window.oRequestAnimationFrame
                || window.msRequestAnimationFrame
                || function( callback ) {
                       window.setTimeout( callback, 1000 / 60 );
                   };
        } )();
        renderer.requestRendering();
    }
};
