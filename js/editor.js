function Editor( canvas, dfaview ) {
    this.canvas = canvas;
    this.dfaview = dfaview;
    this.dfa = dfaview.dfa;
    this.renderer = new Renderer( this.canvas, this.dfaview );
}
Editor.prototype = {
    constructor: 'Editor',
    dragging: false,
    maxz: 1,
    selectedElement: false,
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
                    this.dfaview.states[ id ].importance = 'strong';
                    break;
                case 'transition':
                    this.dfaview.transitions[ id[ 0 ] ][ id[ 1 ] ].importance = 'strong';
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
                this.dfaview.states[ id ].importance = 'normal';
                break;
            case 'transition':
                this.dfaview.transitions[ id[ 0 ] ][ id[ 1 ] ].importance = 'normal';
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
        var dfa = this.dfa;
        var renderer = this.renderer;
        var canvas = this.canvas;
        var self = this;

        dfa.on( 'statedeleted', function( state ) {
            if (    self.selectedElement[ 0 ] == 'state'
                 && self.selectedElement[ 1 ] == state ) {
                self.selectedElement = false;
            }
        } );
        renderer.on( 'mouseoverstate', function( state ) {
            if ( !self.dragging && !self.isStateSelected( state ) ) {
                dfaview.states[ state ].importance = 'emphasis';
            }
            canvas.style.cursor = 'pointer';
        } );
        function stateOut( state ) {
            if ( !self.isStateSelected( state ) ) {
                dfaview.states[ state ].importance = 'normal';
            }
            canvas.style.cursor = 'default';
        }
        renderer.on( 'mouseovertransition', function( transition ) {
            if ( !self.dragging && !self.isTransitionSelected( transition ) ) {
                dfaview.transitions[ transition[ 0 ] ][ transition[ 1 ] ].importance = 'emphasis';
            }
            canvas.style.cursor = 'pointer';
        } );
        function transitionOut( transition ) {
            console.log( 'Transition out ' + transition[ 0 ] + ' (' + transition[ 1 ] + ')' );
            if ( !self.isTransitionSelected( transition ) ) {
                dfaview.transitions[ transition[ 0 ] ][ transition[ 1 ] ].importance = 'normal';
            }
            canvas.style.cursor = 'default';
        }
        renderer.on( 'mouseouttransition', transitionOut );
        renderer.on( 'mouseoutstate', stateOut );
        renderer.on( 'mousedownstate', function( state, e ) {
            var client = new Vector( e.clientX, e.clientY );
            var s = dfaview.states[ state ].position;

            self.dragging = true;

            dfaview.states[ state ].zindex = self.maxz++;

            function move( e ) {
                var newClient = new Vector( e.clientX, e.clientY );
                var d = newClient.minus( client );
                dfaview.states[ state ].position = s.plus( d );
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
        } );
        renderer.on( 'mousedowntransition', function( transition, e ) {
            var transitionView = dfaview.transitions[ transition[ 0 ] ][ transition[ 1 ] ];
            var oldClient = new Vector( e.clientX, e.clientY );
            var from = self.dfaview.states[ transition[ 0 ] ].position;
            var to = self.dfaview.states[ self.dfaview.dfa.transitions[ transition[ 0 ] ][ transition[ 1 ] ] ].position;
            var angle = from.minus( to ).theta();
            var s = to.plus( Vector.fromPolar( this.STATE_RADIUS, angle ) );

            self.dragging = true;

            transitionView.zindex = self.maxz++;

            function move( e ) {
                var client = new Vector( e.clientX, e.clientY )
                var d = client.minus( oldClient );

                transitionView.position = s.plus( d );

                var test = renderer.hitTest( client.minus( renderer.offset ) );
                console.log( test[ 0 ] + '/' + test[ 1 ] );
                if ( test[ 0 ] == 'state' ) {
                    transitionView.detached = false;
                    dfaview.dfa.transitions[ transition[ 0 ] ][ transition[ 1 ] ] = test[ 1 ];
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
            var newState = dfaview.dfa.numStates + 1;

            dfaview.states[ dfaview.dfa.addState( newState ) ].position = new Vector(
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
                            dfa.deleteState( self.selectedElement[ 1 ] );
                            break;
                        case 'transition':
                            // TODO
                            break;
                    }
                    break;
            }
        };
        this.mainLoop();
    }
};
