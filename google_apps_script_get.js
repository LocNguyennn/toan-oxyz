function doGet(e) {
    try {
        // SECURITY CHECK REMOVED BY USER REQUEST
        // Public Access Allowed

        // --- ACCESS GRANTED ---

        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var allQuestions = [];

        // DEBUG: Track what we find
        var debugLog = {
            spreadsheetName: ss ? ss.getName() : "NULL",
            sheetsFound: {},
            totalQuestionsLoaded: 0
        };

        function getSheetData(sheetName, type) {
            var sheet = ss.getSheetByName(sheetName);
            if (!sheet) {
                debugLog.sheetsFound[sheetName] = "NOT FOUND";
                return;
            }

            var data = sheet.getDataRange().getValues();
            debugLog.sheetsFound[sheetName] = "Found, Rows: " + data.length;

            if (data.length <= 1) return; // Only headers or empty

            var headers = data[0];

            for (var i = 1; i < data.length; i++) {
                var row = data[i];
                var qObj = { type: type, q: "" };
                var rowObj = {};

                // Safety check for row length vs headers
                // if (row.length < headers.length) continue; 

                for (var j = 0; j < headers.length; j++) {
                    if (j < row.length) rowObj[headers[j]] = row[j];
                }

                qObj.q = rowObj['q'];

                if (type === 'v1') {
                    qObj.a = [rowObj['a1'], rowObj['a2'], rowObj['a3'], rowObj['a4']];
                    qObj.c = rowObj['c'];
                } else if (type === 'v2') {
                    qObj.items = [];
                    if (rowObj['a1']) qObj.items.push({ l: rowObj['a1'], r: String(rowObj['a1 result']).toLowerCase() === 'true' });
                    if (rowObj['a2']) qObj.items.push({ l: rowObj['a2'], r: String(rowObj['a2 result']).toLowerCase() === 'true' });
                    if (rowObj['a3']) qObj.items.push({ l: rowObj['a3'], r: String(rowObj['a3 result']).toLowerCase() === 'true' });
                    if (rowObj['a4']) qObj.items.push({ l: rowObj['a4'], r: String(rowObj['a4 result']).toLowerCase() === 'true' });
                } else if (type === 'v3') {
                    qObj.c = String(rowObj['c']);
                }
                allQuestions.push(qObj);
            }
        }

        getSheetData('v1', 'v1');
        getSheetData('v2', 'v2');
        getSheetData('v3', 'v3');

        debugLog.totalQuestionsLoaded = allQuestions.length;

        // SERVER SIDE RANDOMIZATION
        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }

        var poolV1 = allQuestions.filter(function (q) { return q.type === 'v1'; });
        var poolV2 = allQuestions.filter(function (q) { return q.type === 'v2'; });
        var poolV3 = allQuestions.filter(function (q) { return q.type === 'v3'; });

        // If we have NO questions, return the debug log so the user knows why
        if (allQuestions.length === 0) {
            return ContentService.createTextOutput(JSON.stringify({
                error: "EMPTY_DATA",
                debug: debugLog
            })).setMimeType(ContentService.MimeType.JSON);
        }

        shuffleArray(poolV1);
        shuffleArray(poolV2);
        shuffleArray(poolV3);

        var examQuestions = [];
        examQuestions = examQuestions.concat(poolV1.slice(0, 12));
        examQuestions = examQuestions.concat(poolV2.slice(0, 4));
        examQuestions = examQuestions.concat(poolV3.slice(0, 6));

        return ContentService.createTextOutput(JSON.stringify(examQuestions))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
