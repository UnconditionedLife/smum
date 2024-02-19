import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { TextField } from '../../System'


import { Box, Table, TableBody, Button,
    TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { dbFetchErrorLogs } from '../../System/js/Database';


ErrorPage.propTypes = {

}

export default function ErrorPage(props) {

    /*
    - changes:
        * set start and end time to null at the begining
        * apply button instead of use effect
        - use DateTimePicker instead of DatePicker
        - badge on the bug logo
        - time zone:
            - convert client input from local to utc -> call to database
            - response from db -> convert db responce to local time
    */


    const [errorMessages, setErrorMessages] = useState([]);
    // const [startDate, setStartDate] = useState(moment("2007-06-01"));
    // const [endDate, setEndDate] = useState(moment("2099-06-01"));
    const [startDate, setStartDate] = useState(moment(null));
    const [endDate, setEndDate] = useState(moment(null));
    const base_url = "https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/"

    console.log(typeof startDate);

    useEffect(() => {
        dbFetchErrorLogs(moment("2007-06-01").format("YYYY-MM-DD"), moment("2099-06-01").format("YYYY-MM-DD"))
            .then(errorMessages => setErrorMessages(errorMessages));
    }, []);

    const updateErrorRange = () => {
        if (startDate.isValid() && endDate.isValid()) {
            dbFetchErrorLogs(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"))
            .then(errorMessages => setErrorMessages(errorMessages));
        }
        
    }


    // {
    //     "category": "ERROR",
    //     "message": "Login by JesusG",
    //     "logID": "clsbzuzeg0000357xfxwau55z",
    //     "logTimestamp": "2024-02-07T16:18:31.480Z"
    // }

    return (
        <Box width='95%' mx={ 2 }>
            <Box display="flex" flexDirection="row" flexWrap="wrap">
                <LocalizationProvider dateAdapter={ AdapterMoment } >
                    <DatePicker
                        label="Start Date"
                        value={startDate}
                        renderInput={(params) => <TextField {...params} />}
                        onChange={(newValue) => setStartDate(newValue)}
                    />
                    <DatePicker
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
                    {errorMessages.map((row) => (
                    <TableRow key={ row.logTimestamp }>
                        <TableCell component="th" scope="row">{row.logTimestamp}</TableCell>
                        <TableCell component="th" scope="row">{row.message}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}