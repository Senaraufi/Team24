import { Record } from '../models/Record';

// Using localStorage for persistence
const RECORDS_KEY = 'emergency_records';

export const recordService = {
  getAllRecords: () => {
    const records = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
    return records.map(record => new Record(record));
  },

  addRecord: (recordData) => {
    const records = recordService.getAllRecords();
    const newRecord = new Record(recordData);
    records.unshift(newRecord); // Add to beginning of array
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    return newRecord;
  },

  deleteRecord: (recordId) => {
    const records = recordService.getAllRecords();
    const filteredRecords = records.filter(record => record.id !== recordId);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(filteredRecords));
  },

  clearAllRecords: () => {
    localStorage.setItem(RECORDS_KEY, '[]');
  }
};
