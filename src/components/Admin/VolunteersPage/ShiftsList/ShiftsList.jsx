import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, FormControl, InputLabel, Select, MenuItem, TextField as MuiTextField, TableSortLabel, TextField, InputAdornment, IconButton
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Search, Clear } from '@mui/icons-material';
import {
    dbGetAllShiftsByDateAsync, dbGetShiftsByVolunteerAsync,
    dbGetAllVolunteersAsync, dbGetAllProgramsAsync,
    dbGetAllActivitiesAsync
} from '../../../System/js/Database';
// import { TextField } from '../../../System'; // Removed custom TextField to avoid conflict with MUI TextField for search
import ShiftEditDialog from './ShiftEditDialog.jsx';
import { utilDecodeStrings } from '../../../System/js/GlobalUtils.js';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    { id: 'date', label: 'Date' },
    { id: 'timeRange', label: 'Check In - Check Out' },
    { id: 'durationMinutes', label: 'Duration' },
    { id: 'volunteerName', label: 'Volunteer Name' },
    { id: 'programName', label: 'Program' },
    { id: 'activityName', label: 'Activity' },
    { id: 'status', label: 'Status' },
];

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
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('date');
    const [searchQuery, setSearchQuery] = useState('');

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

    function handleEditShift(shift) {
        setEditingShift(shift);
    }

    function handleCloseEditDialog(saved = false) {
        setEditingShift(null);
        if (saved) {
            loadShifts(); // Only reload shifts if changes were saved
        }
    }

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const visibleShifts = useMemo(() => {
        let normalized = shifts.map((shift, index) => {
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
            let durationMinutes = 0;
            let displayDuration = '-';
            if (timestampIn && timestampOut) {
                durationMinutes = timestampOut.diff(timestampIn, 'minute');
                const hours = Math.floor(durationMinutes / 60);
                const minutes = durationMinutes % 60;
                if (hours > 0) {
                    displayDuration = `${hours}h ${minutes}m`;
                } else {
                    displayDuration = `${minutes}m`;
                }
            } else if (timestampIn && !timestampOut) {
                // Show "Ongoing" for both checked in and forgotten statuses
                displayDuration = 'Ongoing';
                durationMinutes = 999999; // Sort ongoing shifts to the top/bottom
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

            // Names
            const volunteer = volunteers.find(vol => vol.VolunteerId === volunteerId);
            const volunteerName = volunteer
                ? `${volunteer.FirstName || volunteer.firstName || ''} ${volunteer.LastName || volunteer.lastName || ''}`.trim() || `Unknown (${volunteerId})`
                : `Unknown (${volunteerId})`;

            const program = programs.find(prog => {
                const progId = prog.ProgramId || prog.programId || prog.Id || prog.id || prog.ID;
                return progId === programId || progId == programId;
            });
            const programName = program ? (program.ProgramName || program.Name || program.name || 'N/A') : 'N/A';

            const activity = activities.find(act => {
                const actId = act.ActivityId || act.activityId || act.Id || act.id || act.ID;
                return actId === activityId || actId == activityId;
            });
            const activityName = activity ? (activity.ActivityName_en || activity.ActivityName || activity.Name || activity.name || 'N/A') : 'N/A';

            return {
                id: shiftId,
                date: timestampIn ? timestampIn.valueOf() : 0,
                displayDate,
                timeRange: `${startTime} - ${endTime}`,
                durationMinutes,
                displayDuration,
                volunteerName,
                programName,
                activityName,
                status,
                original: shift
            };
        });

        // Filter based on search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            normalized = normalized.filter(s =>
                s.volunteerName.toLowerCase().includes(query) ||
                s.programName.toLowerCase().includes(query) ||
                s.activityName.toLowerCase().includes(query)
            );
        }

        return stableSort(normalized, getComparator(order, orderBy));
    }, [shifts, volunteers, programs, activities, order, orderBy, searchQuery]);

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
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <TextField
                        size="small"
                        placeholder="Search shifts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                                        <Clear />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    <TableSortLabel
                                        active={orderBy === headCell.id}
                                        direction={orderBy === headCell.id ? order : 'asc'}
                                        onClick={createSortHandler(headCell.id)}
                                    >
                                        {headCell.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visibleShifts.map((row) => (
                            <TableRow
                                key={row.id}
                                onClick={() => handleEditShift(row.original)}
                                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                            >
                                <TableCell>{row.displayDate}</TableCell>
                                <TableCell>{row.timeRange}</TableCell>
                                <TableCell>{row.displayDuration}</TableCell>
                                <TableCell>{row.volunteerName}</TableCell>
                                <TableCell>{row.programName}</TableCell>
                                <TableCell>{row.activityName}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.status}
                                        color={getStatusColor(row.status)}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    const createSortHandler = (property) => (event) => {
        handleRequestSort(event, property);
    };

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