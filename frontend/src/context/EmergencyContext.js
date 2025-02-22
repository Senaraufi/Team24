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
    try {
      const response = await fetch(`${API_URL}/api/start-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setActiveCall(data.call_id);
      return data.call_id;
    } catch (error) {
      console.error('Error starting emergency call:', error);
      return null;
    }
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
