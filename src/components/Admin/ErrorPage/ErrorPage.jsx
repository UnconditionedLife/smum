import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";     
dayjs.extend(utc); 
import { TextField } from '../../System'
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
            <Box width='95%' mx={ 2 }>
                <Box display="flex" flexDirection="row" flexWrap="wrap" style={{ marginTop: '15px' }}>
                    <LocalizationProvider dateAdapter={ AdapterDayjs }>
                        <DatePicker
                            inputProps={{
                                style: {
                                    paddingTop: "10px",
                                    paddingBottom: "10px",
                                },
                            }}
                            width={240}
                            m={0}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            inputFormat="MMM DD YYYY"
                            label="Start Date"
                            value={startDate}
                            renderInput={(params) => <TextField {...params} />}
                            onChange={(newValue) => setStartDate(newValue)}
                            disableMaskedInput
                        />
                        <DatePicker
                            inputProps={{
                                style: {
                                    paddingTop: "10px",
                                    paddingBottom: "10px",
                                },
                            }}
                            width={240}
                            m={0}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            inputFormat="MMM DD YYYY"
                            label="End Date"
                            value={endDate}
                            renderInput={(params) => <TextField {...params} />}
                            onChange={(newValue) => setEndDate(newValue)}
                            disableMaskedInput
                        />
                    </LocalizationProvider>
                    <Box display="flex" flexDirection="row" ml={ 1 } mr={ 1 }>
                        <Typography>Error</Typography>
                        <Switch checked={ showTrace } onChange={(event) => setShowTrace(event.target.checked)} /> 
                        <Typography>Trace</Typography>
                    </Box>
                </Box>

                <TableContainer> 
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
                    <Alert severity="error">End date must be after start date</Alert>
                )}
                {displayMessages.length == 0 && (
                    <Alert severity="info">There are no messages in this time frame</Alert>
                )}
            </Box>
        );
    }
}