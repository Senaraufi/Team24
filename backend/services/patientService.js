const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../database/patients.json');

const readDatabase = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(JSON.parse(data));
    });
  });
};

const writeDatabase = (data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const addPatient = async (patient) => {
  const patients = await readDatabase();
  patients.push(patient);
  await writeDatabase(patients);
};

module.exports = {
  readDatabase,
  writeDatabase,
  addPatient,
};
