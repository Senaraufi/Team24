from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from datetime import datetime
from services.transcription_service import TranscriptionService
from services.ambulance_service import AmbulanceService

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize services
transcription_service = TranscriptionService(os.getenv('OPENAI_API_KEY'))
ambulance_service = AmbulanceService()

# In-memory storage (replace with database in production)
emergency_calls = {}
doctors_available = {}

@app.route('/api/start-call', methods=['POST'])
def start_emergency_call():
    data = request.json
    call_id = datetime.now().strftime("%Y%m%d%H%M%S")
    emergency_calls[call_id] = {
        'status': 'active',
        'transcript': [],
        'patient_details': {},
        'symptoms': [],
        'severity_score': None,
        'dispatch_info': None
    }
    return jsonify({'call_id': call_id, 'status': 'started'})

@socketio.on('audio_stream')
async def handle_audio_stream(data):
    call_id = data['call_id']
    audio_chunk = data['audio']
    
    try:
        # Process audio through transcription service
        result = await transcription_service.process_audio_chunk(audio_chunk)
        
        if result:
            # Update emergency call record
            emergency_calls[call_id]['transcript'].append(result['transcription'])
            emergency_calls[call_id]['patient_details'].update(result['analysis'].get('patient_details', {}))
            emergency_calls[call_id]['symptoms'] = result['analysis'].get('symptoms', [])
            emergency_calls[call_id]['severity_score'] = result['severity_score']
            
            # Broadcast updates to all connected clients
            emit('call_update', {
                'call_id': call_id,
                'transcript': result['transcription'],
                'analysis': result['analysis'],
                'severity_score': result['severity_score']
            }, broadcast=True)
            
            # If severity is high, notify doctors
            if result['severity_score'] >= 0.8:
                emit('high_priority_alert', {
                    'call_id': call_id,
                    'severity_score': result['severity_score'],
                    'patient_details': result['analysis'].get('patient_details', {}),
                    'symptoms': result['analysis'].get('symptoms', [])
                }, broadcast=True)
    
    except Exception as e:
        emit('error', {'message': str(e)})

@app.route('/api/find-ambulance', methods=['POST'])
def find_nearest_ambulance():
    data = request.json
    location = data['location']
    
    nearest = ambulance_service.find_nearest_ambulance(location)
    if nearest:
        return jsonify(nearest)
    return jsonify({'error': 'No ambulances available'}), 404

@app.route('/api/dispatch-ambulance', methods=['POST'])
def dispatch_ambulance():
    data = request.json
    call_id = data['call_id']
    location = data['location']
    
    # Find and dispatch nearest ambulance
    nearest = ambulance_service.find_nearest_ambulance(location)
    if nearest:
        dispatch_info = ambulance_service.dispatch_ambulance(
            nearest['ambulance_id'],
            location
        )
        
        if dispatch_info:
            # Update emergency call record
            emergency_calls[call_id]['dispatch_info'] = dispatch_info
            
            # Notify all connected clients
            socketio.emit('ambulance_dispatched', {
                'call_id': call_id,
                'dispatch_info': dispatch_info
            })
            
            return jsonify(dispatch_info)
    
    return jsonify({'error': 'Dispatch failed'}), 400

@app.route('/api/update-ambulance-location', methods=['POST'])
def update_ambulance_location():
    data = request.json
    ambulance_service.update_ambulance_location(
        data['ambulance_id'],
        data['location']
    )
    return jsonify({'status': 'updated'})

@app.route('/api/complete-dispatch', methods=['POST'])
def complete_dispatch():
    data = request.json
    ambulance_service.complete_dispatch(data['dispatch_id'])
    return jsonify({'status': 'completed'})

@app.route('/api/doctor-status', methods=['POST'])
def update_doctor_status():
    data = request.json
    doctor_id = data['doctor_id']
    status = data['status']
    
    doctors_available[doctor_id] = status
    return jsonify({'status': 'updated'})

@app.route('/api/call-history', methods=['GET'])
def get_call_history():
    return jsonify(emergency_calls)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
