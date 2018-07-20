/**
 * Created by Cyriel on 25-6-2018.
 */
function generateGeoJson(file) {
    let geojson = {};
    geojson['type'] = 'FeatureCollection';
    geojson['features'] = [];
    console.log("Geojson bestand maken...");
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        step: function (row) {
            if (parseInt(row['data'][0]['provincie-code']) === customZoneProvcodeLock || (customZoneProvcodeLock === 0) || !provincieDataOntvangenVariable) {
                // push the row data into the array
                let Ebound = (row['data'][0]['6mm-hv-100m-id'].split("E")[1].split("N")[0] * 100);
                let Nbound = (row['data'][0]['6mm-hv-100m-id'].split("E")[1].split("N")[1] * 100);

                let Ebound1 = (Ebound + 100);
                let Nbound1 = (Nbound + 100);

                let punt1 = rd2Wgs(Ebound, Nbound);
                let punt2 = rd2Wgs(Ebound1, Nbound);
                let punt3 = rd2Wgs(Ebound, Nbound1);
                let punt4 = rd2Wgs(Ebound1, Nbound1);

                let punten = [punt1, punt2, punt3, punt4];

                for (let i = 0; i < punten.length; i++) {
                    let b = punten[i][0];
                    punten[i][0] = punten[i][1];
                    punten[i][1] = b;
                }

                let data = [[
                    parseFloat(punt1[0].toFixed(15)),
                    parseFloat(punt1[1].toFixed(15))], [
                    parseFloat(punt2[0].toFixed(15)),
                    parseFloat(punt2[1].toFixed(15))], [
                    parseFloat(punt4[0].toFixed(15)),
                    parseFloat(punt4[1].toFixed(15))], [
                    parseFloat(punt3[0].toFixed(15)),
                    parseFloat(punt3[1].toFixed(15))], [
                    parseFloat(punt1[0].toFixed(15)),
                    parseFloat(punt1[1].toFixed(15))]];

                let properties = {};
                if (row['data'][0]['reg-aed24-dek'] === 'ja') {
                    //properties.fill = "#228b22";
                    properties.fill = "#008000"; // green
                } else if (row['data'][0]['reg-aed-dek'] === 'ja') {
                    //properties.fill = "#00ff00";
                    properties.fill = "#ffd700"; // gold
                } else if (row['data'][0]['meld-aed24-dek'] === 'ja') {
                    //properties.fill = "#ff6600";
                    properties.fill = "#0000ff"; // blue
                } else if (row['data'][0]['meld-aed-dek'] === 'ja') {
                    //properties.fill = "#ffd100";
                    properties.fill = "#0000ff"; // blue
                } else {
                    //properties.fill = "#ff0000";
                    properties.fill = "#ff0000"; // red
                }

                properties.Locatie = row['data'][0]['6mm-hv-100m-id'];
                properties.WgsLocatie = row['data'][0]['6mm-hv-100m-wgs'];
                properties.Aantal_Reg_Aed = row['data'][0]['aantal-reg-aed-n24'];
                properties.Reg_Aed_Dek = row['data'][0]['reg-aed-dek'];
                properties.Aantal_Reg_Aed24 = row['data'][0]['aantal-reg-aed-24'];
                properties.Reg_Aed24_Dek = row['data'][0]['reg-aed24-dek'];
                properties.Aantal_Meld_Aed = row['data'][0]['aantal-meld-aed-n24'];
                properties.Meld_Aed_Dek = row['data'][0]['meld-aed-dek'];
                properties.Aantal_Meld_Aed24 = row['data'][0]['aantal-meld-aed-24'];
                properties.Meld_Aed24_Dek = row['data'][0]['meld-aed24-dek'];
                properties.Extra_Inw_Dek = row['data'][0]['extra-inw-dek'];
                properties.Aantal_Inwoners = row['data'][0]['aantal-inwoners'];
                properties.Provincie_Code = row['data'][0]['provincie-code'];
                properties.Gemeente_Code = row['data'][0]['gemeente-code'];
                properties.Wijk_Code = row['data'][0]['wijk-code'];
                properties.Buurt_Code = row['data'][0]['buurt-code'];
                properties.PC4_Code = row['data'][0]['pc4-code'];

                let newFeature = {
                    "type": "Feature",
                    "properties": properties,
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [data]
                    }
                };

                geojson['features'].push(newFeature);
            }
        }, complete: function () {
            console.log("Klaar met het maken van custom zone GeoJson bestand.");
            let aElement = window.document.createElement('a');
            aElement.href = window.URL.createObjectURL(new Blob([JSON.stringify(geojson)], {type: 'JSON'}));
            let provnaam = provincieRefMap.get(customZoneProvcodeLock);
            aElement.download = 'AED-' + provnaam + '.json';
            document.body.appendChild(aElement);
            aElement.click();
            document.body.removeChild(aElement);
            loadJsonOnMap(JSON.stringify(geojson));
        }
    });
}