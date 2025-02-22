from flask import Blueprint, request, jsonify
from ..services.transcription_service import TranscriptionService
from ..services.ambulance_service import AmbulanceService
import os

# Initialize Blueprint
api = Blueprint('api', __name__)

# Initialize services
transcription_service = TranscriptionService(os.getenv('OPENAI_API_KEY'))
ambulance_service = AmbulanceService()

# In-memory storage (replace with database in production)
emergency_calls = {}
doctors_available = {}

@api.route('/start-call', methods=['POST'])
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

@api.route('/find-ambulance', methods=['POST'])
def find_nearest_ambulance():
    data = request.json
    location = data['location']
    
    nearest = ambulance_service.find_nearest_ambulance(location)
    if nearest:
        return jsonify(nearest)
    return jsonify({'error': 'No ambulances available'}), 404

@api.route('/dispatch-ambulance', methods=['POST'])
def dispatch_ambulance():
    data = request.json
    call_id = data['call_id']
    location = data['location']
    
    nearest = ambulance_service.find_nearest_ambulance(location)
    if nearest:
        dispatch_info = ambulance_service.dispatch_ambulance(
            nearest['ambulance_id'],
            location
        )
        
        if dispatch_info:
            emergency_calls[call_id]['dispatch_info'] = dispatch_info
            return jsonify(dispatch_info)
    
    return jsonify({'error': 'Dispatch failed'}), 400

@api.route('/update-ambulance-location', methods=['POST'])
def update_ambulance_location():
    data = request.json
    ambulance_service.update_ambulance_location(
        data['ambulance_id'],
        data['location']
    )
    return jsonify({'status': 'updated'})

@api.route('/complete-dispatch', methods=['POST'])
def complete_dispatch():
    data = request.json
    ambulance_service.complete_dispatch(data['dispatch_id'])
    return jsonify({'status': 'completed'})

@api.route('/doctor-status', methods=['POST'])
def update_doctor_status():
    data = request.json
    doctor_id = data['doctor_id']
    status = data['status']
    
    doctors_available[doctor_id] = status
    return jsonify({'status': 'updated'})

@api.route('/call-history', methods=['GET'])
def get_call_history():
    return jsonify(emergency_calls)
