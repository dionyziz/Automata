function same( a, b ) {
    if ( typeof a != typeof b ) {
        return false;
    }
    if ( a instanceof Array ) {
        if ( a.length != b.length ) {
            return false;
        }
        for ( var i = 0; i < a.length; ++i ) {
            if ( !same( a[ i ], b[ i ] ) ) {
                return false;
            }
        }
        return true;
    }
    return a == b;
}

Object.defineProperty( Function.prototype, "inherit", {
    /**
     * @this {Function}
     *
     * Implementation of classical inheritance. I use the defineProperty method on the
     * Object.prototype in order to make it non-enumerable. If set directly it breaks all
     * the "for( i in obj )" loops
    */
    value: function() {
        var method, l = arguments.length;

        while ( l-- ) {
            var parent = arguments[ l ];

            //Continue with the overriding handling
            for ( method in parent.prototype ) {
                //Every prototype has the property constructor. No need to override.
                if ( method == 'constructor' ) {
                    continue;
                }
                /* If a parent method is overrided provide a way to call it by setting
                 * the ParentClass_overridedMethod method on child's prototype
                 */
                var propertyDescriptor = Object.getOwnPropertyDescriptor( parent.prototype, method );
                if ( propertyDescriptor !== null ) {
                    if ( this.prototype.hasOwnProperty( method ) ) {
                        Object.defineProperty( this.prototype, parent.name + '_' + method, propertyDescriptor  );
                    }
                    else {
                        Object.defineProperty( this.prototype, method, propertyDescriptor );
                    }
                }
            }
        }

        var propertiesObject = {};
        for ( method in this.prototype ) {
            propertiesObject[ method ] = Object.getOwnPropertyDescriptor( this.prototype, method );
        }

        this.prototype = Object.create( arguments[ 0 ].prototype, propertiesObject );
    }
} );
