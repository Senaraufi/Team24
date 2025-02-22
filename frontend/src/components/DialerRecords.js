import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';

const DialerRecords = () => {
    const [dialerRecords, setDialerRecords] = useState([
        { id: 1, number: '123-456-7890', time: '10:00 AM', date: '2023-10-01', address: '123 Main St' },
        { id: 2, number: '987-654-3210', time: '11:00 AM', date: '2023-10-02', address: '456 Oak Ave' },
        // Add more dialed numbers here
    ]);

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
                    {dialerRecords.length > 0 ? (
                        dialerRecords.map(record => (
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
        </Box>
    );
};

export default DialerRecords;
