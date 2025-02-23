from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from datetime import datetime
from .models import db, DialerRecord

# Load environment variables
load_dotenv()

socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    socketio.init_app(app, cors_allowed_origins="*")
    
    # Configure SQLite database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///emergency.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    # Create database tables
    with app.app_context():
        db.create_all()

    # In-memory storage (replace with database in production)
    emergency_calls = {}
    doctors_available = {}

    @app.route('/api/start-call', methods=['POST'])
    def start_emergency_call():
        data = request.json
        call_id = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Create new dialer record
        record = DialerRecord(
            caller_name=data.get('caller_name'),
            caller_phone=data.get('caller_phone'),
            emergency_type=data.get('emergency_type'),
            location=data.get('location'),
            status='active'
        )
        db.session.add(record)
        db.session.commit()
        
        emergency_calls[call_id] = {
            'record_id': record.id,
            'status': 'active',
            'transcript': [],
            'patient_details': {},
            'symptoms': [],
            'severity_score': None,
            'dispatch_info': None
        }
        return jsonify({'call_id': call_id, 'record_id': record.id, 'status': 'started'})

    @socketio.on('audio_stream')
    def handle_audio_stream(data):
        call_id = data['call_id']
        audio_chunk = data['audio']
        
        try:
            # Simulate AI transcription and analysis
            transcription = "Patient complaining of chest pain and shortness of breath"
            analysis = {
                'patient_details': {
                    'age': '45',
                    'gender': 'male'
                },
                'symptoms': [
                    'chest pain',
                    'shortness of breath',
                    'sweating'
                ]
            }
            severity_score = 0.8  # High severity for chest pain
            
            # Update emergency call record
            emergency_calls[call_id]['transcript'].append(transcription)
            emergency_calls[call_id]['patient_details'].update(analysis['patient_details'])
            emergency_calls[call_id]['symptoms'] = analysis['symptoms']
            emergency_calls[call_id]['severity_score'] = severity_score
            
            # Broadcast updates to all connected clients
            emit('call_update', {
                'call_id': call_id,
                'transcript': transcription,
                'analysis': analysis,
                'severity_score': severity_score
            }, broadcast=True)
            
            # If severity is high, notify doctors
            if severity_score >= 0.8:
                emit('high_priority_alert', {
                    'call_id': call_id,
                    'severity_score': severity_score,
                    'patient_details': analysis['patient_details'],
                    'symptoms': analysis['symptoms']
                }, broadcast=True)
        
        except Exception as e:
            emit('error', {'message': str(e)})

    @app.route('/api/find-ambulance', methods=['POST'])
    def find_nearest_ambulance():
        data = request.json
        location = data['location']
        
        # Simulate finding nearest ambulance
        nearest = {
            'ambulance_id': 'amb1',
            'location': {'lat': 53.3498, 'lng': -6.2603},  # Dublin city center
            'eta_minutes': 5
        }
        return jsonify(nearest)

    @app.route('/api/dispatch-ambulance', methods=['POST'])
    def dispatch_ambulance():
        data = request.json
        call_id = data['call_id']
        location = data['location']
        
        # Simulate ambulance dispatch
        dispatch_info = {
            'ambulance_id': 'amb1',
            'dispatch_time': datetime.now().isoformat(),
            'location': location,
            'eta_minutes': 5
        }
        
        # Update emergency call record
        emergency_calls[call_id]['dispatch_info'] = dispatch_info
        
        # Notify all connected clients
        socketio.emit('ambulance_dispatched', {
            'call_id': call_id,
            'dispatch_info': dispatch_info
        })
        
        return jsonify(dispatch_info)

    @app.route('/api/update-ambulance-location', methods=['POST'])
    def update_ambulance_location():
        data = request.json
        return jsonify({'status': 'updated', 'location': data['location']})

    @app.route('/api/doctor-status', methods=['POST'])
    def update_doctor_status():
        data = request.json
        doctor_id = data['doctor_id']
        status = data['status']
        
        doctors_available[doctor_id] = status
        return jsonify({'status': 'updated'})

    @app.route('/api/call-history', methods=['GET'])
    def get_call_history():
        return jsonify(list(emergency_calls.values()))

    # Routes for managing dialer records
    @app.route('/api/dialer-records', methods=['GET'])
    def get_dialer_records():
        records = DialerRecord.query.all()
        return jsonify([record.to_dict() for record in records])
    
    @app.route('/api/dialer-records/<int:record_id>', methods=['GET'])
    def get_dialer_record(record_id):
        record = DialerRecord.query.get_or_404(record_id)
        return jsonify(record.to_dict())
    
    @app.route('/api/dialer-records/<int:record_id>', methods=['PUT'])
    def update_dialer_record(record_id):
        record = DialerRecord.query.get_or_404(record_id)
        data = request.json
        
        for key, value in data.items():
            if hasattr(record, key):
                setattr(record, key, value)
        
        db.session.commit()
        return jsonify(record.to_dict())
    
    @app.route('/api/dialer-records/<int:record_id>', methods=['DELETE'])
    def delete_dialer_record(record_id):
        record = DialerRecord.query.get_or_404(record_id)
        db.session.delete(record)
        db.session.commit()
        return jsonify({'message': 'Record deleted successfully'})
    
    return app
