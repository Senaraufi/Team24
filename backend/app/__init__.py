from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from datetime import datetime
from .models import db, DialerRecord
from .services.symptom_evaluator import SymptomEvaluator

# Load environment variables
load_dotenv()

socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    socketio.init_app(app, cors_allowed_origins="*")
    
    # Configure MySQL database
    app.config.from_object('app.config.Config')
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
            # Get existing symptoms from the call record
            existing_symptoms = emergency_calls[call_id].get('symptoms', [])
            
            # Simulate new symptoms being detected from audio
            # In production, this would be done by AI analysis of the audio
            new_symptoms = []
            if 'chest pain' not in existing_symptoms:
                new_symptoms.append('chest pain')
            if 'shortness of breath' not in existing_symptoms:
                new_symptoms.append('shortness of breath')
            if 'sweating' not in existing_symptoms:
                new_symptoms.append('sweating')
            
            # Combine existing and new symptoms
            updated_symptoms = list(set(existing_symptoms + new_symptoms))
            
            # Evaluate severity based on all symptoms
            severity_score = SymptomEvaluator.evaluate_symptoms(updated_symptoms)
            severity_description = SymptomEvaluator.get_severity_description(severity_score)
            
            # Create analysis result
            analysis = {
                'patient_details': emergency_calls[call_id].get('patient_details', {
                    'age': '45',
                    'gender': 'male'
                }),
                'symptoms': updated_symptoms,
                'severity_score': severity_score,
                'severity_description': severity_description
            }
            
            # Update emergency call record
            emergency_calls[call_id]['transcript'].append(transcription)
            emergency_calls[call_id]['patient_details'].update(analysis['patient_details'])
            emergency_calls[call_id]['symptoms'] = updated_symptoms
            emergency_calls[call_id]['severity_score'] = severity_score
            
            # Update the database record
            with app.app_context():
                record_id = emergency_calls[call_id].get('record_id')
                if record_id:
                    record = DialerRecord.query.get(record_id)
                    if record:
                        record.symptoms = ','.join(updated_symptoms)
                        record.severity_score = severity_score
                        db.session.commit()
            
            # Broadcast updates to all connected clients
            emit('call_update', {
                'call_id': call_id,
                'transcript': transcription,
                'analysis': {
                    'patient_details': analysis['patient_details'],
                    'symptoms': updated_symptoms,
                    'severity_score': severity_score,
                    'severity_description': severity_description
                }
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
