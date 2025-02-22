import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../services/socket';
import { api } from '../services/api';

const EmergencyContext = createContext();

export const useEmergency = () => {
    const context = useContext(EmergencyContext);
    if (!context) {
        throw new Error('useEmergency must be used within an EmergencyProvider');
    }
    return context;
};

export const EmergencyProvider = ({ children }) => {
    const [activeCalls, setActiveCalls] = useState({});
    const [ambulanceLocations, setAmbulanceLocations] = useState({});

    useEffect(() => {
        // Load initial call history
        const loadCallHistory = async () => {
            try {
                const history = await api.getCallHistory();
                setActiveCalls(history);
            } catch (error) {
                console.error('Error loading call history:', error);
            }
        };
        loadCallHistory();

        // Set up socket listeners
        socket.on('call_update', handleCallUpdate);
        socket.on('ambulance_dispatched', handleAmbulanceDispatched);
        socket.on('ambulance_location_update', handleAmbulanceLocationUpdate);

        return () => {
            socket.off('call_update');
            socket.off('ambulance_dispatched');
            socket.off('ambulance_location_update');
        };
    }, []);

    const handleCallUpdate = (data) => {
        setActiveCalls(prev => ({
            ...prev,
            [data.call_id]: {
                ...(prev[data.call_id] || {}),
                transcript: [...(prev[data.call_id]?.transcript || []), data.transcript],
                analysis: data.analysis,
                severity_score: data.severity_score
            }
        }));
    };

    const handleAmbulanceDispatched = (data) => {
        setActiveCalls(prev => ({
            ...prev,
            [data.call_id]: {
                ...(prev[data.call_id] || {}),
                dispatch_info: data.dispatch_info
            }
        }));
    };

    const handleAmbulanceLocationUpdate = (data) => {
        setAmbulanceLocations(prev => ({
            ...prev,
            [data.ambulance_id]: data.location
        }));
    };

    const startCall = async () => {
        try {
            const response = await api.startCall();
            setActiveCalls(prev => ({
                ...prev,
                [response.call_id]: {
                    status: 'active',
                    transcript: [],
                    patient_details: {},
                    symptoms: [],
                    severity_score: null,
                    dispatch_info: null
                }
            }));
            return response.call_id;
        } catch (error) {
            console.error('Error starting call:', error);
            throw error;
        }
    };

    const dispatchAmbulance = async (callId, location) => {
        try {
            const response = await api.dispatchAmbulance(callId, location);
            return response;
        } catch (error) {
            console.error('Error dispatching ambulance:', error);
            throw error;
        }
    };

    const value = {
        activeCalls,
        ambulanceLocations,
        startCall,
        dispatchAmbulance
    };

    return (
        <EmergencyContext.Provider value={value}>
            {children}
        </EmergencyContext.Provider>
    );
};
