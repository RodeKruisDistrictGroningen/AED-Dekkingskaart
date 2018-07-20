function generateHVdata() {
    let hvRows = new Map();

    console.log("Hv data wordt gegenereerd.");
    console.log("AED & Inwoners data samenvoegen...");

    // Add the inwoner data.
    for (let i = 0; i < MM_INW_CBS['data'].length; i++) {
        let rdLoc = MM_INW_CBS['data'][i]['6mm-inw-cbs-100m-id'];
        let wgsLoc = rd2Wgs(rdLoc.split("E")[1].split("N")[0] * 100, rdLoc.split("E")[1].split("N")[1] * 100).join();
        hvRows.set(rdLoc, {
            '6mm-hv-100m-wgs': wgsLoc,
            'aantal-reg-aed-n24': 0,
            'reg-aed-dek': 'nee',
            'aantal-reg-aed-24': 0,
            'reg-aed24-dek': 'nee',
            'aantal-meld-aed-n24': 0,
            'meld-aed-dek': 'nee',
            'aantal-meld-aed-24': 0,
            'meld-aed24-dek': 'nee',
            'extra-inw-dek': 0,
            'aantal-inwoners': MM_INW_CBS['data'][i]['aantal-inwoners'],
            'provincie-code': 0,
            'gemeente-code': 0,
            'wijk-code': 0,
            'buurt-code': 0,
            'pc4-code': 0
        });
    }

    MM_INW_CBS = null;

    // add the NRK AED data
    if (NRK_AED_Ontvangen) {
        // add the NRK AED data
        for (let key of hvRows.keys()) {
            for (let i = 0; i < MM_AED_NRK['data'].length; i++) {
                if (MM_AED_NRK['data'][i]['6mm-aed-nrk-100m-id'] === key) {
                    // AED Location already exists.
                    let tempValues = hvRows.get(key);
                    let meldDek = 'nee';
                    let meldDek24 = 'nee';
                    if (MM_AED_NRK['data'][i]['aantal-meld-aed-n24'] > 0) {
                        meldDek = 'ja';
                    }

                    if (MM_AED_NRK['data'][i]['aantal-meld-aed-24'] > 0) {
                        meldDek24 = 'ja';
                    }

                    tempValues['aantal-meld-aed-n24'] = MM_AED_NRK['data'][i]['aantal-meld-aed-n24'];
                    tempValues['meld-aed-dek'] = meldDek;
                    tempValues['aantal-meld-aed-24'] = MM_AED_NRK['data'][i]['aantal-meld-aed-24'];
                    tempValues['meld-aed24-dek'] = meldDek24;
                    hvRows.set(key, tempValues);
                    MM_AED_NRK['data'].splice(i, 1);
                }
            }
        }

        // Add the remaining NRK aed locations...
        for (let i = 0; i < MM_AED_NRK['data'].length; i++) {
            let meldDek = 'nee';
            let meldDek24 = 'nee';
            if (MM_AED_NRK['data'][i]['aantal-meld-aed-n24'] > 0) {
                meldDek = 'ja';
            }

            if (MM_AED_NRK['data'][i]['aantal-meld-aed-24'] > 0) {
                meldDek24 = 'ja';
            }

            let rdLoc = MM_AED_NRK['data'][i]['6mm-aed-nrk-100m-id'];
            let wgsLoc = rd2Wgs(rdLoc.split("E")[1].split("N")[0] * 100, rdLoc.split("E")[1].split("N")[1] * 100).join();

            hvRows.set(rdLoc, {
                '6mm-hv-100m-wgs': wgsLoc,
                'aantal-reg-aed-n24': 0,
                'reg-aed-dek': 'nee',
                'aantal-reg-aed-24': 0,
                'reg-aed24-dek': 'nee',
                'aantal-meld-aed-n24': MM_AED_NRK['data'][i]['aantal-meld-aed-n24'],
                'meld-aed-dek': meldDek,
                'aantal-meld-aed-24': MM_AED_NRK['data'][i]['aantal-meld-aed-24'],
                'meld-aed24-dek': meldDek24,
                'extra-inw-dek': 0,
                'aantal-inwoners': 0,
                'provincie-code': 0,
                'gemeente-code': 0,
                'wijk-code': 0,
                'buurt-code': 0,
                'pc4-code': 0
            });
        }

        MM_AED_NRK = null;
    }

    // add the HSN AED data
    if (HSN_AED_Ontvangen) {
        for (let key of hvRows.keys()) {
            for (let i = 0; i < MM_AED_HSN['data'].length; i++) {
                if (MM_AED_HSN['data'][i]['6mm-aed-hsn-100m-id'] === key) {
                    // AED Location already exists.
                    let tempValues = hvRows.get(key);
                    let regDek = 'nee';
                    let regDek24 = 'nee';

                    if (MM_AED_HSN['data'][i]['aantal-reg-aed-n24'] > 0) {
                        regDek = 'ja';
                    }

                    if (MM_AED_HSN['data'][i]['aantal-reg-aed-24'] > 0) {
                        regDek24 = 'ja';
                    }

                    tempValues['aantal-reg-aed-n24'] = MM_AED_HSN['data'][i]['aantal-reg-aed-n24'];
                    tempValues['reg-aed-dek'] = regDek;
                    tempValues['aantal-reg-aed-24'] = MM_AED_HSN['data'][i]['aantal-reg-aed-24'];
                    tempValues['reg-aed24-dek'] = regDek24;

                    hvRows.set(key, tempValues);
                    MM_AED_HSN['data'].splice(i, 1);
                }
            }
        }

        // Add the remaining HSN aed locations...
        for (let i = 0; i < MM_AED_HSN['data'].length; i++) {
            let regDek = 'nee';
            let regDek24 = 'nee';
            if (MM_AED_HSN['data'][i]['aantal-reg-aed-n24'] > 0) {
                regDek = 'ja';
            }

            if (MM_AED_HSN['data'][i]['aantal-reg-aed-24'] > 0) {
                regDek24 = 'ja';
            }

            let rdLoc = MM_AED_HSN['data'][i]['6mm-aed-hsn-100m-id'];
            let wgsLoc = rd2Wgs(rdLoc.split("E")[1].split("N")[0] * 100, rdLoc.split("E")[1].split("N")[1] * 100).join();

            hvRows.set(rdLoc, {
                '6mm-hv-100m-wgs': wgsLoc,
                'aantal-reg-aed-n24': MM_AED_HSN['data'][i]['aantal-reg-aed-n24'],
                'reg-aed-dek': regDek,
                'aantal-reg-aed-24': MM_AED_HSN['data'][i]['aantal-reg-aed-24'],
                'reg-aed24-dek': regDek24,
                'aantal-meld-aed-n24': 0,
                'meld-aed-dek': 'nee',
                'aantal-meld-aed-24': 0,
                'meld-aed24-dek': 'nee',
                'extra-inw-dek': 0,
                'aantal-inwoners': 0,
                'provincie-code': 0,
                'gemeente-code': 0,
                'wijk-code': 0,
                'buurt-code': 0,
                'pc4-code': 0
            });
        }
    }

    MM_AED_HSN = null;

    if (!grensdataOntvangenVariabele && generateGrensDataset) {
        MM_GRENS_CBS = generateCBSGrens(hvRows);
        console.log('Generatie grensdata compleet.');
    }

    if (grensdataOntvangenVariabele) {
        for (let i = 0; i < MM_GRENS_CBS['data'].length; i++) {
            if (hvRows.has(MM_GRENS_CBS['data'][i]['6mm-grens-cbs-100m-id'])) {
                let tempValues = hvRows.get(MM_GRENS_CBS['data'][i]['6mm-grens-cbs-100m-id']);
                tempValues['provincie-code'] = MM_GRENS_CBS['data'][i]['provincie-code'];
                tempValues['gemeente-code'] = MM_GRENS_CBS['data'][i]['gemeente-code'];
                tempValues['wijk-code'] = MM_GRENS_CBS['data'][i]['wijk-code'];
                tempValues['buurt-code'] = MM_GRENS_CBS['data'][i]['buurt-code'];
                tempValues['pc4-code'] = MM_GRENS_CBS['data'][i]['pc4'];
                hvRows.set(MM_GRENS_CBS['data'][i]['6mm-grens-cbs-100m-id'], tempValues);
            } else {
                // New value
                let point = MM_GRENS_CBS['data'][i]['6mm-grens-cbs-100m-id'];
                let provcode = getProvincieCode(point);
                let gemeentecode = getGemeenteCode(point);
                let wijkcode = getWijkCode(point, gemeentecode);
                let buurtcode = getBuurtCode(point, wijkcode);
                let pc4code = getPc4Code(wijkcode, buurtcode);
                let rdLoc = MM_GRENS_CBS['data'][i]['6mm-grens-cbs-100m-id'];
                let wgsLoc = rd2Wgs(rdLoc.split("E")[1].split("N")[0] * 100, rdLoc.split("E")[1].split("N")[1] * 100).join();
                hvRows.set(rdLoc, {
                    '6mm-hv-100m-wgs': wgsLoc,
                    'aantal-reg-aed-n24': 0,
                    'reg-aed-dek': 'nee',
                    'aantal-reg-aed-24': 0,
                    'reg-aed24-dek': 'nee',
                    'aantal-meld-aed-n24': 0,
                    'meld-aed-dek': 'nee',
                    'aantal-meld-aed-24': 0,
                    'meld-aed24-dek': 'nee',
                    'extra-inw-dek': 0,
                    'aantal-inwoners': 0,
                    'provincie-code': provcode,
                    'gemeente-code': gemeentecode,
                    'wijk-code': wijkcode,
                    'buurt-code': buurtcode,
                    'pc4-code': pc4code
                });
            }
        }

        MM_GRENS_CBS = null;
    }

    generateCustomZone(hvRows);

    if (NRK_AED_Ontvangen) {
        for (let i = 0; i < REF_AED_NRK['data'].length; i++) {
            let key = REF_AED_NRK['data'][i]['aed-ref-100m-id'];
            if (hvRows.has(key)) {
                let tempValues = hvRows.get(key);
                tempValues['extra-inw-dek'] = REF_AED_NRK['data'][i]['extra-inw-dek'];
                hvRows.set(key, tempValues);
            } else {
                // New value
                let point = REF_AED_NRK['data'][i]['aed-ref-100m-id'];
                let provcode = getProvincieCode(point);
                let gemeentecode = getGemeenteCode(point);
                let wijkcode = getWijkCode(point, gemeentecode);
                let buurtcode = getBuurtCode(point, wijkcode);
                let pc4code = getPc4Code(wijkcode, buurtcode);
                let rdLoc = REF_AED_NRK['data'][i]['aed-ref-100m-id'];
                let wgsLoc = rd2Wgs(rdLoc.split("E")[1].split("N")[0] * 100, rdLoc.split("E")[1].split("N")[1] * 100).join();
                hvRows.set(rdLoc, {
                    '6mm-hv-100m-wgs': wgsLoc,
                    'aantal-reg-aed-n24': 0,
                    'reg-aed-dek': 'nee',
                    'aantal-reg-aed-24': 0,
                    'reg-aed24-dek': 'nee',
                    'aantal-meld-aed-n24': 0,
                    'meld-aed-dek': 'nee',
                    'aantal-meld-aed-24': 0,
                    'meld-aed24-dek': 'nee',
                    'extra-inw-dek': REF_AED_NRK['data'][i]['extra-inw-dek'],
                    'aantal-inwoners': 0,
                    'provincie-code': provcode,
                    'gemeente-code': gemeentecode,
                    'wijk-code': wijkcode,
                    'buurt-code': buurtcode,
                    'pc4-code': pc4code
                });
            }
        }
        REF_AED_NRK = null;
    }

    let csvRows = [];

    for (let item of hvRows) {
        csvRows.push([item[0],
            item[1]['6mm-hv-100m-wgs'],
            item[1]['aantal-reg-aed-n24'],
            item[1]['reg-aed-dek'],
            item[1]['aantal-reg-aed-24'],
            item[1]['reg-aed24-dek'],
            item[1]['aantal-meld-aed-n24'],
            item[1]['meld-aed-dek'],
            item[1]['aantal-meld-aed-24'],
            item[1]['meld-aed24-dek'],
            item[1]['extra-inw-dek'],
            item[1]['aantal-inwoners'],
            item[1]['provincie-code'],
            item[1]['gemeente-code'],
            item[1]['wijk-code'],
            item[1]['buurt-code'],
            item[1]['pc4-code']]);
        hvRows.delete(item[0]);
    }

    hvontvangenVariable = true;
    console.log("HV data succesvol opgeslagen.");
    const headerData = "6mm-hv-100m-id;6mm-hv-100m-wgs;aantal-reg-aed-n24;reg-aed-dek;aantal-reg-aed-24;reg-aed24-dek;aantal-meld-aed-n24;meld-aed-dek;aantal-meld-aed-24;meld-aed24-dek;extra-inw-dek;aantal-inwoners;provincie-code;gemeente-code;wijk-code;buurt-code;pc4-code";
    generateCsvFileFromCSVRows(createCsvObject(headerData, csvRows), 'AED-HV');
}
