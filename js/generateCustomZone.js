/**
 * Created by Cyriel on 25-6-2018.
 */
function generateCustomZone(results) {
    let ECoordLowerBound = East;
    let NCoordLowerBound = North;
    let ECoordHigherBound = +ECoordLowerBound + hvZoneEastIncrease;
    let NCoordHigherBound = +NCoordLowerBound + hvZoneNorthIncrease;
    let rowsForCustomKmZone = [];

    for (let [key, value] of results.entries()) {
        let Ebound = +key.split("E")[1].split("N")[0];
        let Nbound = +key.split("E")[1].split("N")[1];
        if ((Ebound >= ECoordLowerBound && Ebound <= ECoordHigherBound) && (Nbound >= NCoordLowerBound && Nbound <= NCoordHigherBound)) {
            value['6mm-hv-100m-id'] = key;
            rowsForCustomKmZone.push(value);
        }
    }

    if (rowsForCustomKmZone.length > 0) {
        calculateAEDZone(rowsForCustomKmZone);
    } else {
        console.log('Geen data voor :' + 'E' + East + 'N' + North);
    }
}

function calculateAEDZone(results) {
    // calculate points for aed zone per given AED.
    console.log("Hartveiligheid zone's berekenen...");
    let customKmZoneData = results;

    let ref_nrk_aed_locations = [];
    let aedLocations = [];

    const aedChecks = ['aantal-reg-aed-n24', 'aantal-reg-aed-24', 'aantal-meld-aed-n24', 'aantal-meld-aed-24'];
    for (let f = 0; f < customKmZoneData.length; f++) {
        for (let i = 0; i < aedChecks.length; i++) {
            // add data for aed-ref
            if (customKmZoneData[f]['aantal-meld-aed-n24'] > 0 || customKmZoneData[f]['aantal-meld-aed-24'] > 0) {
                ref_nrk_aed_locations.push(customKmZoneData[f]);
            }

            if (customKmZoneData[f][aedChecks[i]] > 0) {
                aedLocations.push(customKmZoneData[f]);
                break;
            }
        }
    }

    // Add data for REF-AED-NRK
    const refHeaderData = 'aed-ref-100m-id;nrk-aed-id;naam;adres;postcode;woonplaats;coordinaten;beschikbaarheid;tot-inw-dek;extra-inw-dek';
    let csvRows = [];
    for (let y = 0; y < REF_AED_NRK_SOURCE.length; y++) {
        csvRows.push([
            REF_AED_NRK_SOURCE[y]['6mm-aed-nrk-100m-id'],
            REF_AED_NRK_SOURCE[y]['nrk-aed-id'],
            REF_AED_NRK_SOURCE[y]['naam'],
            REF_AED_NRK_SOURCE[y]['adres'],
            REF_AED_NRK_SOURCE[y]['postcode'],
            REF_AED_NRK_SOURCE[y]['woonplaats'],
            REF_AED_NRK_SOURCE[y]['coordinaten'],
            REF_AED_NRK_SOURCE[y]['beschikbaarheid'],
            "0",
            "0"]);
        REF_AED_NRK_SOURCE.splice(y, 1);
        y--;
    }

    REF_AED_NRK_SOURCE = null;

    let csvObject = createCsvObject(refHeaderData, csvRows);

    REF_AED_NRK = Papa.parse(csvObject, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true
    });

    function drawCircle(xc, yc, r) {
        if (r < 1) return;
        let zoom = 1;
        let points = [];

        let xoff = 0,
            yoff = r,
            b = -r,
            p0, p1, w0, w1;

        while (xoff <= yoff) {
            p0 = xc - xoff;
            p1 = xc - yoff;
            w0 = xoff + xoff;
            w1 = yoff + yoff;

            hl(p0, yc - yoff, yc + yoff, w0);  // fill a "line"
            hl(p1, yc - xoff, yc + xoff, w1);

            if ((b += xoff++ + xoff) >= 0) {
                b -= --yoff + yoff;
            }
        }

        // for fill
        function hl(x, y1, y2, w) {
            w++;
            let xw = 0;
            while (w--) {
                xw = x + w;
                setPixel(xw, y1);
                setPixel(xw, y2);
            }
        }

        function setPixel(x, y) {
            points.push([x * zoom, y * zoom]);
        }

        return points;
    }

    const locationsMap = new Map();

    // For every aed draw hv zone and push to array.
    let points = drawCircle(0, 0, hvRadius);
    let ref_aed_nrk_locations_map = new Map();

    console.log("AED-Punten berekenen...");

    for (let f = 0; f < aedLocations.length; f++) {
        let Ebound = aedLocations[f]['6mm-hv-100m-id'].split("E")[1].split("N")[0];
        let Nbound = aedLocations[f]['6mm-hv-100m-id'].split("E")[1].split("N")[1];

        let isreg = 'nee';
        let isreg24 = 'nee';

        let ismeld = 'nee';
        let ismeld24 = 'nee';

        if (aedLocations[f]['aantal-reg-aed-24'] > 0) {
            isreg24 = 'ja';
        }

        if (aedLocations[f]['aantal-reg-aed-n24'] > 0) {
            isreg = 'ja';
        }

        if (aedLocations[f]['aantal-meld-aed-24'] > 0) {
            ismeld24 = 'ja';
        }

        if (aedLocations[f]['aantal-meld-aed-n24'] > 0) {
            ismeld = 'ja';
        }

        let ref_aed_nrk_location_points_set = new Set();

        for (let i = 0; i < points.length; i++) {
            let newEbound = +Ebound + points[i][0];
            let newNbound = +Nbound + points[i][1];
            let newLocation = ('E' + newEbound + 'N' + newNbound);

            ref_aed_nrk_location_points_set.add(newLocation);

            // Check if map has newLocation
            if (!locationsMap.has(newLocation)) {
                // if map does not have location add location
                let provcode = getProvincieCode(newLocation);
                let gemeentecode = getGemeenteCode(newLocation);
                let wijkcode = getWijkCode(newLocation, gemeentecode);
                let buurtcode = getBuurtCode(newLocation, wijkcode);
                let pc4code = getPc4Code(wijkcode, buurtcode);
                let wgsLoc = rd2Wgs(newLocation.split("E")[1].split("N")[0] * 100, newLocation.split("E")[1].split("N")[1] * 100).join();

                locationsMap.set(newLocation, {
                    '6mm-hv-100m-wgs': wgsLoc,
                    'aantal-reg-aed-n24': 0,
                    'reg-aed-dek': isreg,
                    'aantal-reg-aed-24': 0,
                    'reg-aed24-dek': isreg24,
                    'aantal-meld-aed-n24': 0,
                    'meld-aed-dek': ismeld,
                    'aantal-meld-aed-24': 0,
                    'meld-aed24-dek': ismeld24,
                    'extra-inw-dek': 0,
                    'aantal-inwoners': 0,
                    'provincie-code': provcode,
                    'gemeente-code': gemeentecode,
                    'wijk-code': wijkcode,
                    'buurt-code': buurtcode,
                    'pc4-code': pc4code
                });

                // Set the ref map
                ref_aed_nrk_locations_map.set(aedLocations[f]['6mm-hv-100m-id'], ref_aed_nrk_location_points_set);
            } else {
                // if map has location check if dek can be overwritten
                let tempValues = locationsMap.get(newLocation);
                if (tempValues['reg-aed24-dek'] === 'nee' && isreg24 === 'ja') {
                    tempValues['reg-aed24-dek'] = 'ja';
                }

                if (tempValues['reg-aed-dek'] === 'nee' && isreg === 'ja') {
                    tempValues['reg-aed-dek'] = 'ja';
                }

                if (tempValues['meld-aed24-dek'] === 'nee' && ismeld24 === 'ja') {
                    tempValues['meld-aed24-dek'] = 'ja';
                }

                if (tempValues['meld-aed-dek'] === 'nee' && ismeld === 'ja') {
                    tempValues['meld-aed-dek'] = 'ja';
                }
                locationsMap.set(newLocation, tempValues);
            }
        }
        // Set the ref map
        ref_aed_nrk_locations_map.set(aedLocations[f]['6mm-hv-100m-id'], ref_aed_nrk_location_points_set);
        if (f % 250 === 0) {
            console.log(f + '/' + aedLocations.length);
        }
    }

    console.log("Klaar met het berekenen van AED-Punten");

    for (let i = 0; i < customKmZoneData.length; i++) {
        if (locationsMap.has(customKmZoneData[i]['6mm-hv-100m-id'])) {
            let values = locationsMap.get(customKmZoneData[i]['6mm-hv-100m-id']);
            customKmZoneData[i]["reg-aed-dek"] = values['reg-aed-dek'];
            customKmZoneData[i]["reg-aed24-dek"] = values['reg-aed24-dek'];
            customKmZoneData[i]["meld-aed-dek"] = values['meld-aed-dek'];
            customKmZoneData[i]["meld-aed24-dek"] = values['meld-aed24-dek'];
            locationsMap.delete(customKmZoneData[i]['6mm-hv-100m-id']);
        }
    }

    // Add the remaining aed points.
    console.log("AED punten aan dataset toevoegen....");
    let counter = 0;
    for (let [key, value] of locationsMap.entries()) {
        // Add the aed locations that have no inwoners data.
        let provcode = getProvincieCode(key);
        let gemeentecode = getGemeenteCode(key);
        let wijkcode = getWijkCode(key, gemeentecode);
        let buurtcode = getBuurtCode(key, wijkcode);
        let pc4code = getPc4Code(wijkcode, buurtcode);
        let wgsLoc = rd2Wgs(key.split("E")[1].split("N")[0] * 100, key.split("E")[1].split("N")[1] * 100).join();

        customKmZoneData.push({
            '6mm-hv-100m-id': key,
            '6mm-hv-100m-wgs': wgsLoc,
            'aantal-reg-aed-n24': value['aantal-reg-aed-n24'],
            'reg-aed-dek': value['reg-aed-dek'],
            'aantal-reg-aed-24': value['aantal-reg-aed-24'],
            'reg-aed24-dek': value['reg-aed24-dek'],
            'aantal-meld-aed-n24': value['aantal-meld-aed-n24'],
            'meld-aed-dek': value['meld-aed-dek'],
            'aantal-meld-aed-24': value['aantal-meld-aed-24'],
            'meld-aed24-dek': value['meld-aed24-dek'],
            'extra-inw-dek': 0,
            'aantal-inwoners': 0,
            'provincie-code': provcode,
            'gemeente-code': gemeentecode,
            'wijk-code': wijkcode,
            'buurt-code': buurtcode,
            'pc4-code': pc4code
        });
        counter++;
        if (counter % 2500 === 0) {
            console.log(counter + '/' + locationsMap.size);
        }
    }

    // AED ref adding inwoners
    if (NRK_AED_Ontvangen) {
        console.log("AED REF bestand genereren...");
        // AED ref adding inwoners
        for (let [key, value] of ref_aed_nrk_locations_map.entries()) {
            let totaal_inwoners_Counter = 0;
            let extra_inwoners_Counter = 0;
            // for every location around aed

            for (let item of value) {
                // add inwoners to counter
                for (let i = 0; i < customKmZoneData.length; i++) {
                    if (customKmZoneData[i]['6mm-hv-100m-id'] === item) {
                        totaal_inwoners_Counter += +customKmZoneData[i]['aantal-inwoners'];
                        if (customKmZoneData[i]['reg-aed-dek'] === 'nee' && customKmZoneData[i]['reg-aed24-dek'] === 'nee') {
                            if (customKmZoneData[i]['meld-aed-dek'] === 'ja' || customKmZoneData[i]['meld-aed24-dek'] === 'ja') {
                                extra_inwoners_Counter += +customKmZoneData[i]['aantal-inwoners'];
                            }
                        }
                    }
                }
            }
            
            for (let i = 0; i < REF_AED_NRK['data'].length; i++) {
                if (REF_AED_NRK['data'][i]['aed-ref-100m-id'] === key) {
                    REF_AED_NRK['data'][i]['tot-inw-dek'] = totaal_inwoners_Counter;
                    REF_AED_NRK['data'][i]['extra-inw-dek'] = extra_inwoners_Counter;
                }
            }
        }
        generateCsvFile(REF_AED_NRK, 'REF-AED-NRK');
    }

    // add extra inw dek
    for (let i = 0; i < REF_AED_NRK['data'].length; i++) {
        let key = REF_AED_NRK['data'][i]['aed-ref-100m-id'];
        for (let y = 0; y < customKmZoneData.length; y++) {
            if (customKmZoneData[y]['6mm-hv-100m-id'] === key) {
                customKmZoneData[y]['extra-inw-dek'] = REF_AED_NRK['data'][i]['extra-inw-dek'];
            }
        }
    }

    // clear all location data
    completeProvincieArray = null;
    completeGemeenteArray = null;
    gemeenteWijkMap = null;
    gemeenteData = null;
    wijkBuurtMap = null;
    pc4RefMap = null;

    csvRows = [];

    for (let item of customKmZoneData) {
        csvRows.push([item['6mm-hv-100m-id'],
            item['6mm-hv-100m-wgs'],
            item['aantal-reg-aed-n24'],
            item['reg-aed-dek'],
            item['aantal-reg-aed-24'],
            item['reg-aed24-dek'],
            item['aantal-meld-aed-n24'],
            item['meld-aed-dek'],
            item['aantal-meld-aed-24'],
            item['meld-aed24-dek'],
            item['extra-inw-dek'],
            item['aantal-inwoners'],
            item['provincie-code'],
            item['gemeente-code'],
            item['wijk-code'],
            item['buurt-code'],
            item['pc4-code']]);
    }

    customZoneCsvOntvangenVariable = true;
    let provnaam = provincieRefMap.get(customZoneProvcodeLock);
    const headerData = "6mm-hv-100m-id;6mm-hv-100m-wgs;aantal-reg-aed-n24;reg-aed-dek;aantal-reg-aed-24;reg-aed24-dek;aantal-meld-aed-n24;meld-aed-dek;aantal-meld-aed-24;meld-aed24-dek;extra-inw-dek;aantal-inwoners;provincie-code;gemeente-code;wijk-code;buurt-code;pc4-code";
    let customcsvObject = createCsvObject(headerData, csvRows);
    generateCsvFileFromCSVRows(customcsvObject, ('AED-' + provnaam));
    generateGeoJson(customcsvObject);
}