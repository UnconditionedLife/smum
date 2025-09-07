import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
         Chip, FormControl, InputLabel, Select, MenuItem, TextField as MuiTextField, IconButton } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { dbGetAllShiftsByDateAsync, dbGetShiftsByVolunteerAsync, 
         dbGetAllVolunteersAsync, dbGetAllProgramsAsync, 
         dbGetAllActivitiesAsync } from '../../../System/js/Database';
import { TextField } from '../../../System';
import ShiftEditDialog from './ShiftEditDialog.jsx';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function ShiftsList() {
    const [shifts, setShifts] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [filterType, setFilterType] = useState('date'); // 'date', 'volunteer'
    const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
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
    }, [filterType, selectedDate, selectedVolunteerId, startDate, endDate]);

    async function loadShifts() {
        setLoading(true);
        try {
            let shiftsData = [];
            
            switch (filterType) {
                case 'date':
                    // For date filtering, we need to get all shifts that fall within the selected date in local time
                    // This means we need to convert the start and end of the local day to UTC
                    const localDayStart = dayjs(selectedDate).startOf('day');
                    const localDayEnd = dayjs(selectedDate).endOf('day');
                    
                    // Convert to UTC - these could span across two UTC dates
                    const utcStartStr = localDayStart.utc().format('YYYY-MM-DD');
                    const utcEndStr = localDayEnd.utc().format('YYYY-MM-DD');
                    
                    // If the local day spans two UTC days, we need to fetch both
                    if (utcStartStr !== utcEndStr) {
                        const shifts1 = await dbGetAllShiftsByDateAsync(utcStartStr);
                        const shifts2 = await dbGetAllShiftsByDateAsync(utcEndStr);
                        shiftsData = [...(shifts1 || []), ...(shifts2 || [])];
                        
                        // Filter to only include shifts within the local day boundaries
                        shiftsData = shiftsData.filter(shift => {
                            if (shift.TimestampIn) {
                                const shiftTime = dayjs.utc(shift.TimestampIn).local();
                                return shiftTime.isSameOrAfter(localDayStart) && shiftTime.isSameOrBefore(localDayEnd);
                            }
                            return false;
                        });
                    } else {
                        // Single UTC day query
                        shiftsData = await dbGetAllShiftsByDateAsync(utcStartStr);
                        
                        // Still filter to ensure we only show shifts from the selected local day
                        shiftsData = (shiftsData || []).filter(shift => {
                            if (shift.TimestampIn) {
                                const shiftTime = dayjs.utc(shift.TimestampIn).local();
                                return shiftTime.isSameOrAfter(localDayStart) && shiftTime.isSameOrBefore(localDayEnd);
                            }
                            return false;
                        });
                    }
                    break;
                    
                case 'volunteer':
                    if (selectedVolunteerId) {
                        // For date range filtering, convert local date boundaries to UTC
                        let utcStart = null;
                        let utcEnd = null;
                        
                        if (startDate) {
                            // Start of day in local time, converted to UTC
                            utcStart = dayjs(startDate).startOf('day').utc().format('YYYY-MM-DD');
                        }
                        
                        if (endDate) {
                            // End of day in local time, converted to UTC
                            // We might need to add one day if the end of local day extends to next UTC day
                            const localEndOfDay = dayjs(endDate).endOf('day');
                            utcEnd = localEndOfDay.utc().format('YYYY-MM-DD');
                        }
                        
                        shiftsData = await dbGetShiftsByVolunteerAsync(selectedVolunteerId, utcStart, utcEnd);
                        
                        // Filter results to ensure they fall within the local date range
                        if (shiftsData && (startDate || endDate)) {
                            const localStartBoundary = startDate ? dayjs(startDate).startOf('day') : null;
                            const localEndBoundary = endDate ? dayjs(endDate).endOf('day') : null;
                            
                            shiftsData = shiftsData.filter(shift => {
                                if (shift.TimestampIn) {
                                    const shiftTime = dayjs.utc(shift.TimestampIn).local();
                                    if (localStartBoundary && shiftTime.isBefore(localStartBoundary)) return false;
                                    if (localEndBoundary && shiftTime.isAfter(localEndBoundary)) return false;
                                    return true;
                                }
                                return false;
                            });
                        }
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
                            <TableCell>Shift ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Check In - Check Out</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Volunteer Name</TableCell>
                            <TableCell>Program</TableCell>
                            <TableCell>Activity</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shifts.map((shift, index) => {
                            // Handle the actual API response structure
                            const shiftId = shift.ShiftId || `shift-${index}`;
                            const displayShiftId = shiftId.length > 8 ? shiftId.substring(0, 8) + '...' : shiftId;
                            const volunteerId = shift.VolunteerId;
                            const programId = shift.ProgramId || shift.programId || null;
                            const activityId = shift.ActivityId || shift.activityId || null;
                            
                            // Parse UTC timestamps and convert to local time for display
                            const timestampIn = shift.TimestampIn ? dayjs.utc(shift.TimestampIn).local() : null;
                            const timestampOut = shift.TimestampOut ? dayjs.utc(shift.TimestampOut).local() : null;
                            
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
                                // Show elapsed time for in-progress shifts
                                const now = dayjs();
                                const durationMinutes = now.diff(timestampIn, 'minute');
                                const hours = Math.floor(durationMinutes / 60);
                                const minutes = durationMinutes % 60;
                                if (hours > 0) {
                                    duration = `${hours}h ${minutes}m (ongoing)`;
                                } else {
                                    duration = `${minutes}m (ongoing)`;
                                }
                            }
                            
                            // Determine status based on timestamps
                            let status = 'Scheduled';
                            if (timestampIn && timestampOut) {
                                status = 'Completed';
                            } else if (timestampIn && !timestampOut) {
                                status = 'Checked In';
                            }
                            
                            return (
                                <TableRow key={shiftId}>
                                    <TableCell title={shiftId}>{displayShiftId}</TableCell>
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
                                    <TableCell>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleEditShift(shift)}
                                            title="Edit Shift"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
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