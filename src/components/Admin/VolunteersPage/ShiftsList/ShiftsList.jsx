import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
         Chip, FormControl, InputLabel, Select, MenuItem, TextField as MuiTextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { dbGetAllShiftsByDateAsync, dbGetShiftsByVolunteerAsync,
         dbGetAllVolunteersAsync, dbGetAllProgramsAsync,
         dbGetAllActivitiesAsync, dbGetShiftsByProgramOrActivityAsync } from '../../../System/js/Database';
import { TextField } from '../../../System';
import ShiftEditDialog from './ShiftEditDialog.jsx';
import { utilDecodeStrings } from '../../../System/js/GlobalUtils.js';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
    const [programs, setPrograms] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingShift, setEditingShift] = useState(null);

    useEffect(() => {
        // Load volunteers, programs, and activities for the dropdowns and decoding
        Promise.all([
            dbGetAllVolunteersAsync(),
            dbGetAllProgramsAsync(),
            dbGetAllActivitiesAsync()
        ]).then(([vols, progs, acts]) => {
            setVolunteers(vols || []);
            setPrograms(progs || []);
            setActivities(acts || []);
        }).catch(err => {
            console.error('Error loading data:', err);
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
                    // Get all shifts for the selected date (using local time)
                    const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
                    shiftsData = await dbGetAllShiftsByDateAsync(dateStr);
                    
                    // Filter to only include shifts within the selected day
                    const localDayStart = dayjs(selectedDate).startOf('day');
                    const localDayEnd = dayjs(selectedDate).endOf('day');
                    
                    shiftsData = (shiftsData || []).filter(shift => {
                        if (shift.TimestampIn) {
                            const shiftTime = dayjs(shift.TimestampIn);
                            return shiftTime.isSameOrAfter(localDayStart) && shiftTime.isSameOrBefore(localDayEnd);
                        }
                        return false;
                    });
                    break;
                    
                case 'volunteer':
                    if (selectedVolunteerId) {
                        // Use local dates directly
                        let localStart = null;
                        let localEnd = null;

                        if (startDate) {
                            localStart = dayjs(startDate).format('YYYY-MM-DD');
                        }

                        if (endDate) {
                            localEnd = dayjs(endDate).format('YYYY-MM-DD');
                        }

                        shiftsData = await dbGetShiftsByVolunteerAsync(selectedVolunteerId, localStart, localEnd);

                        // Filter results to ensure they fall within the local date range
                        if (shiftsData && (startDate || endDate)) {
                            const localStartBoundary = startDate ? dayjs(startDate).startOf('day') : null;
                            const localEndBoundary = endDate ? dayjs(endDate).endOf('day') : null;

                            shiftsData = shiftsData.filter(shift => {
                                if (shift.TimestampIn) {
                                    const shiftTime = dayjs(shift.TimestampIn);
                                    if (localStartBoundary && shiftTime.isBefore(localStartBoundary)) return false;
                                    if (localEndBoundary && shiftTime.isAfter(localEndBoundary)) return false;
                                    return true;
                                }
                                return false;
                            });
                        }
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
            
            setShifts(utilDecodeStrings(shiftsData) || []);
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
            case 'Checked In': return 'info';  // Blue chip for current day
            case 'Forgotten': return 'error';  // Red chip for not current day
            default: return 'default';
        }
    }

    function getVolunteerName(volunteerId) {
        const volunteer = volunteers.find(vol => vol.VolunteerId === volunteerId);
        if (volunteer) {
            const firstName = volunteer.FirstName || volunteer.firstName || '';
            const lastName = volunteer.LastName || volunteer.lastName || '';
            return `${firstName} ${lastName}`.trim() || `Unknown (${volunteerId})`;
        }
        return `Unknown (${volunteerId})`;
    }

    function getProgramName(programId) {
        if (!programId || programId === '-') return 'N/A';
        const program = programs.find(prog => {
            // Check various possible ID field names
            const progId = prog.ProgramId || prog.programId || prog.Id || prog.id || prog.ID;
            return progId === programId || progId == programId;
        });
        if (program) {
            return program.ProgramName || program.Name || program.name || 'N/A';
        }
        return 'N/A';
    }

    function handleEditShift(shift) {
        setEditingShift(shift);
    }

    function handleCloseEditDialog(saved = false) {
        setEditingShift(null);
        if (saved) {
            loadShifts(); // Only reload shifts if changes were saved
        }
    }

    function getActivityName(activityId) {
        if (!activityId || activityId === '-') return 'N/A';
        const activity = activities.find(act => {
            // Check various possible ID field names
            const actId = act.ActivityId || act.activityId || act.Id || act.id || act.ID;
            return actId === activityId || actId == activityId;
        });
        if (activity) {
            return activity.ActivityName_en || activity.ActivityName || activity.Name || activity.name || 'N/A';
        }
        return 'N/A';
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
                                        {`${vol.FirstName || vol.firstName || ''} ${vol.LastName || vol.lastName || ''}`.trim()}
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
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select Program</InputLabel>
                            <Select
                                value={selectedProgramId}
                                onChange={(e) => setSelectedProgramId(e.target.value)}
                                label="Select Program"
                            >
                                <MenuItem value="">None</MenuItem>
                                {programs.map(prog => {
                                    const progId = prog.ProgramId || prog.programId || prog.Id || prog.id;
                                    const progName = prog.ProgramName || prog.Name || prog.name || `Program ${progId}`;
                                    return (
                                        <MenuItem key={progId} value={progId}>
                                            {progName}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={selectedDate}
                                onChange={setSelectedDate}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                label="Select Date"
                            />
                        </LocalizationProvider>
                    </Box>
                )}

                {filterType === 'activity' && (
                    <Box>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select Activity</InputLabel>
                            <Select
                                value={selectedActivityId}
                                onChange={(e) => setSelectedActivityId(e.target.value)}
                                label="Select Activity"
                            >
                                <MenuItem value="">None</MenuItem>
                                {activities.map(act => {
                                    const actId = act.ActivityId || act.activityId || act.Id || act.id;
                                    const actName = act.ActivityName_en || act.ActivityName || act.Name || act.name || `Activity ${actId}`;
                                    return (
                                        <MenuItem key={actId} value={actId}>
                                            {actName}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={selectedDate}
                                onChange={setSelectedDate}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                label="Select Date"
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
                            <TableCell>Duration</TableCell>
                            <TableCell>Volunteer Name</TableCell>
                            <TableCell>Program</TableCell>
                            <TableCell>Activity</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shifts.map((shift, index) => {
                            // Handle the actual API response structure
                            const shiftId = shift.ShiftId || `shift-${index}`;
                            const volunteerId = shift.VolunteerId;
                            const programId = shift.ProgramId || shift.programId || null;
                            const activityId = shift.ActivityId || shift.activityId || null;
                            
                            // Parse timestamps (already in local time)
                            const timestampIn = shift.TimestampIn ? dayjs(shift.TimestampIn) : null;
                            const timestampOut = shift.TimestampOut ? dayjs(shift.TimestampOut) : null;
                            
                            // Get the date from the timestamp (in local time) or from the Date field
                            let displayDate = shift.Date || '-';
                            if (timestampIn) {
                                displayDate = timestampIn.format('YYYY-MM-DD');
                            }
                            
                            const startTime = timestampIn ? timestampIn.format('h:mm A') : '-';
                            const endTime = timestampOut ? timestampOut.format('h:mm A') : 'In Progress';
                            
                            // Calculate duration
                            let duration = '-';
                            if (timestampIn && timestampOut) {
                                const durationMinutes = timestampOut.diff(timestampIn, 'minute');
                                const hours = Math.floor(durationMinutes / 60);
                                const minutes = durationMinutes % 60;
                                if (hours > 0) {
                                    duration = `${hours}h ${minutes}m`;
                                } else {
                                    duration = `${minutes}m`;
                                }
                            } else if (timestampIn && !timestampOut) {
                                // Show "Ongoing" for both checked in and forgotten statuses
                                duration = 'Ongoing';
                            }
                            
                            // Determine status based on timestamps and date
                            let status = 'Scheduled';
                            if (timestampIn && timestampOut) {
                                status = 'Completed';
                            } else if (timestampIn && !timestampOut) {
                                // Check if it's the current day for open check-ins vs forgotten check-outs
                                const today = dayjs().startOf('day');
                                const shiftDate = timestampIn.startOf('day');
                                
                                if (shiftDate.isSame(today)) {
                                    status = 'Checked In';
                                } else {
                                    status = 'Forgotten';
                                }
                            }
                            
                            return (
                                <TableRow 
                                    key={shiftId}
                                    onClick={() => handleEditShift(shift)}
                                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                                >
                                    <TableCell>{displayDate}</TableCell>
                                    <TableCell>{`${startTime} - ${endTime}`}</TableCell>
                                    <TableCell>{duration}</TableCell>
                                    <TableCell>{getVolunteerName(volunteerId)}</TableCell>
                                    <TableCell>{getProgramName(programId)}</TableCell>
                                    <TableCell>{getActivityName(activityId)}</TableCell>
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
                View volunteer check-in/check-out records. Use filters to search by date or by volunteer.
            </Typography>
            {renderFilterControls()}
            {renderShiftsTable()}
            
            {/* Edit Dialog */}
            <ShiftEditDialog
                open={!!editingShift}
                shift={editingShift}
                onClose={handleCloseEditDialog}
                volunteers={volunteers}
                programs={programs}
                activities={activities}
            />
        </Box>
    );
} 