export class Record {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.timestamp = data.timestamp || new Date().toISOString();
    this.patientName = data.patientName || 'Unknown';
    this.patientAge = data.patientAge;
    this.symptoms = data.symptoms || [];
    this.injuries = data.injuries || [];
    this.priority = data.priority || 'LOW';
    this.transcript = data.transcript || '';
    this.address = data.address || '';
  }
}
