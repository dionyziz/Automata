function NFAEditor( canvas, dfaview ) {
    this.canvas = canvas;
    this.nfaview = nfaview;
    this.nfa = nfaview.nfa;
    this.renderer = new NFARenderer( this.canvas, this.nfaview );
}
NFAEditor.prototype = {
    constructor: 'Editor',
    dragging: false,
    maxz: 1,
    selectedElement: false,
    stateFromSelected: false,
    stateToSelected: false,
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
                    this.nfaview.transitions[ id[ 0 ] ][ id[ 1 ] ][ id[ 2 ] ].importance = 'strong';
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
                this.nfaview.transitions[ id[ 0 ] ][ id[ 1 ] ][ id[ 2 ] ].importance = 'normal';
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
            if ( !self.dragging && !self.isStateSelected( state ) ) {
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
            }
            canvas.style.cursor = 'pointer';
        } );
        function transitionOut( transition ) {
            if ( !self.isTransitionSelected( transition ) ) {
                nfaview.transitions[ transition[ 0 ] ][ transition[ 1 ] ][ transition[ 2 ] ].importance = 'normal';
            }
            canvas.style.cursor = 'default';
        }
        renderer.on( 'mouseouttransition', transitionOut );
        renderer.on( 'mouseoutstate', stateOut );
        renderer.on( 'mouseoutalphabet', alphabetOut );
        renderer.on( 'mousedownstate', function( state, e ) {
            if ( self.stateFromSelected == false ){
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

                self.elementSelected( [ 'state', state ] );
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
            var transitionView = nfaview.transitions[ transition[ 0 ] ][ transition[ 1 ] ][ transition[ 2 ] ];
            var oldClient = new Vector( e.clientX, e.clientY );
            var from = self.nfaview.states[ transition[ 0 ] ].position;
            var to = self.nfaview.states[ self.nfaview.nfa.transitions[ transition[ 0 ] ][ transition[ 1 ] ][ transition[ 2 ] ] ].position;
            var angle = from.minus( to ).theta();
            var s = to.plus( Vector.fromPolar( this.STATE_RADIUS, angle ) );

            self.dragging = true;

            nfaview.states[ transition[ 0 ] ].zindex = self.maxz++;

            function move( e ) {
                var client = new Vector( e.clientX, e.clientY )
                var d = client.minus( oldClient );

                transitionView.position = s.plus( d );

                var test = renderer.hitTest( client.minus( renderer.offset ) );
                if ( test[ 0 ] == 'state' ) {
                    transitionView.detached = false;
                    nfaview.nfa.deleteTransition( transition[ 0 ], transition[ 1 ], transition[ 2 ] );
                    nfaview.nfa.addTransition( transition[ 0 ], transition[ 1 ], test[ 1 ] );
                    transition[ 2 ] = test[ 1 ];
                    self.elementDeselected();
                }
                else {
                    transitionView.detached = true;
                }
            }
            function up( e ) {
                renderer.removeListener( 'mousemove', move );
                renderer.on( 'mouseoutstate', stateOut );
                renderer.on( 'mouseouttransition', transitionOut );
                self.dragging = false;
                transitionView.detached = false;
                canvas.style.cursor = 'default';
            }
            renderer.on( 'mousemove', move );
            renderer.once( 'mouseup', up );
            renderer.removeListener( 'mouseoutstate', stateOut );
            renderer.removeListener( 'mouseouttransition', transitionOut );

            self.elementSelected( [ 'transition', transition ] );
        } );
        renderer.on( 'mousedownvoid', function( e ) {
            self.elementDeselected();
        } );
        renderer.on( 'dblclick', function( e ) {
            var newState = nfaview.nfa.numStates + 1;

            nfaview.states[ nfaview.nfa.addState( newState ) ].position = new Vector(
                e.clientX - this.offset.x,
                e.clientY - this.offset.y
            );
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
                            // TODO
                            nfa.deleteTransition( self.selectedElement[ 1 ][ 0 ], self.selectedElement[ 1 ][ 1 ], self.selectedElement[ 1 ][ 2 ] );
                            break;
                    }
                    break;
                case 16: //shift
                    if ( self.selectedElement == false ){
                        return;
                    }
                    if ( self.selectedElement[ 0 ] == 'state' ){
                        if ( self.stateFromSelected == false ) {
                            self.stateFromSelected = self.selectedElement[ 1 ];
                        }
                    }
                    break;
            }
        };
        document.onkeyup = function( e ) {
            switch ( e.keyCode ) {
                case 16: //shift
                    if ( self.stateToSelected == false ) {
                        self.stateFromSelected = false;
                    }
            }
        };
        this.mainLoop();
    }
};
