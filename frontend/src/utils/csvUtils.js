import { writeFileSync, existsSync, appendFileSync } from 'fs';
import { join } from 'path';

const csvFilePath = join(__dirname, '../../../database/patients.csv');

export const writePatientToCSV = (patient) => {
    const csvHeader = 'ID,Number,Time,Date,Address\n';
    const csvRow = `${patient.id},${patient.number},${patient.time},${patient.date},${patient.address}\n`;

    if (!existsSync(csvFilePath)) {
        writeFileSync(csvFilePath, csvHeader);
    }
    appendFileSync(csvFilePath, csvRow);
};