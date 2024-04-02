import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// import moment from 'moment';
import moment from 'moment-timezone';
import { TextField } from '../../System'


import { Alert, Box, Table, TableBody, Button,
    TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { dbFetchErrorLogs } from '../../System/js/Database';


export default function ErrorPage(props) {
    // error messages stores the dates in utc time

    const [startDate, setStartDate] = useState(moment(null));
    const [endDate, setEndDate] = useState(moment(null));
    const base_url = "https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/";

    const updateErrorRange = () => {
        if (startDate.isValid() && endDate.isValid()) {
            // user selects a time in local time, creating a moment object in local time
            // the user selected time is converted to utc time before being sent to the db
            dbFetchErrorLogs(startDate.utc().format(), moment(endDate).add(23,'h').add(59,'m').utc().format())
            .then(newErrorMessages => {
                props.errorMessagesUpdate(newErrorMessages);
                props.countUpdate(newErrorMessages.length);
            });
        } else {
            dbFetchErrorLogs("","").then(newErrorMessages => {
                props.errorMessagesUpdate(newErrorMessages);
                props.countUpdate(newErrorMessages.length);
            });
        }
    }  

    
    return (
        <Box width='95%' mx={ 2 }>
            <Box display="flex" flexDirection="row" flexWrap="wrap" style={{ marginTop: '15px' }}>
                <LocalizationProvider dateAdapter={ AdapterMoment }>
                    <DatePicker 
                        inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}}  
                        width={ 240 } 
                        m={ 0 } 
                        size='small' 
                        InputLabelProps={{ shrink: true }}
                        inputFormat="MMM DD YYYY"
                        label="Start Date"
                        value={startDate}
                        renderInput={(params) => <TextField {...params} />}
                        onChange={(newValue) => setStartDate(newValue)}
                    />
                    <DatePicker
                        inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}}  
                        width={ 240 } 
                        m={ 0 } 
                        size='small' 
                        InputLabelProps={{ shrink: true }}
                        inputFormat="MMM DD YYYY"
                        label="End Date"
                        value={endDate}
                        renderInput={(params) => <TextField {...params} />}
                        onChange={(newValue) => setEndDate(newValue)}
                    />
                </LocalizationProvider>
                <Button onClick={updateErrorRange} variant="contained" color="primary">Apply</Button>
            </Box>

            <TableContainer> 
                <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Time Stamp</TableCell>
                        <TableCell align="center">Message</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.errorMessages.map((row) => (
                    <TableRow key={ row.logID }>
                        <TableCell component="th" scope="row">
                            {moment(row.logTimestamp).local().format("dddd, MMMM Do YYYY, h:mm:ss a")}
                        </TableCell>
                        <TableCell component="th" scope="row">{row.message}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
            {props.errorMessages.length == 0 && (
                <Alert severity="info">There are no error logs in this time frame</Alert>
            )}
        </Box>
    );
}