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
                    // TODO
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
                // TODO
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

            self.elementSelected( [ 'state', state ] );
        } );
        renderer.on( 'mousedownvoid', function( e ) {
            self.elementDeselected();
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
