from flask_socketio import emit
from .services.transcription_service import TranscriptionService
import os

# Initialize services
transcription_service = TranscriptionService(os.getenv('OPENAI_API_KEY'))

def register_handlers(socketio):
    @socketio.on('audio_stream')
    async def handle_audio_stream(data):
        call_id = data['call_id']
        audio_chunk = data['audio']
        
        try:
            # Process audio through transcription service
            result = await transcription_service.process_audio_chunk(audio_chunk)
            
            if result:
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
