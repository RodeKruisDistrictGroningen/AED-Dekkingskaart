// ##################### Configuratie #######################
// Startpoint (links-onder) voor data zone.
const East = 2000;
const North = 5300;

// Groote van de custom aed zone * 100 in m.
const hvZoneEastIncrease = 800;
const hvZoneNorthIncrease = 800;

// Nummer van de provincie waarvan de data moet worden meegenomen in de dataset
// Bovenstaande custom zone moet wel binnen het bereik van (een deel van) de provincie zitten
// 0 invullen voor alle data binnen zone (ongeacht provincie).
const customZoneProvcodeLock = 2;

// Grootte van hv zone per aed * 100m (cirkels)
const hvRadius = 4;

// Grensdataset genereren?
const generateGrensDataset = false;

// ###########################################################

// Referentiemap die gebruikt wordt om namen aan een nummer te koppelen.
const provincieRefMap = new Map();
provincieRefMap.set(0, "Custom-Zone");
provincieRefMap.set(1, "Noord-Holland");
provincieRefMap.set(2, "Groningen");
provincieRefMap.set(3, "Overijssel");
provincieRefMap.set(4, "Zeeland");
provincieRefMap.set(5, "Friesland");
provincieRefMap.set(6, "Drenthe");
provincieRefMap.set(7, "Flevoland");
provincieRefMap.set(8, "Utrecht");
provincieRefMap.set(9, "Zuid-Holland");
provincieRefMap.set(10, "Limburg");
provincieRefMap.set(11, "Gelderland");
provincieRefMap.set(12, "Noord-Brabant");

// Waarden die tijdelijk in memory worden opgeslagen.
let MM_AED_HSN = [];
let MM_AED_NRK = [];
let MM_INW_CBS = [];
let MM_GRENS_CBS = [];
let MM_HV = [];
let REF_AED_NRK = [];
let REF_AED_NRK_SOURCE = [];

let completeProvincieArray = [];
let completeGemeenteArray = [];

let gemeenteWijkMap = new Map();
let gemeenteData = [];

let wijkBuurtMap = new Map();
let pc4RefMap = new Map();

// Array met de namen van alle bestanden die nog gesorteerd/verwerkt moeten worden.
let sortfileArray = [];

let inwonersontvangenVariable = false;
let NRK_AED_Ontvangen = false;
let HSN_AED_Ontvangen = false;

let provincieDataOntvangenVariable = false;
let buurtDataOntvangenVariable = false;
let wijkDataOntvangenVariable = false;
let gemeenteDataOntvangenVariable = false;

let hvontvangenVariable = false;
let grensdataOntvangenVariabele = false;
let customZoneCsvOntvangenVariable = false;

function checkIfHvCanBeGenerated() {
    if (hvontvangenVariable && sortfileArray.length === 0) {
        console.log("Alle files zijn verwerkt...");
        generateCustomZone(MM_HV);
    } else if (inwonersontvangenVariable && (sortfileArray.length === 0) && (!hvontvangenVariable)) {
        console.log("Alle files zijn verwerkt...");
        generateHVdata();
    }
}

