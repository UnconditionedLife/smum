import React, { useState, useEffect } from 'react';
// import moment from 'moment';
import moment from 'moment-timezone';
import { TextField } from '../../System'


import { Alert, Box, Table, TableBody, Button,
    TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
        * use DateTimePicker instead of DatePicker
        * switch back to DatePicker
        * time zone:
            - convert client input from local to utc -> call to database
            - response from db -> convert db responce to local time
        - store and display the user that is logged in when the error is created
        - margin above the start and end date fields
        - error badge
        - be aware of the styling for the tables
        - make the start date and end dates filed consistend with the reports page
        - look at the badge on service notes

        - continuously incrementing ID for the new client
        - learn about the API
            - using api gateway
            - make some tweaks on the API, get access to the api
            - some clean up work
            - calling dynamoDB
            - manually increment client number table
            - use that number as the new client ID
            - can make the clients table self increment
            - set up time with Jose, probably on thursday
        - migrating away from moment
            - can be incremental
            - try out other frameworks
            - default to JS without an additional library
    */

    // error messages stores the dates in utc time
    const [errorMessages, setErrorMessages] = useState([]);
    const [startDate, setStartDate] = useState(moment(null));
    const [endDate, setEndDate] = useState(moment(null));
    const base_url = "https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/"


    useEffect(() => {
        dbFetchErrorLogs(moment("2007-06-01").format("YYYY-MM-DD"), moment("2099-06-01").format("YYYY-MM-DD"))
            .then(errorMessages => setErrorMessages(errorMessages));
    }, []);

    const updateErrorRange = () => {
        if (startDate.isValid() && endDate.isValid()) {
            // user selects a time in local time, creating a moment object in local time
            // the user selected time is converted to utc time before being sent to the db
            dbFetchErrorLogs(startDate.utc().format(), moment(endDate).add(23,'h').add(59,'m').utc().format())
            .then(newErrorMessages => {
                setErrorMessages(newErrorMessages);
            });
        }
        
    }


    return (
        <Box width='95%' mx={ 2 }>
            <Box display="flex" flexDirection="row" flexWrap="wrap">
                <LocalizationProvider dateAdapter={ AdapterMoment }>
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
            {errorMessages.length == 0 && (
                <Alert severity="info">There are no error logs in this time frame</Alert>
            )}
        </Box>
    );
}