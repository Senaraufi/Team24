from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class DialerRecord(db.Model):
    __tablename__ = 'dialer_records'
    
    id = db.Column(db.Integer, primary_key=True)
    caller_name = db.Column(db.String(100))
    caller_phone = db.Column(db.String(20))
    emergency_type = db.Column(db.String(50))
    location = db.Column(db.String(200))
    symptoms = db.Column(db.Text)
    severity_score = db.Column(db.Integer)
    call_start_time = db.Column(db.DateTime, default=datetime.utcnow)
    call_end_time = db.Column(db.DateTime)
    transcript = db.Column(db.Text)
    ambulance_dispatched = db.Column(db.Boolean, default=False)
    dispatch_time = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='active')  # active, completed, cancelled
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'caller_name': self.caller_name,
            'caller_phone': self.caller_phone,
            'emergency_type': self.emergency_type,
            'location': self.location,
            'symptoms': self.symptoms,
            'severity_score': self.severity_score,
            'call_start_time': self.call_start_time.isoformat() if self.call_start_time else None,
            'call_end_time': self.call_end_time.isoformat() if self.call_end_time else None,
            'transcript': self.transcript,
            'ambulance_dispatched': self.ambulance_dispatched,
            'dispatch_time': self.dispatch_time.isoformat() if self.dispatch_time else None,
            'status': self.status,
            'notes': self.notes
        }