function sortfile(file) {
    let fileExtension = file.name.split('.').pop();
    sortfileArray.push(file.name);

    // Headers voor files die geparsed/geanonimiseerd moeten worden.
    const inwonersHeaderArray = ["C28992R100", "INWONER", "MAN", "VROUW", "INW_014", "INW_1524", "INW_2544", "INW_4564", "INW_65PL", "GEBOORTE", "P_AUTOCHT", "P_WALLOCH", "P_NWALLOCH", "AANTAL_HH", "TOTHH_EENP", "TOTHH_MPZK", "HH_EENOUD", "HH_TWEEOUD", "GEM_HH_GR", "WONING", "WONVOOR45", "WON_4564", "WON_6574", "WON_7584", "WON_8594", "WON_9504", "WON_0514", "WON_1524", "WON_MRGEZ", "G_GAS_WON", "G_ELEK_WON", "UITKMINAOW"];
    const HSN_AED_Header = ["hsn-aed-id", "naam", "adres", "postcode", "woonplaats", "coordinaten", "beschikbaarheid"];
    const NRK_AED_Header = ["nrk-aed-id", "naam", "adres", "postcode", "woonplaats", "coordinaten", "beschikbaarheid"];

    // Grensheaders Bas
    const provincie_Header = ["id", "provincien", "fme_rejection_code", "_geometry"];
    const gemeente_Header = ["GM_CODE", "GM_NAAM", "WATER", "OAD", "STED", "AANT_INW", "AANT_MAN", "AANT_VROUW", "P_00_14_JR", "P_15_24_JR", "P_25_44_JR", "P_45_64_JR", "P_65_EO_JR", "P_ONGEHUWD", "P_GEHUWD", "P_GESCHEID", "P_VERWEDUW", "BEV_DICHTH", "AANTAL_HH", "P_EENP_HH", "P_HH_Z_K", "P_HH_M_K", "GEM_HH_GR", "P_WEST_AL", "P_N_W_AL", "P_MAROKKO", "P_ANT_ARU", "P_SURINAM", "P_TURKIJE", "P_OVER_NW", "OPP_TOT", "OPP_LAND", "OPP_WATER", "_geometry", "fme_rejection_code"];
    const wijk_Header = ["WK_CODE", "WK_NAAM", "GM_CODE", "GM_NAAM", "IND_WBI", "WATER", "OAD", "STED", "AANT_INW", "AANT_MAN", "AANT_VROUW", "P_00_14_JR", "P_15_24_JR", "P_25_44_JR", "P_45_64_JR", "P_65_EO_JR", "P_ONGEHUWD", "P_GEHUWD", "P_GESCHEID", "P_VERWEDUW", "BEV_DICHTH", "AANTAL_HH", "P_EENP_HH", "P_HH_Z_K", "P_HH_M_K", "GEM_HH_GR", "P_WEST_AL", "P_N_W_AL", "P_MAROKKO", "P_ANT_ARU", "P_SURINAM", "P_TURKIJE", "P_OVER_NW", "OPP_TOT", "OPP_LAND", "OPP_WATER", "_geometry", "fme_rejection_code"];
    const buurt_Header = ["BU_CODE", "BU_NAAM", "WK_CODE", "GM_CODE", "GM_NAAM", "IND_WBI", "WATER", "POSTCODE", "DEK_PERC", "OAD", "STED", "AANT_INW", "AANT_MAN", "AANT_VROUW", "P_00_14_JR", "P_15_24_JR", "P_25_44_JR", "P_45_64_JR", "P_65_EO_JR", "P_ONGEHUWD", "P_GEHUWD", "P_GESCHEID", "P_VERWEDUW", "BEV_DICHTH", "AANTAL_HH", "P_EENP_HH", "P_HH_Z_K", "P_HH_M_K", "GEM_HH_GR", "P_WEST_AL", "P_N_W_AL", "P_MAROKKO", "P_ANT_ARU", "P_SURINAM", "P_TURKIJE", "P_OVER_NW", "OPP_TOT", "OPP_LAND", "OPP_WATER", "fme_rejection_code", "_geometry"];

    // Headers voor het detecteren van de files die al geparsed zijn.
    // Deze bestanden worden direct in het geheugen geladen.
    const MM_GRENS_CBS_Header = ["6mm-grens-cbs-100m-id", "pc4", "provincie-code", "gemeente-code", "wijk-code", "buurt-code"];
    const MM_HV_Header = ["6mm-hv-100m-id", "6mm-hv-100m-wgs", "aantal-reg-aed-n24", "reg-aed-dek", "aantal-reg-aed-24", "reg-aed24-dek", "aantal-meld-aed-n24", "meld-aed-dek", "aantal-meld-aed-24", "meld-aed24-dek", "extra-inw-dek", "aantal-inwoners", "provincie-code", "gemeente-code", "wijk-code", "buurt-code", "pc4-code"];

    switch (fileExtension) {
        case 'csv':
            // parse the header and send it to the right function.
            Papa.parse(file, {
                header: true,
                preview: 1,
                skipEmptyLines: true,
                step: function (row) {
                    switch (row['meta']['fields'].toString()) {
                        case MM_GRENS_CBS_Header.toString():
                            console.log("Bestand gedetecteerd als GRENS bestand.");
                            saveCBSGrensdata(file);
                            break;
                        case buurt_Header.toString():
                            console.log("Bestand gedetecteerd als Buurt grensbestand.");
                            saveBuurtData(file);
                            break;
                        case wijk_Header.toString():
                            console.log("Bestand gedetecteerd als Wijk grensbestand.");
                            saveWijkData(file);
                            break;
                        case gemeente_Header.toString():
                            console.log("Bestand gedetecteerd als Gemeente grensbestand.");
                            saveGemeenteData(file);
                            break;
                        case provincie_Header.toString():
                            console.log("Bestand gedetecteerd als Provincie grensbestand.");
                            saveProvincieData(file);
                            break;
                        case HSN_AED_Header.toString():
                            console.log("Bestand gedetecteerd als HSN AED bestand.");
                            saveHSNAEDData(file);
                            break;
                        case NRK_AED_Header.toString():
                            console.log("Bestand gedetecteerd als NRK AED bestand.");
                            saveNRKAEDData(file);
                            break;
                        case inwonersHeaderArray.toString():
                            console.log("Bestand gedetecteerd als Inwoners bestand.");
                            saveInwonersData(file);
                            break;
                        case MM_HV_Header.toString():
                            console.log("Bestand gedetecteerd als Hartveilheids bestand.");
                            saveHVData(file);
                            break;
                        default:
                            console.log("Bestand " + file.name + " wordt niet herkend...");
                            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
                    }
                }
            });
            break;
        case 'json':
            // load geojson
            console.log("Bestand gedetecteerd als GeoJson bestand...");
            let reader = new FileReader();
            reader.onload = function (e) {
                console.log("Geojson wordt geladen...");
                loadJsonOnMap(e.target.result);
                console.log("Geojson is op de map geladen.");
            };
            reader.readAsText(file);
            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
            break;
        default:
            console.log("Bestand " + file.name + " wordt niet herkend...");
            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
            break;
    }
}

