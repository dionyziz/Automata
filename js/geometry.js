function Geometry() {
}

// TODO: consider changing this from a constructor function to just a namespace object

Geometry.findCycle = function( firstPoint, secondPoint, dist ) {
    //This method find the cycle tha passes throw the first and second point and 
    //has distance dist from the perpedicular

    if ( Math.abs( firstPoint.y - secondPoint.y ) > 1.E-12 ) {
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
Geometry.perpVector = function( firstPoint, secondPoint, dist ){
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

        return perpVector.scale( dist );
    }
    else {
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

        return perpVector.scale( dist );
    }
};

Geometry.prototype = {
    constructor: Geometry
};
