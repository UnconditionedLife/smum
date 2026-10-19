import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem,
    Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, TableSortLabel, Chip, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { ExpandMore, Download } from '@mui/icons-material';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import {
    dbGetAllVolunteersAsync, dbGetShiftsByDateRangeAsync,
    dbGetAllProgramsAsync, dbGetAllActivitiesAsync
} from '../../System/js/Database';
import { utilDecodeStrings } from '../../System/js/GlobalUtils.js';
import { formatPhone } from '../../System/js/Forms';

// ==========================================
// 1. Declarative Report Schema Configuration
// ==========================================
const REPORT_CONFIGS = {
    shifts: {
        title: 'Shifts Report',
        defaultGroupLabel: 'All Shifts',
        itemNoun: 'Shifts',
        filePrefix: 'shifts',
        showHours: true,
        columns: [
            { id: 'date', label: 'Date', getValue: s => s.displayDate, sortField: 'sortDate' },
            { id: 'timeRange', label: 'Time Range', getValue: s => s.timeRange, sortable: false },
            { id: 'duration', label: 'Duration', getValue: s => s.displayDuration, sortField: 'durationMinutes' },
            { id: 'volunteerName', label: 'Volunteer', getValue: s => s.volunteerName, sortField: 'volunteerName' },
            { id: 'programName', label: 'Program', getValue: s => s.programName, sortField: 'programName' },
            { id: 'activityName', label: 'Activity', getValue: s => s.activityName, sortField: 'activityName' },
            { id: 'status', label: 'Status', getValue: s => s.status, isChip: true, sortField: 'status' }
        ]
    },
    volunteers: {
        title: 'Active Volunteers Report',
        defaultGroupLabel: 'All Active Volunteers',
        itemNoun: 'Volunteers',
        filePrefix: 'active_volunteers',
        showHours: true,
        columns: [
            { id: 'firstName', label: 'First Name', getValue: v => v.FirstName, sortField: 'FirstName' },
            { id: 'lastName', label: 'Last Name', getValue: v => v.LastName, sortField: 'LastName' },
            { id: 'email', label: 'Email', getValue: v => v.Email, sortField: 'Email' },
            { id: 'telephone', label: 'Telephone', getValue: v => formatPhone(v.Telephone), sortable: false },
            { id: 'programName', label: 'Program', getValue: v => v.programName, sortField: 'programName' },
            { id: 'activityName', label: 'Activity', getValue: v => v.activityName, sortField: 'activityName' },
            { id: 'shiftsCount', label: 'Shifts', getValue: v => v.shiftsCount || 0, sortField: 'shiftsCount' },
            { id: 'hours', label: 'Hours', getValue: v => v.displayDuration || `${v.totalHours || 0}h`, sortField: 'totalMinutes' },
            { id: 'date', label: 'Last Active', getValue: v => v.lastActiveDate, sortField: 'sortDate' },
            { id: 'status', label: 'Status', getValue: v => v.status, isChip: true, sortField: 'status' }
        ]
    },
    new_volunteers: {
        title: 'New Volunteers Report',
        defaultGroupLabel: 'All New Volunteers',
        itemNoun: 'New Volunteers',
        filePrefix: 'new_volunteers',
        showHours: false,
        columns: [
            { id: 'firstName', label: 'First Name', getValue: v => v.FirstName, sortField: 'FirstName' },
            { id: 'lastName', label: 'Last Name', getValue: v => v.LastName, sortField: 'LastName' },
            { id: 'email', label: 'Email', getValue: v => v.Email, sortField: 'Email' },
            { id: 'telephone', label: 'Telephone', getValue: v => formatPhone(v.Telephone), sortable: false },
            { id: 'programName', label: 'Program', getValue: v => v.programName, sortField: 'programName' },
            { id: 'date', label: 'Signed Up', getValue: v => v.signupDate, sortField: 'sortDate' },
            { id: 'status', label: 'Status', getValue: v => v.status, isChip: true, sortField: 'status' }
        ]
    }
};

