import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";     
dayjs.extend(utc); 
import { Alert, Box, Switch, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { dbFetchErrorLogs } from '../../System/js/Database';

ErrorPage.propTypes = {
    norender: PropTypes.bool,
    countUpdate: PropTypes.func.isRequired,
}
export default function ErrorPage(props) {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showTrace, setShowTrace] = useState(false);
    const [errorMessages, setErrorMessages] = useState([]);
    const [traceMessages, setTraceMessages] = useState([]);

    useEffect(() => {
        dbFetchErrorLogs('', '', 'TRACE')
            .then((msgs) => {
                setTraceMessages(msgs);
            });
        dbFetchErrorLogs('', '', 'ERROR')
            .then((msgs) => {
                setErrorMessages(msgs);
                props.countUpdate(msgs.length);
            });
    }, []);

    function filterMessages() {
        let list = showTrace ? traceMessages : errorMessages;
        if (startDate) {
            list = list.filter(row => dayjs(row.logTimestamp).local() >= dayjs(startDate));
        }
        if (endDate) {
            list = list.filter(row => dayjs(row.logTimestamp).local() <= dayjs(endDate));
        }
        return list;
    }

    if (props.norender) {
        // Just return error message count for AppBar display
        return null;
    } else {
        const displayMessages = filterMessages();
        return (
            <Box sx={{
                mt: 2,
                mx: { xs: 1, sm: 0 },
                mb: 2,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: '16px',
                overflow: 'hidden',
            }}>
                <Box sx={{ px: 2.5, py: 1.75, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant='h6'>Error Log</Typography>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 2,
                        px: 2.5,
                        py: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}>
                    <LocalizationProvider dateAdapter={ AdapterDayjs }>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            format="MMM DD YYYY"
                            slotProps={{ textField: { size: "small", sx: { width: 240, m: 0 },
                                slotProps: { inputLabel: { shrink: true } } } }}
                            onChange={(newValue) => { if (newValue === null || newValue.isValid()) setStartDate(newValue) }}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            format="MMM DD YYYY"
                            slotProps={{ textField: { size: "small", sx: { width: 240, m: 0 },
                                slotProps: { inputLabel: { shrink: true } } } }}
                            onChange={(newValue) => { if (newValue === null || newValue.isValid()) setEndDate(newValue) }}
                        />
                    </LocalizationProvider>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            ml: { xs: 0, sm: 'auto' },
                            px: 1.5,
                            borderRadius: 999,
                            bgcolor: 'action.hover',
                        }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>Error</Typography>
                        <Switch checked={ showTrace } onChange={(event) => setShowTrace(event.target.checked)} /> 
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>Trace</Typography>
                    </Box>
                </Box>

                <TableContainer sx={{ borderRadius: 0 }}> 
                    <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" width='35%'>Time Stamp</TableCell>
                            <TableCell align="center" width='65%'>Message</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayMessages.map((row) => (
                        <TableRow key={ row.logID }>
                            <TableCell component="th" scope="row">
                                {dayjs(row.logTimestamp).local().format("dddd, MMMM D, YYYY, h:mm:ss a")}
                            </TableCell>
                            <TableCell component="th" scope="row">{row.message}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
                { dayjs(startDate) > dayjs(endDate) && (
                    <Alert severity="error" sx={{ m: 2 }}>End date must be after start date</Alert>
                )}
                {displayMessages.length == 0 && (
                    <Alert severity="info" sx={{ m: 2 }}>There are no messages in this time frame</Alert>
                )}
            </Box>
        );
    }
}