import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { TextField } from "../../System";

import {
    Alert,
    Box,
    Button,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";


import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { dbFetchErrorLogs } from "../../System/js/Database";
import { globalMsgFunc } from '../../System/js/Database';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

ErrorPage.propTypes = {
    setTotalCountErrors: PropTypes.func.isRequired,
}

// delete errors
//      ask for specifics
// slider to update wether we are showing trace or error logs
//      look at show errors script
// ask for clarification on badge purpose
//      bar accross the top above the table
//      when were talking errors when the slider is set to errors
//      do we need a number for traces
//      x of total
// reverse chronological order??
// maintain the dates used in the query between navigation between tabs
//      rerun the empty query every time we go to the errors tab
export default function ErrorPage(props) {

    const [errorMessages, setErrorMessages] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    useEffect(() => {
        // query the error log api to find the number of errors
        dbFetchErrorLogs("","").then((errors) => {
            setErrorMessages(errors);
            props.setTotalCountErrors(errors.length);
        });
    }, []);


    // error messages list stores the dates in utc time
    const [isValidRange, setIsValidRange] = useState(true);
    const [categoryName, setCategoryName] = useState("ERROR");
    const [traceMessages, setTraceMessages] = useState([]);

    useEffect(() => {
        const invalidStart = startDate && !startDate.isValid();
        const invalidEnd = endDate && !endDate.isValid();
        const outOfOrder =
            startDate?.isValid() &&
            endDate?.isValid() &&
            startDate.isBefore(endDate);
        if (invalidStart || invalidEnd || outOfOrder) {
            setIsValidRange(false);
        } else {
            setIsValidRange(true);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        dbFetchErrorLogs("", "", "TRACE").then((newTraceMessages) => {
            setTraceMessages(newTraceMessages);
        });
    }, []);

    const updateRange = () => {
        if (!isValidRange) {
            globalMsgFunc('error', "Dates must be valid and sequential");
            return;
        }
        let start = "";
        let end = "";
        if (startDate?.isValid() && endDate?.isValid()) {
            start = startDate.utc().format();
            end = dayjs(endDate).add(23, "h").add(59, "m").utc().format();
        } else if (startDate?.isValid()) {
            start = startDate.utc().format();
        } else if (endDate?.isValid()) {
            end = dayjs(endDate).add(23, "h").add(59, "m").utc().format();
        }
        dbFetchErrorLogs(start, end, "ERROR").then((newErrorMessages) => {
            setErrorMessages(newErrorMessages);
            // countUpdate(newErrorMessages.length);
        });
        dbFetchErrorLogs(start, end, "TRACE").then((newTraceMessages) => {
            setTraceMessages(newTraceMessages);
        });
    };

    const handleCategoryChange = (event) => {
        setCategoryName(event.target.checked ? 'TRACE' : 'ERROR');
    };

    return (
        <Box width="95%" mx={2}>
            <Box
                display="flex"
                flexDirection="row"
                flexWrap="wrap"
                style={{ marginTop: "15px" }}
            >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                    <Switch checked={ categoryName === "TRACE" } onChange={handleCategoryChange} />
                    <Typography>Trace</Typography>
                </Box>
                <Button
                    onClick={updateRange}
                    variant="contained"
                    color="primary"
                    // disabled={!isValidRange}
                >
                    Apply
                </Button>
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
                        {(categoryName === "ERROR" ? errorMessages : traceMessages).map((row) => (
                            <TableRow key={row.logID}>
                                <TableCell component="th" scope="row">
                                    {dayjs(row.logTimestamp)
                                        .local()
                                        .format(
                                            "dddd, MMMM D, YYYY, h:mm:ss a"
                                        )}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.message}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {errorMessages.length == 0 && (
                <Alert severity="info">
                    There are no error logs in this time frame
                </Alert>
            )}
        </Box>
    );
}