function saveHVData(file) {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            MM_HV = results;
            console.log('HV data opgeslagen.');
            hvontvangenVariable = true;
            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
            checkIfHvCanBeGenerated();
        }
    });
}

function saveInwonersData(file) {
    console.log("Inwoners data opslaan in geheugen...");
    let inwonerRows = new Map();
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        step: function (row) {

            let inwoners = row['data'][0]['INWONER'];

            if (+inwoners === -99997) {
                inwoners = 0;
            }

            inwonerRows.set(row['data'][0]['C28992R100'], {
                'aantal-inwoners': inwoners
            });
        },
        complete: function () {
            let csvRows = [];

            for (let item of inwonerRows) {
                csvRows.push([item[0], item[1]['aantal-inwoners']])
            }

            const headerData = "6mm-inw-cbs-100m-id;aantal-inwoners";
            let csvObject = createCsvObject(headerData, csvRows);
            MM_INW_CBS = Papa.parse(csvObject, {
                header: true,
                skipEmptyLines: true
            });

            inwonersontvangenVariable = true;
            generateCsvFile(MM_INW_CBS, "AED-INW-CBS");
            console.log("Inwoner data succesvol opgeslagen.");
            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
            // Clean memory.
            inwonerRows = null;
            checkIfHvCanBeGenerated();
        }
    });
}

