/**
 * Functions to convert coordinates:
 *
 * - Dutch Rijksdriehoek coordinates (R/D, EPSG:28992)
 * - WGS84 coordinates (latitude/longitude, EPSG:4326).
 * - Mercator meters (EPSG:54004)
 */

/**
 * Convert Rijksdriehoek (R/D) coordinates to WGS (lat/lon) coordinates.
 */

function rd2Wgs(rdX, rdY) {
    // This calculation was based from the sourcecode of Ejo Schrama's software <schrama@geo.tudelft.nl>.
    // You can find his software on: http://www.xs4all.nl/~digirini/contents/gps.html

    // Fixed constants / coefficients
    var x0 = 155000;
    var y0 = 463000;
    var k = 0.9999079;
    var bigr = 6382644.571;
    var m = 0.003773954;
    var n = 1.000475857;
    var lambda0 = 0.094032038;
    var phi0 = 0.910296727;
    var l0 = 0.094032038;
    var b0 = 0.909684757;
    var e = 0.081696831;
    var a = 6377397.155;

    // Convert RD to Bessel

    // Get radius from origin.
    d_1 = rdX - x0;
    d_2 = rdY - y0;
    r = Math.sqrt(Math.pow(d_1, 2) + Math.pow(d_2, 2));  // Pythagoras

    // Get Math.sin/Math.cos of the angle
    sa = (r != 0 ? d_1 / r : 0);  // the if prevents devision by zero.
    ca = (r != 0 ? d_2 / r : 0);

    psi = Math.atan2(r, k * 2 * bigr) * 2;   // php does (y,x), excel does (x,y)
    cpsi = Math.cos(psi);
    spsi = Math.sin(psi);

    sb = (ca * Math.cos(b0) * spsi) + (Math.sin(b0) * cpsi);
    d_1 = sb;

    cb = Math.sqrt(1 - Math.pow(d_1, 2));  // = Math.cos(b)
    b = Math.acos(cb);

    sdl = sa * spsi / cb;  // = Math.sin(dl)
    dl = Math.asin(sdl);         // delta-lambda

    lambda_1 = dl / n + lambda0;
    w = Math.log(Math.tan((b / 2) + (Math.PI / 4)));
    q = (w - m) / n;

    // Create first phi and delta-q
    phiprime = (Math.atan(Math.exp(q)) * 2) - (Math.PI / 2);
    dq_1 = (e / 2) * Math.log((e * Math.sin(phiprime) + 1) / (1 - e * Math.sin(phiprime)));
    phi_1 = (Math.atan(Math.exp(q + dq_1)) * 2) - (Math.PI / 2);

    // Create new phi with delta-q
    dq_2 = (e / 2) * Math.log((e * Math.sin(phi_1) + 1) / (1 - e * Math.sin(phi_1)));
    phi_2 = (Math.atan(Math.exp(q + dq_2)) * 2) - (Math.PI / 2);

    // and again..
    dq_3 = (e / 2) * Math.log((e * Math.sin(phi_2) + 1) / (1 - e * Math.sin(phi_2)));
    phi_3 = (Math.atan(Math.exp(q + dq_3)) * 2) - (Math.PI / 2);

    // and again...
    dq_4 = (e / 2) * Math.log((e * Math.sin(phi_3) + 1) / (1 - e * Math.sin(phi_3)));
    phi_4 = (Math.atan(Math.exp(q + dq_4)) * 2) - (Math.PI / 2);

    // radians to degrees
    lambda_2 = lambda_1 / Math.PI * 180;  //
    phi_5 = phi_4 / Math.PI * 180;


    // Bessel to wgs84 (lat/lon)
    dphi = phi_5 - 52;   // delta-phi
    dlam = lambda_2 - 5;   // delta-lambda

    phicor = (-96.862 - (dphi * 11.714) - (dlam * 0.125)) * 0.00001; // correction factor?
    lamcor = ((dphi * 0.329) - 37.902 - (dlam * 14.667)) * 0.00001;

    phiwgs = phi_5 + phicor;
    lamwgs = lambda_2 + lamcor;


    // Return as anonymous object
    return [phiwgs, lamwgs];
}

/**
 * Convert WGS (lat/lon) coordinates to Rijksdriehoek (R/D) coordinates.
 */
function wgs2Rd(lat, lon) {
    // Fixed constants / coefficients
    x0 = 155000;
    y0 = 463000;
    k = 0.9999079;
    bigr = 6382644.571;
    m = 0.003773954;
    n = 1.000475857;
    lambda0 = 0.094032038;
    phi0 = 0.910296727;
    l0 = 0.094032038;
    b0 = 0.909684757;
    e = 0.081696831;
    a = 6377397.155;

    // wgs84 to bessel
    dphi = lat - 52;
    dlam = lon - 5;

    phicor = ( -96.862 - dphi * 11.714 - dlam * 0.125 ) * 0.00001;
    lamcor = ( dphi * 0.329 - 37.902 - dlam * 14.667 ) * 0.00001;

    phibes = lat - phicor;
    lambes = lon - lamcor;

    // bessel to rd
    phi = phibes / 180 * Math.PI;
    lambda = lambes / 180 * Math.PI;
    qprime = Math.log(Math.tan(phi / 2 + Math.PI / 4));
    dq = e / 2 * Math.log(( e * Math.sin(phi) + 1 ) / ( 1 - e * Math.sin(phi) ));
    q = qprime - dq;

    w = n * q + m;
    b = Math.atan(Math.exp(w)) * 2 - Math.PI / 2;
    dl = n * ( lambda - lambda0 );

    d_1 = Math.sin(( b - b0 ) / 2);
    d_2 = Math.sin(dl / 2);

    s2psihalf = d_1 * d_1 + d_2 * d_2 * Math.cos(b) * Math.cos(b0);
    cpsihalf = Math.sqrt(1 - s2psihalf);
    spsihalf = Math.sqrt(s2psihalf);
    tpsihalf = spsihalf / cpsihalf;

    spsi = spsihalf * 2 * cpsihalf;
    cpsi = 1 - s2psihalf * 2;

    sa = Math.sin(dl) * Math.cos(b) / spsi;
    ca = ( Math.sin(b) - Math.sin(b0) * cpsi ) / ( Math.cos(b0) * spsi );

    r = k * 2 * bigr * tpsihalf;
    x = r * sa + x0;
    y = r * ca + y0;

    // Return as anonymous object.
    return [x, y];
}


