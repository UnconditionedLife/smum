import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
         Chip, FormControl, InputLabel, Select, MenuItem, TextField as MuiTextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { dbGetAllShiftsByDateAsync, dbGetShiftsByVolunteerAsync, 
         dbGetShiftsByProgramOrActivityAsync, dbGetAllVolunteersAsync } from '../../../System/js/Database';
import { TextField } from '../../../System';

export default function ShiftsList() {
    const [shifts, setShifts] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [filterType, setFilterType] = useState('date'); // 'date', 'volunteer', 'program', 'activity'
    const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load volunteers for the dropdown
        dbGetAllVolunteersAsync().then(vols => {
            setVolunteers(vols || []);
        });
        // Load initial shifts
        loadShifts();
    }, []);

    useEffect(() => {
        loadShifts();
    }, [filterType, selectedDate, selectedVolunteerId, selectedProgramId, selectedActivityId, startDate, endDate]);

    async function loadShifts() {
        setLoading(true);
        try {
            let shiftsData = [];
            
            switch (filterType) {
                case 'date':
                    const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
                    shiftsData = await dbGetAllShiftsByDateAsync(dateStr);
                    break;
                    
                case 'volunteer':
                    if (selectedVolunteerId) {
                        const start = startDate ? dayjs(startDate).format('YYYY-MM-DD') : null;
                        const end = endDate ? dayjs(endDate).format('YYYY-MM-DD') : null;
                        shiftsData = await dbGetShiftsByVolunteerAsync(selectedVolunteerId, start, end);
                    }
                    break;
                    
                case 'program':
                    if (selectedProgramId) {
                        const dateStr = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;
                        shiftsData = await dbGetShiftsByProgramOrActivityAsync(selectedProgramId, null, dateStr);
                    }
                    break;
                    
                case 'activity':
                    if (selectedActivityId) {
                        const dateStr = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;
                        shiftsData = await dbGetShiftsByProgramOrActivityAsync(null, selectedActivityId, dateStr);
                    }
                    break;
            }
            
            setShifts(shiftsData || []);
        } catch (error) {
            console.error('Error loading shifts:', error);
            setShifts([]);
        } finally {
            setLoading(false);
        }
    }

    function getStatusColor(status) {
        switch (status) {
            case 'Scheduled': return 'primary';
            case 'Completed': return 'success';
            case 'Cancelled': return 'error';
            case 'In Progress': return 'warning';
            case 'Checked In': return 'info';
            default: return 'default';
        }
    }

    function getVolunteerName(volunteerId) {
        const volunteer = volunteers.find(vol => vol.VolunteerId === volunteerId);
        return volunteer ? volunteer.FullName : `Unknown (${volunteerId})`;
    }

    function renderFilterControls() {
        return (
            <Box mb={3} p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Filter By</InputLabel>
                    <Select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        label="Filter By"
                    >
                        <MenuItem value="date">By Date</MenuItem>
                        <MenuItem value="volunteer">By Volunteer</MenuItem>
                        <MenuItem value="program">By Program</MenuItem>
                        <MenuItem value="activity">By Activity</MenuItem>
                    </Select>
                </FormControl>
                
                {filterType === 'date' && (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            label="Select Date"
                        />
                    </LocalizationProvider>
                )}
                
                {filterType === 'volunteer' && (
                    <Box>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select Volunteer</InputLabel>
                            <Select
                                value={selectedVolunteerId}
                                onChange={(e) => setSelectedVolunteerId(e.target.value)}
                                label="Select Volunteer"
                            >
                                <MenuItem value="">None</MenuItem>
                                {volunteers.map(vol => (
                                    <MenuItem key={vol.VolunteerId} value={vol.VolunteerId}>
                                        {vol.FullName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box display="flex" gap={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    value={startDate}
                                    onChange={setStartDate}
                                    renderInput={(params) => <TextField {...params} />}
                                    label="Start Date (Optional)"
                                />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    value={endDate}
                                    onChange={setEndDate}
                                    renderInput={(params) => <TextField {...params} />}
                                    label="End Date (Optional)"
                                />
                            </LocalizationProvider>
                        </Box>
                    </Box>
                )}
                
                {filterType === 'program' && (
                    <Box>
                        <MuiTextField
                            fullWidth
                            label="Program ID"
                            value={selectedProgramId}
                            onChange={(e) => setSelectedProgramId(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={selectedDate}
                                onChange={setSelectedDate}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                label="Date (Optional - defaults to today)"
                            />
                        </LocalizationProvider>
                    </Box>
                )}
                
                {filterType === 'activity' && (
                    <Box>
                        <MuiTextField
                            fullWidth
                            label="Activity ID"
                            value={selectedActivityId}
                            onChange={(e) => setSelectedActivityId(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={selectedDate}
                                onChange={setSelectedDate}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                label="Date (Optional - defaults to today)"
                            />
                        </LocalizationProvider>
                    </Box>
                )}
            </Box>
        );
    }

    function renderShiftsTable() {
        if (loading) {
            return (
                <Box p={3} textAlign="center">
                    <Typography>Loading shifts...</Typography>
                </Box>
            );
        }
        
        if (shifts.length === 0) {
            return (
                <Box p={3} textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                        No shifts found for the selected filter criteria
                    </Typography>
                </Box>
            );
        }
        
        return (
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Check In - Check Out</TableCell>
                            <TableCell>Volunteer Name</TableCell>
                            <TableCell>Activity ID</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shifts.map((shift, index) => {
                            // Handle the actual API response structure
                            const shiftId = shift.ShiftId || `shift-${index}`;
                            const volunteerId = shift.VolunteerId;
                            const date = shift.Date || '-';
                            const programId = shift.ProgramId || '-';
                            const activityId = shift.ActivityId || '-';
                            
                            // Parse timestamps for display
                            const timestampIn = shift.TimestampIn ? new Date(shift.TimestampIn) : null;
                            const timestampOut = shift.TimestampOut ? new Date(shift.TimestampOut) : null;
                            
                            const startTime = timestampIn ? timestampIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';
                            const endTime = timestampOut ? timestampOut.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'In Progress';
                            
                            // Determine status based on timestamps
                            let status = 'Scheduled';
                            if (timestampIn && timestampOut) {
                                status = 'Completed';
                            } else if (timestampIn && !timestampOut) {
                                status = 'Checked In';
                            }
                            
                            return (
                                <TableRow key={shiftId}>
                                    <TableCell>{date}</TableCell>
                                    <TableCell>{`${startTime} - ${endTime}`}</TableCell>
                                    <TableCell>{getVolunteerName(volunteerId)}</TableCell>
                                    <TableCell>{activityId}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={status} 
                                            color={getStatusColor(status)}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return (
        <Box width="100%">
            <Typography variant="h6" sx={{ mb: 2 }}>Shift Records</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                View volunteer check-in/check-out records. Use filters to search by date, volunteer, program, or activity.
            </Typography>
            {renderFilterControls()}
            {renderShiftsTable()}
        </Box>
    );
} 