function saveBuurtData(file) {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const headerData = "wijkcode;buurtcode;pc4;geom";
            let csvRows = [];

            for (let i = 0; i < results['data'].length; i++) {
                csvRows.push([
                    results['data'][i]['WK_CODE'].substring(2),
                    results['data'][i]['BU_CODE'].substring(2),
                    results['data'][i]['POSTCODE'],
                    results['data'][i]['_geometry']]);
            }

            let csvObject = createCsvObject(headerData, csvRows);
            let buurtData = Papa.parse(csvObject, {
                header: true,
                delimiter: ';',
                skipEmptyLines: true
            });

            for (let x = 0; x < buurtData['data'].length; x++) {
                if (!wijkBuurtMap.has(buurtData['data'][x]['wijkcode'])) {
                    wijkBuurtMap.set(buurtData['data'][x]['wijkcode'], [[buurtData['data'][x]['buurtcode'], calculatePolygonArray(buurtData['data'][x])]]);
                } else {
                    let wijkenData = wijkBuurtMap.get(buurtData['data'][x]['wijkcode']);
                    wijkenData.push([buurtData['data'][x]['buurtcode'], calculatePolygonArray(buurtData['data'][x])]);
                    wijkBuurtMap.set(buurtData['data'][x]['wijkcode'], wijkenData);
                }

                // build a pc4 map
                if (!pc4RefMap.has(buurtData['data'][x]['wijkcode'])) {
                    let buurtMap = new Map();
                    if (!buurtMap.has(buurtData['data'][x]['buurtcode'])) {
                        buurtMap.set(buurtData['data'][x]['buurtcode'], buurtData['data'][x]['pc4']);
                        pc4RefMap.set(buurtData['data'][x]['wijkcode'], buurtMap);
                    }
                } else {
                    let buurtMap = pc4RefMap.get(buurtData['data'][x]['wijkcode']);
                    if (!buurtMap.has(buurtData['data'][x]['buurtcode'])) {
                        buurtMap.set(buurtData['data'][x]['buurtcode'], buurtData['data'][x]['pc4']);
                        pc4RefMap.set(buurtData['data'][x]['wijkcode'], buurtMap);
                    }
                }
            }

            buurtDataOntvangenVariable = true;
            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
            checkIfHvCanBeGenerated();
        }
    });
}

function saveWijkData(file) {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const headerData = "gemeentecode;wijkcode;geom";
            let csvRows = [];

            for (let i = 0; i < results['data'].length; i++) {
                csvRows.push([
                    results['data'][i]['GM_CODE'].substring(2),
                    results['data'][i]['WK_CODE'].substring(2),
                    results['data'][i]['_geometry']]);
            }

            let csvObject = createCsvObject(headerData, csvRows);
            let wijkData = Papa.parse(csvObject, {
                header: true,
                delimiter: ';',
                skipEmptyLines: true
            });

            for (let x = 0; x < wijkData['data'].length; x++) {
                if (!gemeenteWijkMap.has(wijkData['data'][x]['gemeentecode'])) {
                    gemeenteWijkMap.set(wijkData['data'][x]['gemeentecode'], [[wijkData['data'][x]['wijkcode'], calculatePolygonArray(wijkData['data'][x])]]);
                } else {
                    let wijkenData = gemeenteWijkMap.get(wijkData['data'][x]['gemeentecode']);
                    wijkenData.push([wijkData['data'][x]['wijkcode'], calculatePolygonArray(wijkData['data'][x])]);
                    gemeenteWijkMap.set(wijkData['data'][x]['gemeentecode'], wijkenData);
                }
            }

            wijkDataOntvangenVariable = true;
            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
            checkIfHvCanBeGenerated()
        }
    });
}

function saveCBSGrensdata(file) {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            MM_GRENS_CBS = results;
            grensdataOntvangenVariabele = true;
            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
            checkIfHvCanBeGenerated()
        }
    });
}

function saveProvincieData(file) {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const headerData = "provinciecode;provincienaam;geom";
            let csvRows = [];

            for (let i = 0; i < results['data'].length; i++) {
                csvRows.push([
                    results['data'][i]['id'],
                    results['data'][i]['provincien'],
                    results['data'][i]['_geometry']]);
            }

            let csvObject = createCsvObject(headerData, csvRows);
            let provincieData = Papa.parse(csvObject, {
                header: true,
                delimiter: ';',
                skipEmptyLines: true
            });

            for (let x = 0; x < provincieData['data'].length; x++) {
                completeProvincieArray.push([provincieData['data'][x]['provinciecode'], calculatePolygonArray(provincieData['data'][x])]);
            }

            provincieDataOntvangenVariable = true;
            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
            checkIfHvCanBeGenerated()
        }
    });
}

function saveGemeenteData(file) {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const headerData = "gemeentenaam;gemeentecode;geom";
            let csvRows = [];

            for (let i = 0; i < results['data'].length; i++) {
                csvRows.push([
                    results['data'][i]['GM_NAAM'],
                    results['data'][i]['GM_CODE'].substring(2),
                    results['data'][i]['_geometry']]);
            }

            let csvObject = createCsvObject(headerData, csvRows);
            gemeenteData = Papa.parse(csvObject, {
                header: true,
                delimiter: ';',
                skipEmptyLines: true
            });

            for (let x = 0; x < gemeenteData['data'].length; x++) {
                completeGemeenteArray.push([gemeenteData['data'][x]['gemeentecode'], calculatePolygonArray(gemeenteData['data'][x])]);
            }

            gemeenteDataOntvangenVariable = true;
            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
            checkIfHvCanBeGenerated()
        }
    });
}

