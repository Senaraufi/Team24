import React, { useState, useContext } from 'react';
import { Box, Typography, Paper, Grid, Divider, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { PatientContext } from '../context/PatientContext';
import { savePatientData } from '../utils/api';
import { useEmergency } from '../context/EmergencyContext';

const DialerRecords = () => {
    const { patients, addPatient } = useContext(PatientContext);
    const { severityScore } = useEmergency();
    const [newPatient, setNewPatient] = useState({ name: '', number: '', time: '', date: '', address: '' });

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
        setNewPatient({ name: '', number: '', time: '', date: '', address: '' });
    };

    return (
        <Box sx={{ padding: '10px' }}>
            <Typography variant="h6" gutterBottom>
                Dialer Records
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell> {/* Updated column for patient's name */}
                            <TableCell>Number</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Severity Score</TableCell> {/* New column for severity score */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {patients.length > 0 ? (
                            patients.map(record => (
                                <TableRow key={record.name}>
                                    <TableCell>{record.name}</TableCell> {/* Display patient's name */}
                                    <TableCell>{record.number}</TableCell>
                                    <TableCell>{record.time}</TableCell>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell>{record.address}</TableCell>
                                    <TableCell>{severityScore !== null ? severityScore : 0}</TableCell> {/* Display severity score */}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <Typography color="text.secondary">
                                        No records yet
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ marginTop: '20px' }}>
                <TextField label="Name" name="name" value={newPatient.name} onChange={handleChange} sx={{ marginRight: '10px' }} />
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
