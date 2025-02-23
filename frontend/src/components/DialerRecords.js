import React, { useState, useContext } from 'react';
import { Box, Typography, Paper, Grid, Divider, Button, TextField } from '@mui/material';
import { PatientContext } from '../context/PatientContext';
import { savePatientData } from '../utils/api';

const DialerRecords = () => {
    const { patients, addPatient } = useContext(PatientContext);
    const [newPatient, setNewPatient] = useState({ id: '', number: '', time: '', date: '', address: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewPatient({ ...newPatient, [name]: value });
    };

    const handleAddPatient = async () => {
        addPatient(newPatient);
        try {
            await savePatientData(newPatient);
        } catch (error) {
            console.error('Failed to save patient data', error);
        }
        setNewPatient({ id: '', number: '', time: '', date: '', address: '' });
    };

    return (
        <Box sx={{ padding: '10px' }}>
            <Typography variant="h6" gutterBottom>
                Dialer Records
            </Typography>
            <Paper sx={{ padding: '10px', maxHeight: '200px', overflow: 'auto' }}>
                <Grid container spacing={1}>
                    <Grid item xs={2}>
                        <Typography variant="subtitle1" fontWeight="bold">ID</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="subtitle1" fontWeight="bold">Number</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="subtitle1" fontWeight="bold">Time</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="subtitle1" fontWeight="bold">Date</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="subtitle1" fontWeight="bold">Address</Typography>
                    </Grid>
                    <Divider sx={{ width: '100%', marginY: 1 }} />
                    {patients.length > 0 ? (
                        patients.map(record => (
                            <React.Fragment key={record.id}>
                                <Grid item xs={2}>
                                    <Typography variant="body2">{record.id}</Typography>
                                </Grid>
                                <Grid item xs={2}>
                                    <Typography variant="body2">{record.number}</Typography>
                                </Grid>
                                <Grid item xs={2}>
                                    <Typography variant="body2">{record.time}</Typography>
                                </Grid>
                                <Grid item xs={2}>
                                    <Typography variant="body2">{record.date}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2">{record.address}</Typography>
                                </Grid>
                                <Divider sx={{ width: '100%', marginY: 1 }} />
                            </React.Fragment>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography color="text.secondary">
                                No records yet
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>
            <Box sx={{ marginTop: '20px' }}>
                <TextField label="ID" name="id" value={newPatient.id} onChange={handleChange} sx={{ marginRight: '10px' }} />
                <TextField label="Number" name="number" value={newPatient.number} onChange={handleChange} sx={{ marginRight: '10px' }} />
                <TextField label="Time" name="time" value={newPatient.time} onChange={handleChange} sx={{ marginRight: '10px' }} />
                <TextField label="Date" name="date" value={newPatient.date} onChange={handleChange} sx={{ marginRight: '10px' }} />
                <TextField label="Address" name="address" value={newPatient.address} onChange={handleChange} sx={{ marginRight: '10px' }} />
                <Button variant="contained" color="primary" onClick={handleAddPatient}>Add Patient</Button>
            </Box>
        </Box>
    );
};

export default DialerRecords;