function saveHSNAEDData(file) {
    console.log("HSN AED data opslaan in geheugen...");
    let aedRows = new Map();

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        step: function (row) {
            // push the row data into the array
            let lat = row['data'][0]['coordinaten'].split(',')[0];
            let long = row['data'][0]['coordinaten'].split(',')[1];

            let convertedLocation = wgs2Rd(lat, long);
            convertedLocation[0] = 'E' + convertedLocation[0].toString().substring(0, 4);
            convertedLocation[1] = 'N' + convertedLocation[1].toString().substring(0, 4);
            let rdloc = convertedLocation[0] + convertedLocation[1];

            if (!aedRows.has(rdloc)) {
                if (row['data'][0]['beschikbaarheid'].toLowerCase() === 'ja') {
                    aedRows.set(rdloc, {'aantal-reg-aed-n24': 0, 'aantal-reg-aed-24': 1});
                } else {
                    aedRows.set(rdloc, {'aantal-reg-aed-n24': 1, 'aantal-reg-aed-24': 0});
                }
            } else {
                let currentValues = aedRows.get(rdloc);
                if (row['data'][0]['beschikbaarheid'].toLowerCase() === 'ja') {
                    aedRows.set(rdloc, {
                        'aantal-reg-aed-n24': (currentValues['aantal-reg-aed-n24']),
                        'aantal-reg-aed-24': (currentValues['aantal-reg-aed-24'] += 1)
                    });
                } else {
                    aedRows.set(rdloc, {
                        'aantal-reg-aed-n24': (currentValues['aantal-reg-aed-n24'] += 1),
                        'aantal-reg-aed-24': (currentValues['aantal-reg-aed-24'])
                    });
                }
            }
        },
        complete: function () {
            const headerData = '6mm-aed-hsn-100m-id;aantal-reg-aed-n24;aantal-reg-aed-24';
            let csvRows = [];

            for (let item of aedRows) {
                csvRows.push([item[0], item[1]['aantal-reg-aed-n24'], item[1]['aantal-reg-aed-24']])
            }

            let csvObject = createCsvObject(headerData, csvRows);
            MM_AED_HSN = Papa.parse(csvObject, {
                header: true,
                delimiter: ';',
                skipEmptyLines: true
            });

            HSN_AED_Ontvangen = true;
            console.log("AED data succesvol opgeslagen.");
            generateCsvFile(MM_AED_HSN, 'AED-HSN');
            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
            checkIfHvCanBeGenerated()
        }
    });
}

