import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem,
    Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Paper, TableSortLabel, Chip, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { ExpandMore, Download } from '@mui/icons-material';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import {
    dbGetAllVolunteersAsync, dbGetShiftsByVolunteerAsync, dbGetShiftsByDateRangeAsync,
    dbGetAllProgramsAsync, dbGetAllActivitiesAsync
} from '../../System/js/Database';
import { utilDecodeStrings } from '../../System/js/GlobalUtils.js';
import { formatPhone } from '../../System/js/Forms';

export default function Reports() {
    const [reportType, setReportType] = useState('shifts'); // 'volunteers', 'shifts'
    const [groupBy, setGroupBy] = useState('month'); // 'month', 'year', 'program', 'activity', 'volunteer', 'status'
    const [yearFilter, setYearFilter] = useState(dayjs().year());
    const [monthFilter, setMonthFilter] = useState('All');
    const [orderBy, setOrderBy] = useState('date');
    const [order, setOrder] = useState('desc');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);

    const [volunteers, setVolunteers] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [activities, setActivities] = useState([]);

    // Generate year options (current year +/- 5 years)
    const currentYear = dayjs().year();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).reverse();

    const months = [
        'All', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        // Load metadata
        Promise.all([
            dbGetAllVolunteersAsync(),
            dbGetAllProgramsAsync(),
            dbGetAllActivitiesAsync()
        ]).then(([vols, progs, acts]) => {
            setVolunteers(vols || []);
            setPrograms(progs || []);
            setActivities(acts || []);
        }).catch(err => console.error('Error loading metadata:', err));
    }, []);

    const handleRunReport = async () => {
        setLoading(true);
        setReportData([]);

        try {
            if (reportType === 'volunteers') {
                // For volunteers, filter and return the actual volunteer records
                let filteredVols = volunteers;
                if (yearFilter !== 'All') {
                    filteredVols = volunteers.filter(v => {
                        if (!v.Time) return false;
                        const regDate = dayjs(v.Time);
                        if (regDate.year() !== yearFilter) return false;
                        if (monthFilter !== 'All') {
                            return regDate.format('MMMM') === monthFilter;
                        }
                        return true;
                    });
                }

                // Enrich volunteers with program names and other computed fields
                const enrichedVols = filteredVols.map(v => {
                    const prog = programs.find(p => (p.ProgramId || p.programId) === (v.ProgramId || v.programId));
                    const programName = prog ? (prog.ProgramName || prog.Name || 'N/A') : 'N/A';

                    return {
                        ...v,
                        programName,
                        registrationDate: v.Time ? dayjs(v.Time).format('MMM D, YYYY h:mm A') : 'N/A',
                        status: v.RegComplete ? 'Registered' : 'Not Registered',
                        sortDate: v.Time ? dayjs(v.Time).valueOf() : 0,
                        groupKey: getGroupKey(v, groupBy, programs)
                    };
                });

                setReportData(enrichedVols);

            } else if (reportType === 'shifts') {
                // For shifts, fetch and return the actual shift records
                let startDate, endDate;

                if (monthFilter === 'All') {
                    startDate = `${yearFilter}-01-01`;
                    endDate = `${yearFilter}-12-31`;
                } else {
                    const monthIndex = months.indexOf(monthFilter);
                    const monthNum = monthIndex - 1;
                    const start = dayjs().year(yearFilter).month(monthNum).startOf('month');
                    const end = dayjs().year(yearFilter).month(monthNum).endOf('month');
                    startDate = start.format('YYYY-MM-DD');
                    endDate = end.format('YYYY-MM-DD');
                }

                let shifts = [];
                try {
                    const rawShifts = await dbGetShiftsByDateRangeAsync(startDate, endDate);
                    shifts = utilDecodeStrings(rawShifts) || [];
                } catch (err) {
                    console.error("Failed to fetch shifts by date range:", err);
                }

                // Enrich shifts with volunteer names, program names, activity names, etc.
                const volMap = new Map(volunteers.map(v => [v.VolunteerId, v]));

                const enrichedShifts = shifts.map(shift => {
                    const timestampIn = shift.TimestampIn ? dayjs(shift.TimestampIn) : null;
                    const timestampOut = shift.TimestampOut ? dayjs(shift.TimestampOut) : null;

                    const displayDate = timestampIn ? timestampIn.format('YYYY-MM-DD') : (shift.Date || '-');
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
                        displayDuration = 'Ongoing';
                        durationMinutes = 999999;
                    }

                    // Determine status
                    let status = 'Scheduled';
                    if (timestampIn && timestampOut) {
                        status = 'Completed';
                    } else if (timestampIn && !timestampOut) {
                        const today = dayjs().startOf('day');
                        const shiftDate = timestampIn.startOf('day');
                        if (shiftDate.isSame(today)) {
                            status = 'Checked In';
                        } else {
                            status = 'Forgotten';
                        }
                    }

                    // Get volunteer name
                    const volunteer = volMap.get(shift.VolunteerId);
                    const volunteerName = volunteer
                        ? `${volunteer.FirstName || volunteer.firstName || ''} ${volunteer.LastName || volunteer.lastName || ''}`.trim() || `Unknown (${shift.VolunteerId})`
                        : `Unknown (${shift.VolunteerId})`;

                    // Get program name
                    const program = programs.find(prog => {
                        const progId = prog.ProgramId || prog.programId || prog.Id || prog.id || prog.ID;
                        return progId === shift.ProgramId || progId == shift.ProgramId;
                    });
                    const programName = program ? (program.ProgramName || program.Name || program.name || 'N/A') : 'N/A';

                    // Get activity name
                    const activity = activities.find(act => {
                        const actId = act.ActivityId || act.activityId || act.Id || act.id || act.ID;
                        return actId === shift.ActivityId || actId == shift.ActivityId;
                    });
                    const activityName = activity ? (activity.ActivityName_en || activity.ActivityName || activity.Name || activity.name || 'N/A') : 'N/A';

                    return {
                        ...shift,
                        displayDate,
                        timeRange: `${startTime} - ${endTime}`,
                        durationMinutes,
                        displayDuration,
                        volunteerName,
                        programName,
                        activityName,
                        status,
                        sortDate: timestampIn ? timestampIn.valueOf() : 0,
                        groupKey: getGroupKeyForShift(shift, groupBy, timestampIn, volunteerName, programName, activityName)
                    };
                });

                setReportData(enrichedShifts);
            }
        } catch (error) {
            console.error('Error running report:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get group key for volunteers
    function getGroupKey(volunteer, groupBy, programs) {
        if (groupBy === 'month') {
            return volunteer.Time ? dayjs(volunteer.Time).format('MMMM YYYY') : 'Unknown';
        } else if (groupBy === 'year') {
            return volunteer.Time ? dayjs(volunteer.Time).format('YYYY') : 'Unknown';
        } else if (groupBy === 'program') {
            const prog = programs.find(p => (p.ProgramId || p.programId) === (volunteer.ProgramId || volunteer.programId));
            return prog ? (prog.ProgramName || prog.Name || 'N/A') : 'N/A';
        } else if (groupBy === 'status') {
            return volunteer.RegComplete ? 'Registered' : 'Not Registered';
        }
        return 'Unknown';
    }

    // Helper function to get group key for shifts
    function getGroupKeyForShift(shift, groupBy, timestampIn, volunteerName, programName, activityName) {
        if (groupBy === 'month') {
            return timestampIn ? timestampIn.format('MMMM YYYY') : 'Unknown';
        } else if (groupBy === 'year') {
            return timestampIn ? timestampIn.format('YYYY') : 'Unknown';
        } else if (groupBy === 'program') {
            return programName;
        } else if (groupBy === 'activity') {
            return activityName;
        } else if (groupBy === 'volunteer') {
            return volunteerName;
        }
        return 'Unknown';
    }

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Group and sort data
    const groupedData = useMemo(() => {
        // First sort the data
        const sorted = [...reportData].sort((a, b) => {
            let compareResult = 0;

            if (reportType === 'volunteers') {
                if (orderBy === 'firstName') {
                    compareResult = (a.FirstName || a.firstName || '').localeCompare(b.FirstName || b.firstName || '');
                } else if (orderBy === 'lastName') {
                    compareResult = (a.LastName || a.lastName || '').localeCompare(b.LastName || b.lastName || '');
                } else if (orderBy === 'email') {
                    compareResult = (a.Email || a.email || '').localeCompare(b.Email || b.email || '');
                } else if (orderBy === 'programName') {
                    compareResult = a.programName.localeCompare(b.programName);
                } else if (orderBy === 'date') {
                    compareResult = a.sortDate - b.sortDate;
                } else if (orderBy === 'status') {
                    compareResult = a.status.localeCompare(b.status);
                }
            } else if (reportType === 'shifts') {
                if (orderBy === 'date') {
                    compareResult = a.sortDate - b.sortDate;
                } else if (orderBy === 'volunteerName') {
                    compareResult = a.volunteerName.localeCompare(b.volunteerName);
                } else if (orderBy === 'programName') {
                    compareResult = a.programName.localeCompare(b.programName);
                } else if (orderBy === 'activityName') {
                    compareResult = a.activityName.localeCompare(b.activityName);
                } else if (orderBy === 'duration') {
                    compareResult = a.durationMinutes - b.durationMinutes;
                } else if (orderBy === 'status') {
                    compareResult = a.status.localeCompare(b.status);
                }
            }

            return order === 'asc' ? compareResult : -compareResult;
        });

        // Group the sorted data
        const groups = {};
        sorted.forEach(item => {
            const key = item.groupKey;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        // Convert to array and sort groups
        const groupArray = Object.entries(groups).map(([groupName, items]) => {
            // Calculate group totals
            const count = items.length;
            let hours = 0;
            if (reportType === 'shifts') {
                hours = items.reduce((sum, shift) => {
                    if (shift.durationMinutes && shift.durationMinutes < 999999) {
                        return sum + shift.durationMinutes / 60;
                    }
                    return sum;
                }, 0);
            }

            return {
                groupName,
                items,
                count,
                hours: hours.toFixed(1)
            };
        });

        // Sort groups by name (with special handling for dates)
        groupArray.sort((a, b) => {
            if (groupBy === 'month') {
                return dayjs(a.groupName, 'MMMM YYYY').valueOf() - dayjs(b.groupName, 'MMMM YYYY').valueOf();
            }
            return a.groupName.localeCompare(b.groupName);
        });

        return groupArray;
    }, [reportData, reportType, orderBy, order, groupBy]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Scheduled': return 'primary';
            case 'Completed': return 'success';
            case 'Cancelled': return 'error';
            case 'In Progress': return 'warning';
            case 'Checked In': return 'info';
            case 'Forgotten': return 'error';
            case 'Registered': return 'success';
            case 'Not Registered': return 'warning';
            default: return 'default';
        }
    };

    // Calculate totals
    const totalCount = reportData.length;
    const totalHours = reportType === 'shifts'
        ? reportData.reduce((sum, shift) => {
            if (shift.durationMinutes && shift.durationMinutes < 999999) {
                return sum + shift.durationMinutes / 60;
            }
            return sum;
        }, 0).toFixed(1)
        : 0;

    // Export functions
    const exportToCSV = () => {
        if (reportData.length === 0) return;

        // Flatten grouped data for export
        const flatData = groupedData.flatMap(group =>
            group.items.map(item => ({
                Group: group.groupName,
                ...item
            }))
        );

        let csvContent = '';

        // Add report header information
        const reportTitle = reportType === 'shifts' ? 'Shifts Report' : 'Volunteers Report';
        csvContent += `"${reportTitle}"\n`;
        csvContent += `"Grouped by: ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}"\n`;
        csvContent += `"Year: ${yearFilter}"\n`;
        if (monthFilter !== 'All') {
            csvContent += `"Month: ${monthFilter}"\n`;
        }
        csvContent += `"Generated on: ${dayjs().format('MMMM D, YYYY [at] h:mm A')}"\n`;
        csvContent += '\n';

        let headers = [];

        if (reportType === 'volunteers') {
            headers = ['Group', 'First Name', 'Last Name', 'Email', 'Telephone', 'Program', 'Registered', 'Status'];
            csvContent += headers.join(',') + '\n';

            flatData.forEach(volunteer => {
                const row = [
                    volunteer.Group,
                    volunteer.FirstName || volunteer.firstName || '',
                    volunteer.LastName || volunteer.lastName || '',
                    volunteer.Email || volunteer.email || '',
                    formatPhone(volunteer.Telephone || volunteer.telephone || ''),
                    volunteer.programName,
                    volunteer.registrationDate,
                    volunteer.status
                ];
                csvContent += row.map(field => `"${field}"`).join(',') + '\n';
            });
        } else {
            headers = ['Group', 'Date', 'Time Range', 'Duration', 'Volunteer', 'Program', 'Activity', 'Status'];
            csvContent += headers.join(',') + '\n';

            flatData.forEach(shift => {
                const row = [
                    shift.Group,
                    shift.displayDate,
                    shift.timeRange,
                    shift.displayDuration,
                    shift.volunteerName,
                    shift.programName,
                    shift.activityName,
                    shift.status
                ];
                csvContent += row.map(field => `"${field}"`).join(',') + '\n';
            });
        }

        // Add summary rows
        csvContent += '\n';
        csvContent += `"Total Count","${totalCount}"\n`;
        if (reportType === 'shifts') {
            csvContent += `"Total Hours","${totalHours}"\n`;
        }

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const filename = `${reportType}_report_${groupBy}_${yearFilter}${monthFilter !== 'All' ? '_' + monthFilter : ''}_${dayjs().format('YYYY-MM-DD')}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToExcel = () => {
        if (reportData.length === 0) return;

        // Flatten grouped data for export
        const flatData = groupedData.flatMap(group =>
            group.items.map(item => ({
                Group: group.groupName,
                ...item
            }))
        );

        let excelData = [];

        // Add report header information
        const reportTitle = reportType === 'shifts' ? 'Shifts Report' : 'Volunteers Report';
        excelData.push({ 'A': reportTitle });
        excelData.push({ 'A': `Grouped by: ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}` });
        excelData.push({ 'A': `Year: ${yearFilter}` });
        if (monthFilter !== 'All') {
            excelData.push({ 'A': `Month: ${monthFilter}` });
        }
        excelData.push({ 'A': `Generated on: ${dayjs().format('MMMM D, YYYY [at] h:mm A')}` });
        excelData.push({});

        let dataRows = [];
        if (reportType === 'volunteers') {
            dataRows = flatData.map(volunteer => ({
                'Group': volunteer.Group,
                'First Name': volunteer.FirstName || volunteer.firstName || '',
                'Last Name': volunteer.LastName || volunteer.lastName || '',
                'Email': volunteer.Email || volunteer.email || '',
                'Telephone': formatPhone(volunteer.Telephone || volunteer.telephone || ''),
                'Program': volunteer.programName,
                'Registered': volunteer.registrationDate,
                'Status': volunteer.status
            }));
        } else {
            dataRows = flatData.map(shift => ({
                'Group': shift.Group,
                'Date': shift.displayDate,
                'Time Range': shift.timeRange,
                'Duration': shift.displayDuration,
                'Volunteer': shift.volunteerName,
                'Program': shift.programName,
                'Activity': shift.activityName,
                'Status': shift.status
            }));
        }

        // Add data rows
        excelData = excelData.concat(dataRows);

        // Add summary rows
        excelData.push({});
        excelData.push({ 'Group': 'Total Count', 'First Name': totalCount });
        if (reportType === 'shifts') {
            excelData.push({ 'Group': 'Total Hours', 'First Name': totalHours });
        }

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(excelData, { skipHeader: true });

        // Add proper headers for the data section
        const headerRowIndex = monthFilter !== 'All' ? 6 : 5;
        if (reportType === 'volunteers') {
            XLSX.utils.sheet_add_aoa(ws, [['Group', 'First Name', 'Last Name', 'Email', 'Telephone', 'Program', 'Registered', 'Status']], { origin: `A${headerRowIndex + 1}` });
        } else {
            XLSX.utils.sheet_add_aoa(ws, [['Group', 'Date', 'Time Range', 'Duration', 'Volunteer', 'Program', 'Activity', 'Status']], { origin: `A${headerRowIndex + 1}` });
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');

        // Download
        const filename = `${reportType}_report_${groupBy}_${yearFilter}${monthFilter !== 'All' ? '_' + monthFilter : ''}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom>Reports</Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Report Type</InputLabel>
                                <Select
                                    value={reportType}
                                    label="Report Type"
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <MenuItem value="shifts">Shifts</MenuItem>
                                    <MenuItem value="volunteers">Volunteers</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Group By</InputLabel>
                                <Select
                                    value={groupBy}
                                    label="Group By"
                                    onChange={(e) => setGroupBy(e.target.value)}
                                >
                                    <MenuItem value="month">Month</MenuItem>
                                    <MenuItem value="year">Year</MenuItem>
                                    <MenuItem value="program">Program</MenuItem>
                                    {reportType === 'shifts' && <MenuItem value="activity">Activity</MenuItem>}
                                    {reportType === 'shifts' && <MenuItem value="volunteer">Volunteer</MenuItem>}
                                    {reportType === 'volunteers' && <MenuItem value="status">Status</MenuItem>}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Year</InputLabel>
                                <Select
                                    value={yearFilter}
                                    label="Year"
                                    onChange={(e) => setYearFilter(e.target.value)}
                                >
                                    {years.map(year => (
                                        <MenuItem key={year} value={year}>{year}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Month</InputLabel>
                                <Select
                                    value={monthFilter}
                                    label="Month"
                                    onChange={(e) => setMonthFilter(e.target.value)}
                                >
                                    {months.map(month => (
                                        <MenuItem key={month} value={month}>{month}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleRunReport}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Run Report'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {reportData.length > 0 && (
                <>
                    {/* Report Header with Export Buttons */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                        {reportType === 'shifts' ? 'Shifts Report' : 'Volunteers Report'}
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary">
                                        Grouped by: <strong>{groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</strong>
                                        {' • '}
                                        Year: <strong>{yearFilter}</strong>
                                        {monthFilter !== 'All' && (
                                            <>
                                                {' • '}
                                                Month: <strong>{monthFilter}</strong>
                                            </>
                                        )}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Generated on: {dayjs().format('MMMM D, YYYY [at] h:mm A')}
                                    </Typography>
                                </Box>
                                <Box display="flex" gap={1}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Download />}
                                        onClick={exportToCSV}
                                        size="small"
                                    >
                                        CSV
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Download />}
                                        onClick={exportToExcel}
                                        size="small"
                                    >
                                        Excel
                                    </Button>
                                </Box>
                            </Box>
                            <Box display="flex" gap={4} mt={2}>
                                <Box>
                                    <Typography variant="body2" color="textSecondary">Total Count</Typography>
                                    <Typography variant="h4" color="primary">{totalCount}</Typography>
                                </Box>
                                {reportType === 'shifts' && (
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">Total Hours</Typography>
                                        <Typography variant="h4" color="primary">{totalHours}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    <Box>
                        {groupedData.map((group, groupIndex) => (
                            <Accordion key={groupIndex} defaultExpanded={groupIndex === 0}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Box display="flex" justifyContent="space-between" width="100%" pr={2}>
                                        <Typography variant="h6">{group.groupName}</Typography>
                                        <Box display="flex" gap={3}>
                                            <Typography variant="body1">
                                                <strong>Count:</strong> {group.count}
                                            </Typography>
                                            {reportType === 'shifts' && (
                                                <Typography variant="body1">
                                                    <strong>Hours:</strong> {group.hours}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    {reportType === 'volunteers' ? (
                                                        <>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'firstName'}
                                                                    direction={orderBy === 'firstName' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('firstName')}
                                                                >
                                                                    First Name
                                                                </TableSortLabel>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'lastName'}
                                                                    direction={orderBy === 'lastName' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('lastName')}
                                                                >
                                                                    Last Name
                                                                </TableSortLabel>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'email'}
                                                                    direction={orderBy === 'email' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('email')}
                                                                >
                                                                    Email
                                                                </TableSortLabel>
                                                            </TableCell>
                                                            <TableCell>Telephone</TableCell>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'programName'}
                                                                    direction={orderBy === 'programName' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('programName')}
                                                                >
                                                                    Program
                                                                </TableSortLabel>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'date'}
                                                                    direction={orderBy === 'date' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('date')}
                                                                >
                                                                    Registered
                                                                </TableSortLabel>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'status'}
                                                                    direction={orderBy === 'status' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('status')}
                                                                >
                                                                    Status
                                                                </TableSortLabel>
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'date'}
                                                                    direction={orderBy === 'date' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('date')}
                                                                >
                                                                    Date
                                                                </TableSortLabel>
                                                            </TableCell>
                                                            <TableCell>Time Range</TableCell>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'duration'}
                                                                    direction={orderBy === 'duration' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('duration')}
                                                                >
                                                                    Duration
                                                                </TableSortLabel>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'volunteerName'}
                                                                    direction={orderBy === 'volunteerName' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('volunteerName')}
                                                                >
                                                                    Volunteer
                                                                </TableSortLabel>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'programName'}
                                                                    direction={orderBy === 'programName' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('programName')}
                                                                >
                                                                    Program
                                                                </TableSortLabel>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'activityName'}
                                                                    direction={orderBy === 'activityName' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('activityName')}
                                                                >
                                                                    Activity
                                                                </TableSortLabel>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TableSortLabel
                                                                    active={orderBy === 'status'}
                                                                    direction={orderBy === 'status' ? order : 'asc'}
                                                                    onClick={() => handleRequestSort('status')}
                                                                >
                                                                    Status
                                                                </TableSortLabel>
                                                            </TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {reportType === 'volunteers' ? (
                                                    group.items.map((volunteer, index) => (
                                                        <TableRow key={volunteer.VolunteerId || volunteer.volunteerId || index}>
                                                            <TableCell>{volunteer.FirstName || volunteer.firstName || ''}</TableCell>
                                                            <TableCell>{volunteer.LastName || volunteer.lastName || ''}</TableCell>
                                                            <TableCell>{volunteer.Email || volunteer.email || ''}</TableCell>
                                                            <TableCell>{formatPhone(volunteer.Telephone || volunteer.telephone || '')}</TableCell>
                                                            <TableCell>{volunteer.programName}</TableCell>
                                                            <TableCell>{volunteer.registrationDate}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={volunteer.status}
                                                                    color={getStatusColor(volunteer.status)}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    group.items.map((shift, index) => (
                                                        <TableRow key={shift.ShiftId || index}>
                                                            <TableCell>{shift.displayDate}</TableCell>
                                                            <TableCell>{shift.timeRange}</TableCell>
                                                            <TableCell>{shift.displayDuration}</TableCell>
                                                            <TableCell>{shift.volunteerName}</TableCell>
                                                            <TableCell>{shift.programName}</TableCell>
                                                            <TableCell>{shift.activityName}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={shift.status}
                                                                    color={getStatusColor(shift.status)}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>

                    {/* Grand Total Section */}
                    <Card sx={{ mt: 3, backgroundColor: '#f5f5f5' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Grand Total
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={reportType === 'shifts' ? 6 : 12}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            Total Count:
                                        </Typography>
                                        <Typography variant="h5" color="primary">
                                            {totalCount}
                                        </Typography>
                                    </Box>
                                </Grid>
                                {reportType === 'shifts' && (
                                    <Grid item xs={12} md={6}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                Total Hours:
                                            </Typography>
                                            <Typography variant="h5" color="primary">
                                                {totalHours}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </>
            )}

            {!loading && reportData.length === 0 && (
                <Typography variant="body1" color="textSecondary" align="center">
                    Click "Run Report" to generate data.
                </Typography>
            )}
        </Box>
    );
}