function doPost(e) {
    try {
        // Explicitly open the sheet by ID to be safe
        // Note: Same Sheet ID as GET, usually results go to Sheet1
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
        var timestamp = new Date();
        var name, score, time;

        // 1. Try to get data from Form Parameters (Best for no-cors / fetch formData)
        if (e.parameter && e.parameter.name) {
            name = e.parameter.name;
            score = e.parameter.score;
            time = e.parameter.time;
        }
        // 2. Fallback: Try to get data from JSON body
        else if (e.postData && e.postData.contents) {
            var data = JSON.parse(e.postData.contents);
            name = data.name;
            score = data.score;
            time = data.time;
        }

        sheet.appendRow([timestamp, name, score, time]);

        return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