function saveNRKAEDData(file) {
    console.log("NRK AED data opslaan in geheugen...");
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            let aedRows = new Map();

            for (let i = 0; i < results['data'].length; i++) {
                let lat = results['data'][i]['coordinaten'].split(',')[0];
                let long = results['data'][i]['coordinaten'].split(',')[1];

                let convertedLocation = wgs2Rd(lat, long);
                convertedLocation[0] = 'E' + convertedLocation[0].toString().substring(0, 4);
                convertedLocation[1] = 'N' + convertedLocation[1].toString().substring(0, 4);
                let rdloc = convertedLocation[0] + convertedLocation[1];

                if (!aedRows.has(rdloc)) {
                    if (results['data'][i]['beschikbaarheid'].toLowerCase() === 'ja') {
                        aedRows.set(rdloc, {'aantal-meld-aed-n24': 0, 'aantal-meld-aed-24': 1});
                    } else {
                        aedRows.set(rdloc, {'aantal-meld-aed-n24': 1, 'aantal-meld-aed-24': 0});
                    }
                } else {
                    let currentValues = aedRows.get(rdloc);
                    if (results['data'][i]['beschikbaarheid'].toLowerCase() === 'ja') {
                        aedRows.set(rdloc, {
                            'aantal-meld-aed-n24': (currentValues['aantal-meld-aed-n24']),
                            'aantal-meld-aed-24': (currentValues['aantal-meld-aed-24'] += 1)
                        });
                    } else {
                        aedRows.set(rdloc, {
                            'aantal-meld-aed-n24': (currentValues['aantal-meld-aed-n24'] += 1),
                            'aantal-meld-aed-24': (currentValues['aantal-meld-aed-24'])
                        });
                    }
                }
            }

            let csvRows = [];

            for (let item of aedRows) {
                csvRows.push([item[0], item[1]['aantal-meld-aed-n24'], item[1]['aantal-meld-aed-24']])
            }

            const tempHeaderData = '6mm-aed-nrk-100m-id;aantal-meld-aed-n24;aantal-meld-aed-24';
            let csvObject = createCsvObject(tempHeaderData, csvRows);

            MM_AED_NRK = Papa.parse(csvObject, {
                header: true,
                delimiter: ';',
                skipEmptyLines: true
            });

            generateCsvFile(MM_AED_NRK, 'AED-NRK');

            csvRows = [];

            for (let i = 0; i < results['data'].length; i++) {
                let lat = results['data'][i]['coordinaten'].split(',')[0];
                let long = results['data'][i]['coordinaten'].split(',')[1];

                let convertedLocation = wgs2Rd(lat, long);
                convertedLocation[0] = 'E' + convertedLocation[0].toString().substring(0, 4);
                convertedLocation[1] = 'N' + convertedLocation[1].toString().substring(0, 4);
                let rdloc = convertedLocation[0] + convertedLocation[1];
                let aedAantallen = aedRows.get(rdloc);
                csvRows.push([rdloc,
                    results['data'][i]['nrk-aed-id'],
                    results['data'][i]['naam'],
                    results['data'][i]['adres'],
                    results['data'][i]['postcode'],
                    results['data'][i]['woonplaats'],
                    results['data'][i]['coordinaten'],
                    results['data'][i]['beschikbaarheid'].toLowerCase(),
                    aedAantallen['aantal-meld-aed-n24'],
                    aedAantallen['aantal-meld-aed-24']]);
            }

            const headerData = '6mm-aed-nrk-100m-id;nrk-aed-id;naam;adres;postcode;woonplaats;coordinaten;beschikbaarheid;aantal-meld-aed-n24;aantal-meld-aed-24';
            csvObject = createCsvObject(headerData, csvRows);

            MM_AED_NRK = Papa.parse(csvObject, {
                header: true,
                delimiter: ';',
                skipEmptyLines: true
            });

            for (let i = 0; i < MM_AED_NRK['data'].length; i++) {
                REF_AED_NRK_SOURCE.push(MM_AED_NRK['data'][i]);
            }

            NRK_AED_Ontvangen = true;
            console.log("NRK AED data succesvol opgeslagen.");
            sortfileArray.splice(sortfileArray.indexOf(file.name), 1);
            checkIfHvCanBeGenerated()
        }
    });
}

function createCsvObject(headers, rows) {
    let csv = '';
    let csvStringArray = [];
    csv += headers + '\n';
    for (let i = 0; i < rows.length; i++) {
        for (let y = 0; y < rows[i].length; y++) {
            let tempvar = (rows[i][y] += ';');
            if (y === (rows[i].length - 1)) {
                tempvar = tempvar.slice(0, -1);
            }
            csv += tempvar;
        }
        csv += '\n';
        if (i % 10000 === 0 || (i + 1) === rows.length) {
            csvStringArray.push(csv);
            csv = '';
        }
    }
    return csvStringArray.join('');
}

function getProvincieCode(point) {
    // add provincie data.
    if (!provincieDataOntvangenVariable) {
        return 0;
    }
    let Ebound = (point.split("E")[1].split("N")[0] * 100 + 50);
    let Nbound = (point.split("E")[1].split("N")[1] * 100 + 50);
    for (let x = 0; x < completeProvincieArray.length; x++) {
        if (completeProvincieArray[x][1].length === 1) {
            if (pointInPolygon([Ebound, Nbound], completeProvincieArray[x][1][0])) {
                return completeProvincieArray[x][0];
            }
        } else if (completeProvincieArray[x][1].length > 1) {
            for (let i = 0; i < completeProvincieArray[x][1].length; i++) {
                if (pointInPolygon([Ebound, Nbound], completeProvincieArray[x][1][i])) {
                    return completeProvincieArray[x][0];
                }
            }
        } else {
            return 0;
        }
    }
    return 0;
}

