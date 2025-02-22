const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(bodyParser.json());

const csvFilePath = path.join(__dirname, 'database/patients.csv');

app.post('/api/patients', (req, res) => {
    const patient = req.body;
    const csvHeader = 'ID,Number,Time,Date,Address\n';
    const csvRow = `${patient.id},${patient.number},${patient.time},${patient.date},${patient.address}\n`;

    if (!fs.existsSync(csvFilePath)) {
        fs.writeFileSync(csvFilePath, csvHeader);
    }
    fs.appendFileSync(csvFilePath, csvRow);

    res.status(200).send('Patient data saved to CSV');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
