function Vector( x, y ) {
    this.x = x;
    this.y = y;
}
Vector.fromPolar = function( rho, theta ) {
    return new Vector( rho * Math.cos( theta ), rho * Math.sin( theta ) );
};
Vector.findCycle = function( firstPoint, secondPoint, dist ) {
    //This method find the cycle tha passes throw the first and second point and 
    //has distance dist from the perpedicular

    if ( firstPoint.y != secondPoint.y ) {
        //find the perpedicular line in the form : y = perpSlope * x + perpConst
        var middlePoint = new Vector( ( firstPoint.x + secondPoint.x ) / 2, ( firstPoint.y + secondPoint.y ) / 2 );
        var perpSlope = ( secondPoint.x - firstPoint.x ) / ( firstPoint.y - secondPoint.y );
        var perpConst = middlePoint.y - ( perpSlope * middlePoint.x );

        //find the third point from the perp line and dist
        var perpFirPoint = middlePoint;
        if ( firstPoint.x <= secondPoint.x ) {
            if ( firstPoint.y < secondPoint.y ) {
                var add = 10;
            }
            else{
                var add = -10;
            }
        }
        else {
            if ( firstPoint.y < secondPoint.y ) {
                var add = 10;
            }
            else{
                var add = -10;
            }
        }

        var perpSecPoint = new Vector( middlePoint.x + add, perpSlope * ( middlePoint.x + add ) + perpConst );
        var perpVector = new Vector( perpSecPoint.x - perpFirPoint.x, perpSecPoint.y - perpFirPoint.y );
        var lenV = perpVector.length();
        perpVector = perpVector.scale( 1 / lenV );
        var thirdPoint = perpVector.scale( dist ).plus( middlePoint );

        //find the perpedicular between second and third point in the form : y = secPerpSlope * x + secPerpConst
        var secMiddlePoint = new Vector ( ( secondPoint.x + thirdPoint.x ) / 2, ( secondPoint.y + thirdPoint.y ) / 2 );
        var secPerpSlope = ( secondPoint.x - thirdPoint.x ) / ( thirdPoint.y - secondPoint.y );
        var secPerpConst = secMiddlePoint.y - ( secPerpSlope * secMiddlePoint.x );

        //find the center of the cycle
        var centerx = ( secPerpConst - perpConst ) / ( perpSlope - secPerpSlope );
        var centery = perpSlope * centerx + perpConst;
        var center = new Vector( centerx, centery );
        var radius = firstPoint.minus( center ).length();

        return [ center, radius ];
    }
    else{
        var perpConst = ( firstPoint.x + secondPoint.x ) / 2;
        var middlePoint = new Vector( perpConst, firstPoint.y );
        var perpFirPoint = middlePoint;
        if ( firstPoint.x > secondPoint.x ) {
            var add = 10;
        }
        else{
            var add = -10;
        }
        var perpSecPoint = new Vector( middlePoint.x, ( middlePoint.y + add ) );
        var perpVector = new Vector( perpSecPoint.x - perpFirPoint.x, perpSecPoint.y - perpFirPoint.y );
        var lenV = perpVector.length();
        perpVector = perpVector.scale( 1 / lenV );
        var thirdPoint = perpVector.scale( dist ).plus( middlePoint );

        //find the perpedicular between second and third point in the form : y = secPerpSlope * x + secPerpConst
        var secMiddlePoint = new Vector ( ( secondPoint.x + thirdPoint.x ) / 2, ( secondPoint.y + thirdPoint.y ) / 2 );
        var secPerpSlope = ( secondPoint.x - thirdPoint.x ) / ( thirdPoint.y - secondPoint.y );
        var secPerpConst = secMiddlePoint.y - ( secPerpSlope * secMiddlePoint.x );

        //find the center of the cycle
        var centerx = middlePoint.x;
        var centery = secPerpSlope * centerx + secPerpConst;
        var center = new Vector( centerx, centery );
        var radius = firstPoint.minus( center ).length();

        return [ center, radius ];
    }
};
Vector.innerProduct = function( firstVector, secondVector ) {
    return ( firstVector.x * secondVector.x + firstVector.y * secondVector.y );
};

Vector.prototype = {
    constructor: 'Vector',
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
};
