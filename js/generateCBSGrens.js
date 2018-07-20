function generateCBSGrens(hvRows) {
    console.log('Grensbestand niet meegegeven, nieuwe grensdataset wordt gegenereerd.');
    console.log('Dit kan lang duren...');
    const headerData = '6mm-grens-cbs-100m-id;pc4;provincie-code;gemeente-code;wijk-code;buurt-code';
    let csvRows = [];
    hvkeys = hvRows.keys();
    for (let key of hvkeys) {
        provcode = getProvincieCode(key);
        gemeentecode = getGemeenteCode(key);
        wijkcode = getWijkCode(key, gemeentecode);
        buurtcode = getBuurtCode(key, wijkcode);
        pc4code = getPc4Code(wijkcode, buurtcode);
        csvRows.push([key, pc4code, provcode, gemeentecode, wijkcode, buurtcode]);
        if (csvRows.length % 10000 === 0) {
            console.log(csvRows.length + '/' + hvRows.size);
        }
    }

    let csvObject = createCsvObject(headerData, csvRows);

    MM_GRENS_CBS = Papa.parse(csvObject, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true
    });

    grensdataOntvangenVariabele = true;
    generateCsvFile(MM_GRENS_CBS, 'AED-GRENS-CBS');
    return MM_GRENS_CBS;
}