function getPc4Code(wijkcode, buurtcode) {
    if (!buurtDataOntvangenVariable) {
        return 0;
    }
    if (pc4RefMap.has(wijkcode)) {
        let buurten = pc4RefMap.get(wijkcode);
        if (buurten.has(buurtcode)) {
            return buurten.get(buurtcode);
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

function getGemeenteCode(point) {
    if (!gemeenteDataOntvangenVariable) {
        return 0;
    }
    let Ebound = (point.split("E")[1].split("N")[0] * 100 + 50);
    let Nbound = (point.split("E")[1].split("N")[1] * 100 + 50);
    for (let x = 0; x < completeGemeenteArray.length; x++) {
        if (completeGemeenteArray[x][1].length === 1) {
            if (pointInPolygon([Ebound, Nbound], completeGemeenteArray[x][1][0])) {
                return completeGemeenteArray[x][0];
            }
        } else if (completeGemeenteArray[x][1].length > 1) {
            for (let i = 0; i < completeGemeenteArray[x][1].length; i++) {
                if (pointInPolygon([Ebound, Nbound], completeGemeenteArray[x][1][i])) {
                    return completeGemeenteArray[x][0];
                }
            }
        } else {
            return 0;
        }
    }
    return 0;
}

function getWijkCode(point, gemeentecode) {
    if (!wijkDataOntvangenVariable) {
        return 0;
    }
    let Ebound = (point.split("E")[1].split("N")[0] * 100 + 50);
    let Nbound = (point.split("E")[1].split("N")[1] * 100 + 50);
    if (gemeentecode !== 0) {
        // gemeente found
        let wijken = gemeenteWijkMap.get(gemeentecode);
        for (let i = 0; i < wijken.length; i++) {
            if (wijken[i][1].length === 1) {
                if (pointInPolygon([Ebound, Nbound], wijken[i][1][0])) {
                    return wijken[i][0].toString();
                }
            } else if (wijken[i][1].length > 1) {
                for (let y = 0; y < wijken[i][1].length; y++) {
                    if (pointInPolygon([Ebound, Nbound], wijken[i][1][y])) {
                        return wijken[i][0].toString();
                    }
                }
            } else {
                return 0;
            }

        }
    }
    return 0;
}

function getBuurtCode(point, wijkcode) {
    if (!buurtDataOntvangenVariable) {
        return 0;
    }
    let Ebound = (point.split("E")[1].split("N")[0] * 100 + 50);
    let Nbound = (point.split("E")[1].split("N")[1] * 100 + 50);
    if (wijkcode !== 0) {
        let buurten = wijkBuurtMap.get(wijkcode);
        for (let i = 0; i < buurten.length; i++) {
            if (buurten[i][1].length === 1) {
                if (pointInPolygon([Ebound, Nbound], buurten[i][1][0])) {
                    return buurten[i][0].toString();
                }
            } else if (buurten[i][1].length > 1) {
                for (let y = 0; y < buurten[i][1].length; y++) {
                    if (pointInPolygon([Ebound, Nbound], buurten[i][1][y])) {
                        return buurten[i][0].toString();
                    }
                }
            }
        }
    }
    return 0;
}

function generateCsvFile(file, filename) {
    let parsedCSV = Papa.unparse(file, {
        delimiter: ';'
    });

    let aElement = window.document.createElement('a');
    aElement.href = window.URL.createObjectURL(new Blob([parsedCSV], {type: 'text/csv'}));
    aElement.download = (filename.toString() + '.csv');
    document.body.appendChild(aElement);
    aElement.click();
    document.body.removeChild(aElement);
    console.log(filename + ".csv wordt als download verzonden.")
}

function generateCsvFileFromCSVRows(file, filename) {
    let aElement = window.document.createElement('a');
    aElement.href = window.URL.createObjectURL(new Blob([file], {type: 'text/csv'}));
    aElement.download = (filename.toString() + '.csv');
    document.body.appendChild(aElement);
    aElement.click();
    document.body.removeChild(aElement);
    console.log(filename + ".csv wordt als download verzonden.")
}


