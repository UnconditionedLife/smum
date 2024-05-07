import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { TextField } from "../../System";

import {
    Alert,
    Box,
    Table,
    TableBody,
    Button,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { dbFetchErrorLogs } from "../../System/js/Database";
import { globalMsgFunc } from '../../System/js/Database';

// import dayjs, { Dayjs } from "dayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

ErrorPage.propTypes = {
    errorMessagesUpdate: PropTypes.func.isRequired,
    errorMessages: PropTypes.array.isRequired,
    // countUpdate: PropTypes.func.isRequired,
    totalCountErrors: PropTypes.number,
    startDate: PropTypes.instanceOf(dayjs),
    setStartDate: PropTypes.func.isRequired,
    endDate: PropTypes.instanceOf(dayjs),
    setEndDate: PropTypes.func.isRequired
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
    // error messages list stores the dates in utc time
    // const [startDate, setStartDate] = useState(null);
    // const [endDate, setEndDate] = useState(null);
    const [isValidRange, setIsValidRange] = useState(true);
    // const [viewingCount, setViewingCount] = useState(null);
    const [categoryName, setCategoryName] = useState("ERROR");
    const [traceMessages, setTraceMessages] = useState([]);
    console.log("type of Dayjs: ", typeof dayjs);

    useEffect(() => {
        const invalidStart = props.startDate && !props.startDate.isValid();
        const invalidEnd = props.endDate && !props.endDate.isValid();
        const outOfOrder =
            props.startDate?.isValid() &&
            props.endDate?.isValid() &&
            !props.startDate.isBefore(props.endDate);
        if (invalidStart || invalidEnd || outOfOrder) {
            setIsValidRange(false);
        } else {
            setIsValidRange(true);
        }
    }, [props.startDate, props.endDate]);

    // useEffect(() => {
    //     setViewingCount(props.errorMessages.length);
    // }, [props.errorMessages])

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
        if (props.startDate?.isValid() && props.endDate?.isValid()) {
            start = props.startDate.utc().format();
            end = dayjs(props.endDate).add(23, "h").add(59, "m").utc().format();
        } else if (props.startDate?.isValid()) {
            start = props.startDate.utc().format();
        } else if (props.endDate?.isValid()) {
            end = dayjs(props.endDate).add(23, "h").add(59, "m").utc().format();
        }
        dbFetchErrorLogs(start, end, "ERROR").then((newErrorMessages) => {
            props.errorMessagesUpdate(newErrorMessages);
            // props.countUpdate(newErrorMessages.length);
        });
        dbFetchErrorLogs(start, end, "TRACE").then((newTraceMessages) => {
            setTraceMessages(newTraceMessages);
        });
    };

    const handleCategoryChange = (event, newCategory) => {
        setCategoryName(newCategory);
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
                        value={props.startDate}
                        renderInput={(params) => <TextField {...params} />}
                        onChange={(newValue) => props.setStartDate(newValue)}
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
                        value={props.endDate}
                        renderInput={(params) => <TextField {...params} />}
                        onChange={(newValue) => props.setEndDate(newValue)}
                        disableMaskedInput
                    />
                </LocalizationProvider>
                <Button
                    onClick={updateRange}
                    variant="contained"
                    color="primary"
                    // disabled={!isValidRange}
                >
                    Apply
                </Button>
                <ToggleButtonGroup
                    color="primary"
                    value={categoryName}
                    exclusive
                    onChange={handleCategoryChange}
                    aria-label="Platform"
                >
                    <ToggleButton value="ERROR">Error</ToggleButton>
                    <ToggleButton value="TRACE">Trace</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            {/* <p>Viewing {viewingCount} of {props.totalCountErrors}</p> */}
            {/* {!isValidRange && (
                <Alert severity="warning">
                    Dates must be valid and sequential
                </Alert>
            )} */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Time Stamp</TableCell>
                            <TableCell align="center">Message</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(categoryName === "ERROR" ? props.errorMessages : traceMessages).map((row) => (
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
            {props.errorMessages.length == 0 && (
                <Alert severity="info">
                    There are no error logs in this time frame
                </Alert>
            )}
        </Box>
    );
}
