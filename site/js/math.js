function Vector( x, y ) {
    this.x = x;
    this.y = y;
}
Vector.fromPolar = function( rho, theta ) {
    return new Vector( rho * Math.cos( theta ), rho * Math.sin( theta ) );
};

Vector.prototype = {
    constructor: Vector,
    plus: function( operand ) {
        return new Vector(
            this.x + operand.x, this.y + operand.y
        );
    },
    minus: function( operand ) {
        return this.plus( operand.negate() );
    },
    negate: function() {
        return new Vector( -this.x, -this.y );
    },
    length: function() {
        return Math.sqrt( this.x * this.x + this.y * this.y );
    },
    theta: function() {
        return Math.atan2( this.y, this.x );
    },
    rotate: function( angle ) {
        return Vector.fromPolar( this.length(), this.theta() + angle );
    },
    scale: function( factor ) {
        return new Vector( factor * this.x, factor * this.y );
    },
    dot : function( operand ) {
        return ( this.x * operand.x + this.y * operand.y );
    }
};
