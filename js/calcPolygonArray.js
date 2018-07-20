function calculatePolygonArray(locatieDataRow) {
    let geomPointsArray;
    if (locatieDataRow['geom'].includes('MULTIPOLYGON')) {
        // MultiPolygon
        let a = locatieDataRow['geom'].substring(14, (locatieDataRow['geom'].length - 3));
        a = a.replace(/[((]+/g, '');
        let b = a.split(")),");
        // b is now all of the geoms.
        // for every geom array in b -> split to points and add the points to the array.
        let hardPolyArray = [];
        for (let i = 0; i < b.length; i++) {
            geomPointsArray = b[i].split(",");
            let polyArray = [];
            for (let y = 0; y < geomPointsArray.length; y++) {
                // Grab the individual location points and write to array.
                let splitGeom = '';
                if (geomPointsArray[y][0] === " ") {
                    splitGeom = geomPointsArray[y].substring(1, geomPointsArray[y].length);
                } else {
                    splitGeom = geomPointsArray[y];
                }
                splitGeom = splitGeom.split(" ");

                let geomEast = splitGeom[0];
                let geomWest = splitGeom[1];

                polyArray.push([parseInt(geomEast), parseInt(geomWest)]);
            }
            hardPolyArray.push(polyArray);
        }
        return hardPolyArray;
    } else {
        // Normal Polygon
        geomPointsArray = locatieDataRow['geom'].substring(10, (locatieDataRow['geom'].length - 2)).split(",");
        let polyArray = [];
        for (let y = 0; y < geomPointsArray.length; y++) {
            let splitGeom = '';
            if (geomPointsArray[y][0] === " ") {
                splitGeom = geomPointsArray[y].substring(1, geomPointsArray[y].length);
            } else {
                splitGeom = geomPointsArray[y];
            }
            splitGeom = splitGeom.split(" ");

            let geomEast = splitGeom[0];
            let geomWest = splitGeom[1];

            polyArray.push([parseInt(geomEast), parseInt(geomWest)]);
        }
        let hardPolyArray = [];
        hardPolyArray.push(polyArray);
        return hardPolyArray;
    }
}