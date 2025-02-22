import React, { createContext, useState, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../services/api';

const EmergencyContext = createContext();

export function EmergencyProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [patientDetails, setPatientDetails] = useState({});
  const [symptoms, setSymptoms] = useState([]);
  const [severityScore, setSeverityScore] = useState(null);
  const [dispatchInfo, setDispatchInfo] = useState(null);

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('call_update', (data) => {
      setTranscript(prev => [...prev, data.transcript]);
      setPatientDetails(data.analysis.patient_details);
      setSymptoms(data.analysis.symptoms);
      setSeverityScore(data.severity_score);
    });

    newSocket.on('ambulance_dispatched', (data) => {
      setDispatchInfo(data.dispatch_info);
    });

    return () => newSocket.close();
  }, []);

  const startEmergencyCall = async () => {
    console.log('Starting emergency call...');
    try {
      // First set active call to indicate we're starting
      const callId = Date.now().toString(); // Generate a temporary ID
      setActiveCall(callId);
      console.log('Set active call ID:', callId);
      
      // For now, we'll just return the temporary ID
      // Later we can integrate with the actual backend
      return callId;
    } catch (error) {
      console.error('Error starting emergency call:', error);
      return null;
    }
  };

  const updatePatientDetails = async (details) => {
    console.log('Updating patient details:', details);
    try {
      setPatientDetails(details);
      console.log('Patient details updated in state');
      // For now, we'll just update the local state
      // Later we can integrate with the actual backend
      return true;
    } catch (error) {
      console.error('Error updating patient details:', error);
      return false;
    }
  };

<<<<<<< HEAD
  const endEmergencyCall = () => {
    setActiveCall(false);
    setPatientDetails(null);
    setSymptoms([]);
    setSeverityScore(0);
=======
  const dispatchAmbulanceToLocation = async (location) => {
    console.log('Dispatching ambulance to location:', location);
    try {
      // Simulate finding nearest ambulance
      const nearbyAmbulance = {
        id: 'AMB-' + Math.floor(Math.random() * 1000),
        location: {
          lat: location.lat + (Math.random() * 0.01 - 0.005),
          lng: location.lng + (Math.random() * 0.01 - 0.005)
        }
      };

      // Update dispatch info
      const dispatchData = {
        ambulance_id: nearbyAmbulance.id,
        estimated_arrival: '10 minutes',
        current_location: nearbyAmbulance.location
      };

      setDispatchInfo(dispatchData);
      return dispatchData;
    } catch (error) {
      console.error('Error dispatching ambulance:', error);
      return null;
    }
>>>>>>> 98cf38a804407db21d4f1c68f8be191e6f2e9807
  };

  const value = {
    socket,
    activeCall,
    transcript,
    patientDetails,
    symptoms,
    severityScore,
    dispatchInfo,
    startEmergencyCall,
    updatePatientDetails,
<<<<<<< HEAD
    endEmergencyCall,
=======
    dispatchAmbulanceToLocation,
>>>>>>> 98cf38a804407db21d4f1c68f8be191e6f2e9807
  };

  return (
    <EmergencyContext.Provider value={value}>
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}
