export const savePatientData = async (patient) => {
    const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(patient),
    });

    if (!response.ok) {
        throw new Error('Failed to save patient data');
    }
};
