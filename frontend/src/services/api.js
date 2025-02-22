export const API_URL = 'http://127.0.0.1:5001';

export async function findNearestAmbulance(location) {
  try {
    const response = await fetch(`${API_URL}/api/find-ambulance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error finding nearest ambulance:', error);
    return null;
  }
}

export async function dispatchAmbulance(callId, location) {
  try {
    const response = await fetch(`${API_URL}/api/dispatch-ambulance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call_id: callId, location }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error dispatching ambulance:', error);
    return null;
  }
}

export async function updateDoctorStatus(doctorId, status) {
  try {
    const response = await fetch(`${API_URL}/api/doctor-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor_id: doctorId, status }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating doctor status:', error);
    return null;
  }
}
