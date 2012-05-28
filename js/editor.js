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
    stateFromSelected: false,
    stateToSelected: false,
    transitionToChange: false,
    stateToChangeName: false,
    transitionToChangeSymbol: false,
    mode: 'moveState',
    setRun: function ( mode ) {
        this.renderer.runMode = mode;
        this.renderer.flush = 0;
        this.renderer.flushBl = false;
    },
    setMode: function( mode ) {
        // mode is one of 'moveState' or 'createTransition'
        this.mode = mode;
        this.renderer.mode = mode;
    },
    mainLoop: function() {
        this.renderer.render();
        setTimeout( this.mainLoop.bind( this ), 17 );
    },
    elementSelected: function( element ) {
        var oldtype = this.selectedElement[ 0 ];
        var oldid = this.selectedElement[ 1 ];
        var type = element[ 0 ];
        var id = element[ 1 ];

        if ( oldtype != type || id != oldid ) {
            switch ( type ) {
                case 'state':
                    this.nfaview.states[ id ].importance = 'strong';
                    break;
                case 'transition':
                    this.nfaview.viewtransitions[ id[ 0 ] ][ id[ 2 ] ].importance = 'strong';
                    break;
            }
            if ( this.selectedElement != false ) {
                this.elementDeselected();
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
    play: function() {
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
        renderer.on( 'mouseoveralphabet', function( symbol ) {
            nfaview.alphabet[ symbol ].importance = 'emphasis';
            canvas.style.cursor = 'pointer';
        } );
        function alphabetOut( symbol ) {
            nfaview.alphabet[ symbol ].importance = 'normal';
            canvas.style.cursor = 'default';
        }
        renderer.on( 'mouseoverstate', function( state ) {
            if ( !self.dragging
              && !self.isStateSelected( state ) ) {
                nfaview.states[ state ].importance = 'emphasis';
            }
            canvas.style.cursor = 'pointer';
        } );
        function stateOut( state ) {
            if ( !self.isStateSelected( state ) ) {
                nfaview.states[ state ].importance = 'normal';
            }
            canvas.style.cursor = 'default';
        }
        renderer.on( 'mouseovertransition', function( transition ) {
            if ( !self.dragging && !self.isTransitionSelected( transition ) ) {
                nfaview.transitions[ transition[ 0 ] ][ transition[ 1 ] ][ transition[ 2 ] ].importance = 'emphasis';
                nfaview.viewtransitions[ transition[ 0 ] ][ transition[ 2 ] ].importance = 'emphasis';
            }
            canvas.style.cursor = 'pointer';
        } );
        function transitionOut( transition ) {
            if ( !self.isTransitionSelected( transition ) ) {
                nfaview.transitions[ transition[ 0 ] ][ transition[ 1 ] ][ transition[ 2 ] ].importance = 'normal';
                nfaview.viewtransitions[ transition[ 0 ] ][ transition[ 2 ] ].importance = 'normal';
            }
            canvas.style.cursor = 'default';
        }
        renderer.on( 'mouseouttransition', transitionOut );
        renderer.on( 'mouseoutstate', stateOut );
        renderer.on( 'mouseoutalphabet', alphabetOut );
        renderer.on( 'mousedownstate', function( state, e ) {
            if ( self.stateFromSelected == false ){ //TODO remove if...
                var client = new Vector( e.clientX, e.clientY );
                var s = nfaview.states[ state ].position;

                self.dragging = true;

                nfaview.states[ state ].zindex = self.maxz++;

                function move( e ) {
                    var newClient = new Vector( e.clientX, e.clientY );
                    var d = newClient.minus( client );
                    nfaview.states[ state ].position = s.plus( d );
                }
                function up( e ) {
                    renderer.removeListener( 'mousemove', move );
                    renderer.on( 'mouseoutstate', stateOut );
                    renderer.on( 'mouseouttransition', transitionOut );
                    self.dragging = false;
                    canvas.style.cursor = 'default';
                }
                renderer.on( 'mousemove', move );
                renderer.once( 'mouseup', up );
                renderer.removeListener( 'mouseoutstate', stateOut );
                renderer.removeListener( 'mouseouttransition', transitionOut );

            if ( self.mode == 'moveState' ) {
                self.elementSelected( [ 'state', state ] );
            }
            else if ( self.mode == 'createTransition' ) {
                // nfaview.nfa.addTransition( state, '$$', state );
                nfaview.newtransitionFrom = state;
                nfaview.newtransition.position = nfaview.states[ state ].position;
                nfaview.states[ state ].importance = 'normal';
                renderer.emit( 'mouseup', e );
                renderer.emit( 'mousedowntransition', [ state, '$$', false ], e );
            }
            }
            else{
                renderer.showAlphabet = true;
                self.stateToSelected = state;
            }

        } );
        renderer.on( 'mouseupalphabet', function( symbol, e ) {
            if ( renderer.showAlphabet == true ){
                nfaview.nfa.addTransition( self.stateFromSelected, symbol, self.stateToSelected );
                renderer.showAlphabet = false;
                self.stateFromSelected = false;
                self.stateToSelected = false;
            }
        } );
        renderer.on( 'mousedowntransition', function( transition, e ) {
            if ( transition[ 2 ] == false ) {
                var transitionView = nfaview.newtransition;
                var to = self.nfaview.states[ transition[ 0 ] ].position;
            }
            else {
                var transitionView = nfaview.viewtransitions[ transition[ 0 ] ][ transition[ 2 ] ];
                var to = self.nfaview.states[ transition[ 2 ] ].position;
            }
            var oldClient = new Vector( e.clientX, e.clientY );
            var from = self.nfaview.states[ transition[ 0 ] ].position;
            var angle = from.minus( to ).theta();
            var s = to.plus( Vector.fromPolar( this.STATE_RADIUS, angle ) );

            self.dragging = true;

            nfaview.states[ transition[ 0 ] ].zindex = self.maxz++;

            function move( e ) {
                var client = new Vector( e.clientX, e.clientY )
                var d = client.minus( oldClient );

                transitionView.position = s.plus( d );

                var test = renderer.hitTest( client.minus( renderer.offset ) );
                if ( ( ( test[ 0 ] == 'state' )
                  && ( test[ 1 ] != transition[ 2 ] )
                  && !( transition[ 2 ] == false ) )
                  || ( ( transition[ 1 ] == '$$' ) && ( transition[ 2 ] != false ) ) ) {
                    transitionView.detached = false;
                    for ( var sigma in nfaview.invtransitions[ transition[ 0 ] ][ transition[ 2 ] ] ) {
                        nfaview.nfa.deleteTransition( transition[ 0 ], sigma, transition[ 2 ] );
                        nfaview.nfa.addTransition( transition[ 0 ], sigma, test[ 1 ] );
                    }
                    transition[ 2 ] = test[ 1 ];
                    renderer.emit( 'mouseup', e );
                    self.elementDeselected();
                }
                else if ( !( transition[ 2 ] == false ) ) {
                    transitionView.detached = true;
                }
                else {
                    if ( ( test[ 0 ] == 'state' )
                      && ( test[ 1 ] != transition[ 0 ] ) ) {
                        nfaview.nfa.addTransition( transition[ 0 ], '$$', test[ 1 ] );
                        nfaview.newtransitionFrom = false;
                        transition[ 1 ] = false;
                        transition[ 2 ] = test[ 1 ];
                        renderer.emit( 'mouseup', e );
                    }
                }
            }
            function up( e ) {
                if ( ( transition[ 1 ] == '$$' ) && ( transition[ 2 ] != false ) ) {
                    var newx = ( ( nfaview.states[ transition[ 0 ] ].position.x + nfaview.states[ transition[ 2 ] ].position.x ) / 2 ) - ( parseFloat( self.inputSymbol.style.width ) / 2 );
                    var newy = ( ( nfaview.states[ transition[ 0 ] ].position.y + nfaview.states[ transition[ 2 ] ].position.y ) / 2 ) + ( parseFloat( self.inputSymbol.style.height ) / 2 );
                    self.transitionToChange = transition;
                    renderer.showAlphabet = true;
                    self.inputSymbol.style.left = '' + newx + 'px' ;
                    self.inputSymbol.style.top = '' + newy + 'px' ;
                    self.inputSymbol.type = 'text';
                    self.inputSymbol.focus();
                }
                renderer.removeListener( 'mousemove', move );
                renderer.on( 'mouseoutstate', stateOut );
                renderer.on( 'mouseouttransition', transitionOut );
                self.dragging = false;
                canvas.style.cursor = 'default';
                if ( transition[ 1 ] == false ) {
                    nfaview.nfa.addTransition( transition[ 0 ], '$$', transition[ 2 ] );
                    nfaview.newtransitionFrom = false;
                    renderer.emit( 'mousedowntransition', [ transition[ 0 ], '$$', transition[ 2 ] ], e );
                }
                else if ( transition[ 2 ] == false ) {
                    var client = new Vector( e.clientX, e.clientY )
                    var d = client.minus( oldClient );
                    var test = renderer.hitTest( client.minus( renderer.offset ) );

                    if ( test[ 0 ] == 'state' ) {
                        nfaview.nfa.addTransition( transition[ 0 ], '$$', transition[ 0 ] );
                        nfaview.newtransitionFrom = false;
                        renderer.emit( 'mousedowntransition', [ transition[ 0 ], '$$', transition[ 0 ] ], e );
                    }
                    else {
                        nfaview.newtransitionFrom = false;
                    }
                }
                else {
                    transitionView.detached = false;
                }
            }
            renderer.on( 'mousemove', move );
            renderer.once( 'mouseup', up );
            renderer.removeListener( 'mouseoutstate', stateOut );
            renderer.removeListener( 'mouseouttransition', transitionOut );

            if ( transition[ 2 ] != false ) {
                self.elementSelected( [ 'transition', transition ] );
            }
        } );
        renderer.on( 'mousedownvoid', function( e ) {
            self.elementDeselected();
        } );
        renderer.on( 'dblclick', function( e ) {
            if ( !renderer.showAlphabet ) {
                var client = new Vector( e.clientX, e.clientY )
                var test = renderer.hitTest( client.minus( renderer.offset ) );
                if ( !test ) {
                    var newState = nfaview.nfa.nextnumState;

                    nfaview.nfa.addState( newState );
                    nfaview.states[ newState ].position = new Vector(
                        e.clientX - this.offset.x,
                        e.clientY - this.offset.y
                    );
                }
                else if ( test[ 0 ] == 'state' ){
                    self.stateToChangeName = test[ 1 ];
                    var newx = nfaview.states[ test[ 1 ] ].position.x - ( parseFloat( self.changeStateName.style.width ) / 2 );
                    var newy = nfaview.states[ test[ 1 ] ].position.y + ( parseFloat( self.changeStateName.style.height ) / 2 );
                    renderer.showAlphabet = true;
                    self.changeStateName.style.left = '' + newx + 'px' ;
                    self.changeStateName.style.top = '' + newy + 'px' ;
                    self.changeStateName.type = 'text';
                    self.changeStateName.value = nfaview.stateName[ test[ 1 ] ];
                    self.changeStateName.focus();
                }
                else if ( test[ 0 ] == 'transition' ){
                    self.transitionToChangeName = test[ 1 ];
                    var newx = ( ( nfaview.states[ self.transitionToChangeName[ 0 ] ].position.x + nfaview.states[ self.transitionToChangeName[ 2 ] ].position.x ) / 2 ) - ( parseFloat( self.inputSymbol.style.width ) / 2 );
                    var newy = ( ( nfaview.states[ self.transitionToChangeName[ 0 ] ].position.y + nfaview.states[ self.transitionToChangeName[ 2 ] ].position.y ) / 2 ) + ( parseFloat( self.inputSymbol.style.height ) / 2 );
                    renderer.showAlphabet = true;
                    self.inputSymbol.style.left = '' + newx + 'px' ;
                    self.inputSymbol.style.top = '' + newy + 'px' ;
                    self.inputSymbol.type = 'text';
                    var currentVal = '';
                    for ( var symbol in nfaview.invtransitions[ self.transitionToChangeName[ 0 ] ][ self.transitionToChangeName[ 2 ] ] ) {
                        currentVal += symbol + ',';
                    }
                    currentVal = currentVal.slice(0, -1);
                    self.inputSymbol.value = currentVal;
                    self.inputSymbol.focus();
                }
            }
        } );
        document.onkeydown = function( e ) {
            switch ( e.keyCode ) {
                case 46: // delete
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
                    if ( self.transitionToChange != false ) {
                        var sigma = self.inputSymbol.value;
                        var insertOk = false;
                        var symboladded = sigma.split(',');
                        for ( var i = 0; i < symboladded.length; ++i ) {
                            symbol = symboladded[ i ];
                            if ( symbol != '' ) {
                                insertOk = nfa.addTransition( self.transitionToChange[ 0 ], symbol, self.transitionToChange[ 2 ] );
                            }
                            else {
                                insertOk = nfa.addTransition( self.transitionToChange[ 0 ], 'ε', self.transitionToChange[ 2 ] );
                            }
                        }
                        if ( insertOk ) {
                            self.inputSymbol.value = '';
                            nfa.deleteTransition( self.transitionToChange[ 0 ], self.transitionToChange[ 1 ], self.transitionToChange[ 2 ] );
                            self.errorSymbol.hidden = true;
                            self.inputSymbol.type = 'hidden';
                            renderer.showAlphabet = false;
                            self.transitionToChange = false;
                        }
                        else {
                            var newx = parseFloat( self.inputSymbol.style.left );
                            var newy = parseFloat( self.inputSymbol.style.top ) + parseFloat( self.inputSymbol.style.height ) + 8;
                            self.errorSymbol.style.left = '' + newx + 'px' ;
                            self.errorSymbol.style.top = '' + newy + 'px' ;
                            self.errorSymbol.hidden = false;
                        }
                    }
                    else if ( self.stateToChangeName != false ) {
                        var newName = self.changeStateName.value;
                        nfaview.stateName[ self.stateToChangeName ] = newName;
                        self.changeStateName.value = '';
                        self.changeStateName.type = 'hidden';
                        renderer.showAlphabet = false;
                        self.stateToChangeName = false;
                    }
                    else if ( self.transitionToChangeName != false ) {
                        var sigma = self.inputSymbol.value;
                        var insertOk = false;
                        var symboladded = sigma.split(',');
                        var newSymbol = {}
                        for ( var i = 0; i < symboladded.length; ++i ) {
                            symbol = symboladded[ i ];
                            if ( symbol != '' ) {
                                newSymbol[ symbol ] = symbol;
                                insertOk = nfa.addTransition( self.transitionToChangeName[ 0 ], symbol, self.transitionToChangeName[ 2 ] );
                            }
                            else {
                                newSymbol[ 'ε' ] = 'ε';
                                insertOk = nfa.addTransition( self.transitionToChangeName[ 0 ], 'ε', self.transitionToChangeName[ 2 ] );
                            }
                            if ( !insertOk ) {
                                break;
                            }
                        }
                        if ( insertOk ) {
                            self.inputSymbol.value = '';
                            for ( var sigma in nfaview.invtransitions[ self.transitionToChangeName[ 0 ] ][ self.transitionToChangeName[ 2 ] ] ){
                                if ( ! ( sigma in newSymbol ) ) {
                                    nfa.deleteTransition( self.transitionToChangeName[ 0 ], sigma, self.transitionToChangeName[ 2 ] );
                                }
                            }
                            self.errorSymbol.hidden = true;
                            self.inputSymbol.type = 'hidden';
                            renderer.showAlphabet = false;
                            self.elementDeselected();
                            self.transitionToChangeName = false;
                        }
                        else {
                            var newx = parseFloat( self.inputSymbol.style.left );
                            var newy = parseFloat( self.inputSymbol.style.top ) + parseFloat( self.inputSymbol.style.height ) + 8;
                            self.errorSymbol.style.left = '' + newx + 'px' ;
                            self.errorSymbol.style.top = '' + newy + 'px' ;
                            self.errorSymbol.hidden = false;
                        }
                    }
                    break;
                case 27: //escape
                    if ( self.transitionToChange != false ) {
                        self.inputSymbol.value = '';
                        nfa.deleteTransition( self.transitionToChange[ 0 ], self.transitionToChange[ 1 ], self.transitionToChange[ 2 ] );
                        self.errorSymbol.hidden = true;
                        self.inputSymbol.type = 'hidden';
                        renderer.showAlphabet = false;
                        self.transitionToChange = false;
                    }
                    else if ( self.stateToChangeName != false ) {
                        self.changeStateName.value = '';
                        self.changeStateName.type = 'hidden';
                        renderer.showAlphabet = false;
                        self.stateToChangeName = false;
                    }
                    else if ( self.transitionToChangeName != false ) {
                        self.inputSymbol.value = '';
                        self.errorSymbol.hidden = true;
                        self.inputSymbol.type = 'hidden';
                        renderer.showAlphabet = false;
                        self.transitionToChangeName = false;
                    }
                    break;
                    case 32: //space
                    if ( self.selectedElement[ 0 ] == 'state' ){
                        if ( nfa.accept[ self.selectedElement[ 1 ] ] ){
                            nfa.removeAcceptingState( self.selectedElement[ 1 ] );
                        }
                        else {
                            nfa.addAcceptingState( self.selectedElement[ 1 ] );
                        }
                    }
                    break;
                    case 82: //r -- for run
                    if ( ( self.mode != 'runMode' ) && ( !renderer.showAlphabet ) ) {
                        self.elementDeselected();
                        self.setRun( true );
                        renderer.showAlphabet = true;
                        nfa.reset();
                        nfa.input = 'abbaabba';
                    }
                    break;
                    case 34: //page down
                    if ( !nfa.nextStepByStep() ) {
                        renderer.showAlphabet = false;
                        self.setRun( false );
                    }
                    break;
            }
        };
        document.onkeyup = function( e ) {
            switch ( e.keyCode ) {
                case 16: //shift
                break;
            }
        };
        this.mainLoop();
    }
};
