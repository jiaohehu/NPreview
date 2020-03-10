

const {$M,$V} = require('./nitrile-preview-sylvester.js');

// Calculate the centre of the ellipse
// Based on http://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
//var x1 = 150;  // Starting x-point of the arc
//var y1 = 150;  // Starting y-point of the arc
//var x2 = 400;  // End x-point of the arc
//var y2 = 300;  // End y-point of the arc
//var fA = 1;    // Large arc flag
//var fS = 1;    // Sweep flag
//var rx = 100;  // Horizontal radius of ellipse
//var ry =  50;  // Vertical radius of ellipse
//var phi = 0;   // Angle between co-ord system and ellipse x-axes
var fA = 1;

function arcpath(x1, y1, x2, y2, rx, ry, angle, big_arc_flag) {
    var x1 = 6;
    var y1 = 10;
    var x2 = 14;
    var y2 = 10;
    var rx = 6
    var ry = 4;
    var fA = 1;
    var fS = big_arc_flag;
    var phi = angle/180.0*Math.PI;   // Angle between co-ord system and ellipse x-axes

    var Cx, Cy;

    // Step 1: Compute (x1′, y1′)
    var M = $M([
                [ Math.cos(phi), Math.sin(phi)],
                [-Math.sin(phi), Math.cos(phi)]
                ]);
    var V = $V( [ (x1-x2)/2, (y1-y2)/2 ] );
    var P = M.multiply(V);

    var x1p = P.e(1);  // x1 prime
    var y1p = P.e(2);  // y1 prime


    // Ensure radii are large enough
    // Based on http://www.w3.org/TR/SVG/implnote.html#ArcOutOfRangeParameters
    // Step (a): Ensure radii are non-zero
    // Step (b): Ensure radii are positive
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    // Step (c): Ensure radii are large enough
    var lambda = ( (x1p * x1p) / (rx * rx) ) + ( (y1p * y1p) / (ry * ry) );
    if(lambda > 1)
    {
        rx = Math.sqrt(lambda) * rx;
        ry = Math.sqrt(lambda) * ry;
    }


    // Step 2: Compute (cx′, cy′)
    var sign = (fA == fS)? -1 : 1;
    // Bit of a hack, as presumably rounding errors were making his negative inside the square root!
    if((( (rx*rx*ry*ry) - (rx*rx*y1p*y1p) - (ry*ry*x1p*x1p) ) / ( (rx*rx*y1p*y1p) + (ry*ry*x1p*x1p) )) < 1e-7)
        var co = 0;
    else
        var co = sign * Math.sqrt( ( (rx*rx*ry*ry) - (rx*rx*y1p*y1p) - (ry*ry*x1p*x1p) ) / ( (rx*rx*y1p*y1p) + (ry*ry*x1p*x1p) ) );
    var V = $V( [rx*y1p/ry, -ry*x1p/rx] );
    var Cp = V.multiply(co);

    // Step 3: Compute (cx, cy) from (cx′, cy′)
    var M = $M([
                [ Math.cos(phi), -Math.sin(phi)],
                [ Math.sin(phi),  Math.cos(phi)]
                ]);
    var V = $V( [ (x1+x2)/2, (y1+y2)/2 ] );
    var C = M.multiply(Cp).add(V);

    Cx = C.e(1);
    Cy = C.e(2);

    return [Cx,Cy];
}

module.exports = { arcpath };
