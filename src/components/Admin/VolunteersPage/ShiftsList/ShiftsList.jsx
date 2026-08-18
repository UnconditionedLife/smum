import React, { useState, useEffect, useMemo } from 'react';
import {
    Autocomplete, Box, Grid, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, FormControl, FormControlLabel, InputLabel, Select, MenuItem, Alert,
    TableSortLabel, TextField, InputAdornment, IconButton, Tooltip, Switch,
    createFilterOptions
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Search, Clear, Refresh } from '@mui/icons-material';
import {
    dbGetShiftsByVolunteerAsync, dbGetAllShiftsByDateAsync,
    dbGetAllVolunteersAsync, dbGetAllProgramsAsync,
    dbGetAllActivitiesAsync, dbGetShiftsByDateRangeAsync
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
    const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [startDate, setStartDate] = useState(dayjs().startOf('month'));
    const [endDate, setEndDate] = useState(dayjs().endOf('month'));
    const [volunteers, setVolunteers] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('date');
    const [searchQuery, setSearchQuery] = useState('');
    const [showDeleted, setShowDeleted] = useState(false);
    const [limitedResults, setLimitedResults] = useState(false);

    useEffect(() => {
        loadAll();
    }, []);

    async function loadAll() {
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
    }

    async function loadShifts() {
        setLoading(true);
        setLimitedResults(false);
        try {
            let shiftsData = [];

            // Decide how to query based on filters
            if (selectedVolunteerId) {
                // Fetch shifts for the volunteer. To bypass the backend dual-date query bug, 
                // we fetch all volunteer shifts and then filter them locally.
                shiftsData = await dbGetShiftsByVolunteerAsync(selectedVolunteerId);
            } else {
                // Fetch by date range (enforced or default)
                const startStr = startDate && dayjs(startDate).isValid()
                    ? dayjs(startDate).format('YYYY-MM-DD')
                    : dayjs().startOf('month').format('YYYY-MM-DD');
                const endStr = endDate && dayjs(endDate).isValid()
                    ? dayjs(endDate).format('YYYY-MM-DD')
                    : dayjs().endOf('month').format('YYYY-MM-DD');

                try {
                    shiftsData = await dbGetShiftsByDateRangeAsync(startStr, endStr);
                } catch (err) {
                    console.error("Failed to fetch shifts:", err);
                }
            }

            let decodedShifts = utilDecodeStrings(shiftsData) || [];

            // Apply local post-filtering
            const localStartBoundary = startDate && dayjs(startDate).isValid() ? dayjs(startDate).startOf('day') : null;
            const localEndBoundary = endDate && dayjs(endDate).isValid() ? dayjs(endDate).endOf('day') : null;

            let filtered = decodedShifts.filter(shift => {
                // 1. Date Range filtering (mandatory local step if volunteer is selected)
                if (shift.TimestampIn) {
                    const shiftTime = dayjs(shift.TimestampIn);
                    if (localStartBoundary && shiftTime.isBefore(localStartBoundary)) return false;
                    if (localEndBoundary && shiftTime.isAfter(localEndBoundary)) return false;
                } else if (selectedVolunteerId) {
                    // If no timestamp and filtering by volunteer, check Date field if exists
                    if (shift.Date) {
                        const shiftDate = dayjs(shift.Date);
                        if (localStartBoundary && shiftDate.isBefore(localStartBoundary)) return false;
                        if (localEndBoundary && shiftDate.isAfter(localEndBoundary)) return false;
                    }
                }

                // 2. Program ID filter
                if (selectedProgramId) {
                    const progId = shift.ProgramId || shift.programId;
                    if (progId !== selectedProgramId && progId != selectedProgramId) return false;
                }

                // 3. Activity ID filter
                if (selectedActivityId) {
                    const actId = shift.ActivityId || shift.activityId;
                    if (actId !== selectedActivityId && actId != selectedActivityId) return false;
                }

                return true;
            });

            // Implement initial result size limiting if too many records (e.g. 1000 limit for flexible queries)
            if (filtered.length >= 1000) {
                setLimitedResults(true);
                // Sort raw list descending by timestamp first to keep the 1000 most recent records
                filtered.sort((a, b) => {
                    const timeA = a.TimestampIn ? dayjs(a.TimestampIn).valueOf() : 0;
                    const timeB = b.TimestampIn ? dayjs(b.TimestampIn).valueOf() : 0;
                    return timeB - timeA;
                });
                filtered = filtered.slice(0, 1000);
            }

            setShifts(filtered);
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
                original: shift,
                isDeleted: shift.isDeleted === "true" || shift.isDeleted === true
            };
        });

        // Soft delete filtering
        if (!showDeleted) {
            normalized = normalized.filter(s => !s.isDeleted);
        }

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
    }, [shifts, volunteers, programs, activities, order, orderBy, searchQuery, showDeleted]);

    function handleResetFilters() {
        setStartDate(dayjs().startOf('month'));
        setEndDate(dayjs().endOf('month'));
        setSelectedVolunteerId('');
        setSelectedProgramId('');
        setSelectedActivityId('');
        setSearchQuery('');
        setTimeout(() => {
            loadShifts();
        }, 50);
    }

    function renderFilterControls() {
        return (
            <Box mb={3} p={3} sx={{ backgroundColor: '#fafafa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={startDate}
                                onChange={setStartDate}
                                renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                                label="Start Date"
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={endDate}
                                onChange={setEndDate}
                                renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                                label="End Date"
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                            options={volunteers}
                            getOptionLabel={(vol) =>
                                `${vol.FirstName || vol.firstName || ''} ${vol.LastName || vol.lastName || ''}`.trim()
                            }
                            filterOptions={createFilterOptions({ limit: 20 })}
                            value={volunteers.find(v => v.VolunteerId === selectedVolunteerId) || null}
                            onChange={(e, newValue) => setSelectedVolunteerId(newValue ? newValue.VolunteerId : '')}
                            isOptionEqualToValue={(option, value) => option.VolunteerId === value.VolunteerId}
                            noOptionsText="Type to search..."
                            popupIcon={null}
                            renderOption={(props, option) => {
                                const name = `${option.FirstName || option.firstName || ''} ${option.LastName || option.lastName || ''}`.trim();
                                return (
                                    /* eslint-disable-next-line react/prop-types */
                                    <li {...props} key={props.key || option.VolunteerId}>
                                        {name}
                                    </li>
                                );
                            }}
                            renderInput={(params) => {
                                const { InputProps, ...restParams } = params;
                                return (
                                    <TextField
                                        {...restParams}
                                        size="small"
                                        label="Volunteer"
                                        placeholder="Search volunteers..."
                                        InputProps={{
                                            ...InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ pl: 1 }}>
                                                    <Search color="action" />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                );
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Program</InputLabel>
                            <Select
                                value={selectedProgramId}
                                onChange={(e) => setSelectedProgramId(e.target.value)}
                                label="Program"
                            >
                                <MenuItem value="">All Programs</MenuItem>
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
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Activity</InputLabel>
                            <Select
                                value={selectedActivityId}
                                onChange={(e) => setSelectedActivityId(e.target.value)}
                                label="Activity"
                            >
                                <MenuItem value="">All Activities</MenuItem>
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
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControlLabel
                            control={<Switch checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} color="error" size="small" />}
                            label="Show Deleted"
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} display="flex" justifyContent="flex-end" gap={2}>
                        <Button
                            variant="outlined"
                            onClick={handleResetFilters}
                            size="medium"
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={loadShifts}
                            size="medium"
                            startIcon={<Search />}
                        >
                            Search Shifts
                        </Button>
                    </Grid>
                </Grid>
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
                                sx={{
                                    cursor: 'pointer',
                                    backgroundColor: row.isDeleted ? 'rgba(211, 47, 47, 0.08)' : 'inherit',
                                    '&:hover': {
                                        backgroundColor: row.isDeleted ? 'rgba(211, 47, 47, 0.16)' : '#f5f5f5'
                                    }
                                }}
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
            <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h6">Shift Records</Typography>
                <Chip label={visibleShifts.length} color="secondary" size="small" />
                <Tooltip title="Refresh List">
                    <IconButton size="small" onClick={loadAll} color="success">
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                View volunteer check-in/check-out records. Use filters to search by date or by volunteer.
            </Typography>
            {renderFilterControls()}
            {limitedResults && (
                <Box mb={2}>
                    <Alert severity="warning">
                        Showing only the 1000 most recent shifts. Narrow your date range or apply filters to see more results.
                    </Alert>
                </Box>
            )}
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