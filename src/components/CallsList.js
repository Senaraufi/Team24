import React, { useState } from 'react';

const CallsList = ({ onPickUp }) => {
    const [calls, setCalls] = useState([
        { id: 1, patient_name: 'John Doe', emergency_details: 'Heart attack' },
        { id: 2, patient_name: 'Jane Smith', emergency_details: 'Car accident' },
        { id: 3, patient_name: 'Bob Johnson', emergency_details: 'Stroke' },
    ]);
    const [selectedCall, setSelectedCall] = useState(null);

    const handleCallClick = (call) => {
        setSelectedCall(call);
    };

    const handlePickUp = () => {
        if (selectedCall) {
            alert(`Picked up ${selectedCall.patient_name}`);
            onPickUp(selectedCall);
        } else {
            alert('No call selected');
        }
    };

    return (
        <div style={{ padding: '16px', borderLeft: '1px solid #ccc', height: '100%', width: '20%' }}>
            <h2>Current Calls</h2>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {calls.map((call) => (
                    <li 
                        key={call.id} 
                        onClick={() => handleCallClick(call)} 
                        style={{ 
                            padding: '10px', 
                            cursor: 'pointer', 
                            backgroundColor: selectedCall?.id === call.id ? '#e5e5ea' : 'white', 
                            borderRadius: '8px', 
                            marginBottom: '8px' 
                        }}
                    >
                        {call.patient_name}
                    </li>
                ))}
            </ul>
            <button onClick={handlePickUp} style={{ marginTop: '10px' }}>
                Pick Up Call
            </button>
        </div>
    );
};

export default CallsList;
