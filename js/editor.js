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
    selectedState: false,
    mainLoop: function() {
        this.renderer.render();
        setTimeout( this.mainLoop.bind( this ), 17 );
    },
    stateSelected: function( state ) {
        if ( state != this.selectedState ) {
            this.dfaview.states[ state ].importance = 'strong';
            if ( this.selectedState != false ) {
                this.stateDeselected( this.selectedState );
            }
            this.selectedState = state;
        }
    },
    stateDeselected: function() {
        this.dfaview.states[ this.selectedState ].importance = 'normal';
        this.selectedState = false;
    },
    play: function() {
        var dfa = this.dfa;
        var renderer = this.renderer;
        var canvas = this.canvas;
        var self = this;

        dfa.on( 'statedeleted', function( state ) {
            if ( self.selectedState == state ) {
                self.selectedState = 0;
            }
        } );

        renderer.on( 'mouseoverstate', function( state ) {
            if ( !self.dragging && self.selectedState != state ) {
                dfaview.states[ state ].importance = 'emphasis';
            }
            canvas.style.cursor = 'pointer';
        } );
        function stateOut( state ) {
            if ( state != self.selectedState ) {
                dfaview.states[ state ].importance = 'normal';
            }
            canvas.style.cursor = 'default';
        }
        renderer.on( 'mouseovertransition', function( transition ) {
            canvas.style.cursor = 'pointer';
        } );
        renderer.on( 'mouseouttransition', function( transition ) {
            canvas.style.cursor = 'default';
        } );
        renderer.on( 'mouseoutstate', stateOut );
        renderer.on( 'mousedownstate', function( state, e ) {
            var x = e.clientX;
            var y = e.clientY;
            var sx = dfaview.states[ state ].position.x;
            var sy = dfaview.states[ state ].position.y;

            self.dragging = true;

            dfaview.states[ state ].zindex = self.maxz++;

            function move( e ) {
                var dx = e.clientX - x;
                var dy = e.clientY - y;

                dfaview.states[ state ].position = {
                    x: sx + dx,
                    y: sy + dy
                };
            }
            function up( e ) {
                renderer.removeListener( 'mousemove', move );
                renderer.on( 'mouseoutstate', stateOut );
                self.dragging = false;
            }
            renderer.on( 'mousemove', move );
            renderer.once( 'mouseup', up );
            renderer.removeListener( 'mouseoutstate', stateOut );

            self.stateSelected( state );
        } );
        renderer.on( 'mousedownvoid', function( e ) {
            self.stateDeselected();
        } );
        renderer.on( 'dblclick', function( e ) {
            var newState = dfaview.dfa.numStates + 1;

            dfaview.states[ dfaview.dfa.addState( newState ) ].position = {
                x: e.clientX - this.offsetLeft,
                y: e.clientY - this.offsetTop
            };
        } );
        document.onkeydown = function( e ) {
            switch ( e.keyCode ) {
                case 46: // delete
                    if ( self.selectedState != 0 ) {
                        dfa.deleteState( self.selectedState );
                    }
                    break;
            }
        };
        this.mainLoop();
    }
};
