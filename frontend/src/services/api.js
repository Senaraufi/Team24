import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
    startCall: async () => {
        const response = await axios.post(`${API_BASE_URL}/start-call`);
        return response.data;
    },

    findNearestAmbulance: async (location) => {
        const response = await axios.post(`${API_BASE_URL}/find-ambulance`, { location });
        return response.data;
    },

    dispatchAmbulance: async (callId, location) => {
        const response = await axios.post(`${API_BASE_URL}/dispatch-ambulance`, {
            call_id: callId,
            location
        });
        return response.data;
    },

    updateAmbulanceLocation: async (ambulanceId, location) => {
        const response = await axios.post(`${API_BASE_URL}/update-ambulance-location`, {
            ambulance_id: ambulanceId,
            location
        });
        return response.data;
    },

    completeDispatch: async (dispatchId) => {
        const response = await axios.post(`${API_BASE_URL}/complete-dispatch`, {
            dispatch_id: dispatchId
        });
        return response.data;
    },

    updateDoctorStatus: async (doctorId, status) => {
        const response = await axios.post(`${API_BASE_URL}/doctor-status`, {
            doctor_id: doctorId,
            status
        });
        return response.data;
    },

    getCallHistory: async () => {
        const response = await axios.get(`${API_BASE_URL}/call-history`);
        return response.data;
    }
};