// ==========================================
// 2. Pure Helper Functions
// ==========================================
function formatDuration(totalMinutes) {
    if (!totalMinutes || totalMinutes <= 0) return '-';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
}

function parseDate(timeVal) {
    if (!timeVal) return null;
    let d = dayjs(timeVal);
    if (d.isValid()) return d;
    if (!isNaN(timeVal)) {
        const num = Number(timeVal);
        d = num < 10000000000 ? dayjs.unix(num) : dayjs(num);
        if (d.isValid()) return d;
    }
    return null;
}

function getStatusColor(status) {
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
}

function getGroupKey(item, groupBy, defaultLabel) {
    if (groupBy === 'none') return defaultLabel;
    if (groupBy === 'month') return item.dateObj?.isValid() ? item.dateObj.format('MMMM YYYY') : 'Unknown';
    if (groupBy === 'year') return item.dateObj?.isValid() ? item.dateObj.format('YYYY') : 'Unknown';
    if (groupBy === 'program') return item.programName || 'N/A';
    if (groupBy === 'status') return item.status || 'Unknown';
    if (groupBy === 'activity') return item.activityName || 'N/A';
    if (groupBy === 'volunteer') return item.volunteerName || 'N/A';
    return defaultLabel;
}

// ==========================================
// 3. Main Reports Component
// ==========================================
export default function Reports() {
    const [reportType, setReportType] = useState('shifts');
    const [groupBy, setGroupBy] = useState('month');
    const [yearFilter, setYearFilter] = useState(dayjs().year());
    const [monthFilter, setMonthFilter] = useState('All');
    const [orderBy, setOrderBy] = useState('date');
    const [order, setOrder] = useState('desc');
    const [loading, setLoading] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});

    const [volunteers, setVolunteers] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [activities, setActivities] = useState([]);

    const currentYear = dayjs().year();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).reverse();
    const months = [
        'All', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentConfig = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.shifts;

    // Load initial metadata on mount
    useEffect(() => {
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
        setHasRun(true);
        setReportData([]);

        try {
            // Compute date range
            let startDate, endDate;
            if (yearFilter === 'All') {
                startDate = '2000-01-01';
                endDate = dayjs().add(5, 'year').endOf('year').format('YYYY-MM-DD');
            } else if (monthFilter === 'All') {
                startDate = `${yearFilter}-01-01`;
                endDate = `${yearFilter}-12-31`;
            } else {
                const monthIndex = months.indexOf(monthFilter) - 1;
                const start = dayjs().year(Number(yearFilter)).month(monthIndex).startOf('month');
                const end = dayjs().year(Number(yearFilter)).month(monthIndex).endOf('month');
                startDate = start.format('YYYY-MM-DD');
                endDate = end.format('YYYY-MM-DD');
            }

            // Ensure fresh volunteers and metadata are loaded
            let currentVolunteers = [];
            try {
                currentVolunteers = await dbGetAllVolunteersAsync() || [];
                setVolunteers(currentVolunteers);
            } catch (e) {
                console.error('Error fetching volunteers:', e);
                currentVolunteers = volunteers || [];
            }

            let currentPrograms = programs;
            if (!currentPrograms || currentPrograms.length === 0) {
                currentPrograms = await dbGetAllProgramsAsync() || [];
                setPrograms(currentPrograms);
            }

            let currentActivities = activities;
            if (!currentActivities || currentActivities.length === 0) {
                currentActivities = await dbGetAllActivitiesAsync() || [];
                setActivities(currentActivities);
            }

            // O(1) Index Maps for fast lookups
            const volMap = new Map(currentVolunteers.map(v => [v.VolunteerId, v]));
            const programMap = new Map(currentPrograms.map(p => [p.ProgramId, p.ProgramName]));
            const activityMap = new Map(currentActivities.map(a => [a.ActivityId, a.ActivityName || a.ActivityName_en]));

            if (reportType === 'new_volunteers') {
                // New Volunteers Report
                const startBoundary = dayjs(startDate).startOf('day');
                const endBoundary = dayjs(endDate).endOf('day');

                const newVols = currentVolunteers.filter(v => {
                    if (!v || v.isDeleted) return false;
                    const regDate = parseDate(v.Time);
                    if (!regDate) return false;
                    return (regDate.isAfter(startBoundary) || regDate.isSame(startBoundary)) &&
                           (regDate.isBefore(endBoundary) || regDate.isSame(endBoundary));
                });

                const enriched = newVols.map(vol => {
                    const regDate = parseDate(vol.Time);
                    const programName = programMap.get(String(vol.ProgramId)) || 'N/A';
                    const status = vol.RegComplete ? 'Registered' : 'Not Registered';

                    const item = {
                        ...vol,
                        id: vol.VolunteerId,
                        signupDate: regDate?.isValid() ? regDate.format('YYYY-MM-DD h:mm A') : '-',
                        dateObj: regDate,
                        sortDate: regDate?.isValid() ? regDate.valueOf() : 0,
                        programName,
                        status
                    };
                    item.groupKey = getGroupKey(item, groupBy, 'All New Volunteers');
                    return item;
                });

                setReportData(enriched);

            } else {
                // Fetch shifts for Active Volunteers or Shifts Report
                let rawShifts = [];
                try {
                    rawShifts = await dbGetShiftsByDateRangeAsync(startDate, endDate) || [];
                } catch (err) {
                    console.error('Failed to fetch shifts:', err);
                }
                const validShifts = (utilDecodeStrings(rawShifts) || []).filter(s => s && s.isDeleted !== true && s.isDeleted !== 'true');

                if (reportType === 'volunteers') {
                    // Group shifts by volunteer ID to aggregate active volunteers
                    const shiftsByVolId = new Map();
                    validShifts.forEach(shift => {
                        const volId = shift.VolunteerId;
                        if (!volId) return;
                        if (!shiftsByVolId.has(volId)) shiftsByVolId.set(volId, []);
                        shiftsByVolId.get(volId).push(shift);
                    });

                    const activeVolunteers = [];
                    shiftsByVolId.forEach((volShifts, volId) => {
                        const vol = volMap.get(volId) || {
                            VolunteerId: volId,
                            FirstName: 'Unknown',
                            LastName: `(${volId})`,
                            Email: '',
                            Telephone: '',
                            ProgramId: volShifts[0]?.ProgramId || '0',
                            RegComplete: false
                        };

                        let totalMinutes = 0;
                        let latestTimestamp = 0;
                        let latestDisplayDate = '-';
                        let latestDateObj = null;

                        volShifts.forEach(shift => {
                            const timestampIn = shift.TimestampIn ? dayjs(shift.TimestampIn) : null;
                            const timestampOut = shift.TimestampOut ? dayjs(shift.TimestampOut) : null;
                            if (timestampIn && timestampOut) {
                                const diff = timestampOut.diff(timestampIn, 'minute');
                                if (diff > 0) totalMinutes += diff;
                            }
                            const t = timestampIn ? timestampIn.valueOf() : (shift.Date ? dayjs(shift.Date).valueOf() : 0);
                            if (t > latestTimestamp) {
                                latestTimestamp = t;
                                latestDisplayDate = timestampIn ? timestampIn.format('YYYY-MM-DD') : (shift.Date || '-');
                                latestDateObj = timestampIn || (shift.Date ? dayjs(shift.Date) : null);
                            }
                        });

                        const progId = vol.ProgramId || vol.programId || volShifts[0]?.ProgramId;
                        const programName = programMap.get(String(progId)) || 'N/A';
                        const status = vol.RegComplete ? 'Registered' : 'Not Registered';

                        // Breakdown by unique activity for this volunteer
                        const shiftsByAct = new Map();
                        volShifts.forEach(shift => {
                            const actId = String(shift.ActivityId || '0');
                            if (!shiftsByAct.has(actId)) shiftsByAct.set(actId, []);
                            shiftsByAct.get(actId).push(shift);
                        });

                        const activityBreakdown = [];
                        shiftsByAct.forEach((actShifts, actId) => {
                            let actMinutes = 0;
                            let actLatestTimestamp = 0;
                            let actLatestDisplayDate = '-';
                            let actLatestDateObj = null;

                            actShifts.forEach(s => {
                                const timestampIn = s.TimestampIn ? dayjs(s.TimestampIn) : null;
                                const timestampOut = s.TimestampOut ? dayjs(s.TimestampOut) : null;
                                if (timestampIn && timestampOut) {
                                    const diff = timestampOut.diff(timestampIn, 'minute');
                                    if (diff > 0) actMinutes += diff;
                                }
                                const t = timestampIn ? timestampIn.valueOf() : (s.Date ? dayjs(s.Date).valueOf() : 0);
                                if (t > actLatestTimestamp) {
                                    actLatestTimestamp = t;
                                    actLatestDisplayDate = timestampIn ? timestampIn.format('YYYY-MM-DD') : (s.Date || '-');
                                    actLatestDateObj = timestampIn || (s.Date ? dayjs(s.Date) : null);
                                }
                            });

                            const actName = activityMap.get(actId) || (actId === '0' ? 'None' : `Activity ${actId}`);
                            activityBreakdown.push({
                                activityId: actId,
                                activityName: actName,
                                shiftsCount: actShifts.length,
                                totalMinutes: actMinutes,
                                totalHours: (actMinutes / 60).toFixed(1),
                                displayDuration: formatDuration(actMinutes),
                                lastActiveDate: actLatestDisplayDate,
                                dateObj: actLatestDateObj,
                                sortDate: actLatestTimestamp
                            });
                        });

                        const actIds = [...new Set(volShifts.map(s => s.ActivityId).filter(Boolean))];
                        const activityNames = actIds.map(id => activityMap.get(String(id))).filter(Boolean);
                        const activityName = activityNames.length > 0 ? activityNames.join(', ') : 'N/A';

                        const item = {
                            ...vol,
                            id: vol.VolunteerId || volId,
                            shiftsCount: volShifts.length,
                            totalMinutes,
                            totalHours: (totalMinutes / 60).toFixed(1),
                            displayDuration: formatDuration(totalMinutes),
                            lastActiveDate: latestDisplayDate,
                            dateObj: latestDateObj,
                            programName,
                            activityName,
                            activityBreakdown,
                            status,
                            sortDate: latestTimestamp
                        };
                        item.groupKey = getGroupKey(item, groupBy, 'All Active Volunteers');
                        activeVolunteers.push(item);
                    });

                    setReportData(activeVolunteers);

                } else if (reportType === 'shifts') {
                    // Enrich shifts
                    const enrichedShifts = validShifts.map(shift => {
                        const timestampIn = shift.TimestampIn ? dayjs(shift.TimestampIn) : null;
                        const timestampOut = shift.TimestampOut ? dayjs(shift.TimestampOut) : null;
                        const displayDate = timestampIn ? timestampIn.format('YYYY-MM-DD') : (shift.Date || '-');
                        const startTime = timestampIn ? timestampIn.format('h:mm A') : '-';
                        const endTime = timestampOut ? timestampOut.format('h:mm A') : 'In Progress';

                        let durationMinutes = 0;
                        let displayDuration = '-';
                        if (timestampIn && timestampOut) {
                            durationMinutes = timestampOut.diff(timestampIn, 'minute');
                            displayDuration = formatDuration(durationMinutes);
                        } else if (timestampIn && !timestampOut) {
                            displayDuration = 'Ongoing';
                            durationMinutes = 999999;
                        }

                        let status = 'Scheduled';
                        if (timestampIn && timestampOut) {
                            status = 'Completed';
                        } else if (timestampIn && !timestampOut) {
                            const today = dayjs().startOf('day');
                            const shiftDate = timestampIn.startOf('day');
                            status = shiftDate.isSame(today) ? 'Checked In' : 'Forgotten';
                        }

                        const volunteer = volMap.get(shift.VolunteerId);
                        const volunteerName = volunteer
                            ? `${volunteer.FirstName} ${volunteer.LastName}`.trim() || `Unknown (${shift.VolunteerId})`
                            : `Unknown (${shift.VolunteerId})`;

                        const programName = programMap.get(String(shift.ProgramId)) || 'N/A';
                        const activityName = activityMap.get(String(shift.ActivityId)) || 'N/A';

                        const item = {
                            ...shift,
                            id: shift.ShiftId,
                            displayDate,
                            timeRange: `${startTime} - ${endTime}`,
                            durationMinutes,
                            displayDuration,
                            volunteerName,
                            programName,
                            activityName,
                            status,
                            dateObj: timestampIn,
                            sortDate: timestampIn ? timestampIn.valueOf() : 0
                        };
                        item.groupKey = getGroupKey(item, groupBy, 'All Shifts');
                        return item;
                    });

                    setReportData(enrichedShifts);
                }
            }
        } catch (error) {
            console.error('Error running report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Sort and Group Data
    const groupedData = useMemo(() => {
        let itemsToGroup = reportData;

        if (reportType === 'volunteers' && groupBy === 'activity') {
            // Group by unique activity: volunteer appears under each activity they worked in
            itemsToGroup = reportData.flatMap(item => {
                if (item.activityBreakdown && item.activityBreakdown.length > 0) {
                    return item.activityBreakdown.map(act => ({
                        ...item,
                        activityName: act.activityName,
                        shiftsCount: act.shiftsCount,
                        totalMinutes: act.totalMinutes,
                        totalHours: act.totalHours,
                        displayDuration: act.displayDuration,
                        lastActiveDate: act.lastActiveDate,
                        dateObj: act.dateObj,
                        sortDate: act.sortDate,
                        groupKey: act.activityName
                    }));
                }
                return [{
                    ...item,
                    activityName: 'N/A',
                    groupKey: 'N/A'
                }];
            });
        }

        const colDef = currentConfig.columns.find(c => c.id === orderBy);
        const sortField = colDef?.sortField || orderBy;

        const sorted = [...itemsToGroup].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            let compareResult = 0;
            if (typeof valA === 'number' || typeof valB === 'number') {
                compareResult = (Number(valA) || 0) - (Number(valB) || 0);
            } else {
                compareResult = String(valA || '').localeCompare(String(valB || ''));
            }
            return order === 'asc' ? compareResult : -compareResult;
        });

        const groups = {};
        sorted.forEach(item => {
            const key = (reportType === 'volunteers' && groupBy === 'activity')
                ? item.groupKey
                : getGroupKey(item, groupBy, currentConfig.defaultGroupLabel);
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        const groupArray = Object.entries(groups).map(([groupName, items]) => {
            let hours = 0;
            let registeredCount = 0;

            if (reportType === 'shifts') {
                hours = items.reduce((sum, s) => (s.durationMinutes && s.durationMinutes < 999999 ? sum + s.durationMinutes / 60 : sum), 0);
            } else if (reportType === 'volunteers') {
                hours = items.reduce((sum, v) => sum + (v.totalMinutes || 0) / 60, 0);
            } else if (reportType === 'new_volunteers') {
                registeredCount = items.filter(v => v.RegComplete === true || v.status === 'Registered').length;
            }

            return {
                groupName,
                items,
                count: items.length,
                hours: hours.toFixed(1),
                registeredCount
            };
        });

        groupArray.sort((a, b) => {
            if (groupBy === 'month') {
                const timeA = dayjs(a.groupName, 'MMMM YYYY').valueOf();
                const timeB = dayjs(b.groupName, 'MMMM YYYY').valueOf();
                if (!isNaN(timeA) && !isNaN(timeB)) return timeB - timeA;
            }
            return a.groupName.localeCompare(b.groupName);
        });

        return groupArray;
    }, [reportData, reportType, orderBy, order, groupBy, currentConfig]);

    // Expand all groups by default when data changes
    useEffect(() => {
        const initial = {};
        groupedData.forEach(g => { initial[g.groupName] = true; });
        setExpandedGroups(initial);
    }, [groupedData]);

    const handleToggleGroup = (groupName) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: prev[groupName] === undefined ? false : !prev[groupName]
        }));
    };

    const handleExpandAll = () => {
        const all = {};
        groupedData.forEach(g => { all[g.groupName] = true; });
        setExpandedGroups(all);
    };

    const handleCollapseAll = () => {
        const none = {};
        groupedData.forEach(g => { none[g.groupName] = false; });
        setExpandedGroups(none);
    };

    // Calculate overall totals
    const totalCount = reportData.length;
    const totalHours = reportType === 'shifts'
        ? reportData.reduce((sum, s) => (s.durationMinutes && s.durationMinutes < 999999 ? sum + s.durationMinutes / 60 : sum), 0).toFixed(1)
        : reportData.reduce((sum, v) => sum + (v.totalMinutes || 0) / 60, 0).toFixed(1);

    const registeredCount = useMemo(() => {
        return reportData.filter(v => v.RegComplete === true || v.status === 'Registered').length;
    }, [reportData]);

    // Export Handlers powered by currentConfig.columns
    const exportToCSV = () => {
        if (reportData.length === 0) return;
        const flatData = groupedData.flatMap(g => g.items.map(item => ({ Group: g.groupName, ...item })));

        let csvContent = `"${currentConfig.title}"\n`;
        csvContent += `"Grouped by: ${groupBy === 'none' ? 'None' : (groupBy.charAt(0).toUpperCase() + groupBy.slice(1))}"\n`;
        csvContent += `"Year: ${yearFilter === 'All' ? 'All Years' : yearFilter}"\n`;
        if (monthFilter !== 'All') csvContent += `"Month: ${monthFilter}"\n`;
        csvContent += `"Generated on: ${dayjs().format('MMMM D, YYYY [at] h:mm A')}"\n\n`;

        const headers = ['Group', ...currentConfig.columns.map(c => c.label)];
        csvContent += headers.join(',') + '\n';

        flatData.forEach(item => {
            const row = [item.Group, ...currentConfig.columns.map(c => c.getValue(item))];
            csvContent += row.map(val => `"${val ?? ''}"`).join(',') + '\n';
        });

        csvContent += '\n';
        if (reportType === 'new_volunteers') {
            csvContent += `"Total New Volunteers","${totalCount}"\n"Registered","${registeredCount}"\n"Not Registered","${totalCount - registeredCount}"\n`;
        } else {
            csvContent += `"${reportType === 'shifts' ? 'Total Shifts' : 'Total Active Volunteers'}","${totalCount}"\n"Total Hours","${totalHours}"\n`;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${currentConfig.filePrefix}_report_${groupBy}_${yearFilter}${monthFilter !== 'All' ? '_' + monthFilter : ''}_${dayjs().format('YYYY-MM-DD')}.csv`;
        link.click();
    };

    const exportToExcel = () => {
        if (reportData.length === 0) return;
        const flatData = groupedData.flatMap(g => g.items.map(item => ({ Group: g.groupName, ...item })));

        const excelData = [
            { 'A': currentConfig.title },
            { 'A': `Grouped by: ${groupBy === 'none' ? 'None' : (groupBy.charAt(0).toUpperCase() + groupBy.slice(1))}` },
            { 'A': `Year: ${yearFilter === 'All' ? 'All Years' : yearFilter}` }
        ];
        if (monthFilter !== 'All') excelData.push({ 'A': `Month: ${monthFilter}` });
        excelData.push({ 'A': `Generated on: ${dayjs().format('MMMM D, YYYY [at] h:mm A')}` });
        excelData.push({});

        const dataRows = flatData.map(item => {
            const rowObj = { 'Group': item.Group };
            currentConfig.columns.forEach(c => {
                rowObj[c.label] = c.getValue(item) ?? '';
            });
            return rowObj;
        });
        excelData.push(...dataRows);

        excelData.push({});
        if (reportType === 'new_volunteers') {
            excelData.push({ 'Group': 'Total New Volunteers', 'First Name': totalCount });
            excelData.push({ 'Group': 'Registered', 'First Name': registeredCount });
            excelData.push({ 'Group': 'Not Registered', 'First Name': totalCount - registeredCount });
        } else {
            excelData.push({ 'Group': reportType === 'shifts' ? 'Total Shifts' : 'Total Active Volunteers', 'First Name': totalCount });
            excelData.push({ 'Group': 'Total Hours', 'First Name': totalHours });
        }

        const ws = XLSX.utils.json_to_sheet(excelData, { skipHeader: true });
        const headerRowIndex = monthFilter !== 'All' ? 6 : 5;
        const headers = ['Group', ...currentConfig.columns.map(c => c.label)];
        XLSX.utils.sheet_add_aoa(ws, [headers], { origin: `A${headerRowIndex + 1}` });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, `${currentConfig.filePrefix}_report_${groupBy}_${yearFilter}${monthFilter !== 'All' ? '_' + monthFilter : ''}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
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
                                    onChange={(e) => {
                                        const newType = e.target.value;
                                        setReportType(newType);
                                        if (newType === 'new_volunteers' && (groupBy === 'activity' || groupBy === 'volunteer')) {
                                            setGroupBy('month');
                                        } else if (newType === 'volunteers' && groupBy === 'volunteer') {
                                            setGroupBy('month');
                                        }
                                    }}
                                >
                                    <MenuItem value="shifts">Shifts</MenuItem>
                                    <MenuItem value="volunteers">Active Volunteers</MenuItem>
                                    <MenuItem value="new_volunteers">New Volunteers</MenuItem>
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
                                    <MenuItem value="none">None (Single List)</MenuItem>
                                    <MenuItem value="month">Month</MenuItem>
                                    <MenuItem value="year">Year</MenuItem>
                                    <MenuItem value="program">Program</MenuItem>
                                    {(reportType === 'shifts' || reportType === 'volunteers') && <MenuItem value="activity">Activity</MenuItem>}
                                    {reportType === 'shifts' && <MenuItem value="volunteer">Volunteer</MenuItem>}
                                    {(reportType === 'volunteers' || reportType === 'new_volunteers') && <MenuItem value="status">Status</MenuItem>}
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
                                    <MenuItem value="All">All Years</MenuItem>
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
                    {/* Header and Export Controls */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                        {currentConfig.title}
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary">
                                        Grouped by: <strong>{groupBy === 'none' ? 'None' : (groupBy.charAt(0).toUpperCase() + groupBy.slice(1))}</strong>
                                        {' • '}
                                        Year: <strong>{yearFilter === 'All' ? 'All Years' : yearFilter}</strong>
                                        {monthFilter !== 'All' && <> {' • '} Month: <strong>{monthFilter}</strong></>}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Generated on: {dayjs().format('MMMM D, YYYY [at] h:mm A')}
                                    </Typography>
                                </Box>
                                <Box display="flex" gap={1}>
                                    <Button variant="outlined" startIcon={<Download />} onClick={exportToCSV} size="small">
                                        CSV
                                    </Button>
                                    <Button variant="outlined" startIcon={<Download />} onClick={exportToExcel} size="small">
                                        Excel
                                    </Button>
                                </Box>
                            </Box>

                            {/* Summary Metrics */}
                            <Box display="flex" gap={4} mt={2}>
                                <Box>
                                    <Typography variant="body2" color="textSecondary">
                                        {reportType === 'shifts' ? 'Total Shifts' : (reportType === 'new_volunteers' ? 'Total New Volunteers' : 'Active Volunteers')}
                                    </Typography>
                                    <Typography variant="h4" color="primary">{totalCount}</Typography>
                                </Box>
                                {reportType === 'new_volunteers' ? (
                                    <>
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">Registered</Typography>
                                            <Typography variant="h4" color="success.main">{registeredCount}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">Not Registered</Typography>
                                            <Typography variant="h4" color="warning.main">{totalCount - registeredCount}</Typography>
                                        </Box>
                                    </>
                                ) : (
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">Total Hours</Typography>
                                        <Typography variant="h4" color="primary">{totalHours}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Group Accordions */}
                    <Box>
                        {groupedData.length > 1 && (
                            <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
                                <Button size="small" variant="text" onClick={handleExpandAll}>Expand All</Button>
                                <Button size="small" variant="text" onClick={handleCollapseAll}>Collapse All</Button>
                            </Box>
                        )}
                        {groupedData.map((group, groupIndex) => (
                            <Accordion
                                key={group.groupName || groupIndex}
                                expanded={expandedGroups[group.groupName] !== false}
                                onChange={() => handleToggleGroup(group.groupName)}
                            >
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Box display="flex" justifyContent="space-between" width="100%" pr={2}>
                                        <Typography variant="h6">{group.groupName}</Typography>
                                        <Box display="flex" gap={3}>
                                            <Typography variant="body1">
                                                <strong>{currentConfig.itemNoun}:</strong> {group.count}
                                            </Typography>
                                            {reportType === 'new_volunteers' ? (
                                                <Typography variant="body1">
                                                    <strong>Registered:</strong> {group.registeredCount}
                                                </Typography>
                                            ) : (
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
                                                    {currentConfig.columns.map(col => (
                                                        <TableCell key={col.id}>
                                                            {col.sortable !== false ? (
                                                                <TableSortLabel
                                                                    active={orderBy === col.id}
                                                                    direction={orderBy === col.id ? order : 'asc'}
                                                                    onClick={() => handleRequestSort(col.id)}
                                                                >
                                                                    {col.label}
                                                                </TableSortLabel>
                                                            ) : (
                                                                col.label
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {group.items.map((item, index) => (
                                                    <TableRow key={item.id || index}>
                                                        {currentConfig.columns.map(col => {
                                                            const val = col.getValue(item);
                                                            return (
                                                                <TableCell key={col.id}>
                                                                    {col.isChip ? (
                                                                        <Chip label={val} color={getStatusColor(val)} size="small" />
                                                                    ) : (
                                                                        val
                                                                    )}
                                                                </TableCell>
                                                            );
                                                        })}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>

                    {/* Grand Total Card */}
                    <Card sx={{ mt: 3, backgroundColor: '#f5f5f5' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Grand Total
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {reportType === 'shifts'
                                                ? 'Total Shifts:'
                                                : (reportType === 'new_volunteers' ? 'Total New Volunteers:' : 'Total Active Volunteers:')}
                                        </Typography>
                                        <Typography variant="h5" color="primary">{totalCount}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {reportType === 'new_volunteers' ? 'Registered Volunteers:' : 'Total Hours:'}
                                        </Typography>
                                        <Typography variant="h5" color="primary">
                                            {reportType === 'new_volunteers'
                                                ? `${registeredCount} (${totalCount > 0 ? Math.round((registeredCount / totalCount) * 100) : 0}%)`
                                                : totalHours}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </>
            )}

            {!loading && reportData.length === 0 && (
                <Typography variant="body1" color="textSecondary" align="center">
                    {hasRun
                        ? (reportType === 'new_volunteers'
                            ? 'No new volunteers signed up in the selected date range.'
                            : (reportType === 'volunteers'
                                ? 'No volunteers were active in the selected date range.'
                                : 'No shifts found for the selected date range.'))
                        : 'Click "Run Report" to generate data.'}
                </Typography>
            )}
        </Box>
    );
}