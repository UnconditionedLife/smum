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

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { dbFetchErrorLogs } from "../../System/js/Database";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default function ErrorPage(props) {
    // error messages stores the dates in utc time
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isValidRange, setIsValidRange] = useState(true);
    // const base_url = "https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/";

    useEffect(() => {
        const invalidStart = startDate && !startDate.isValid();
        const invalidEnd = endDate && !endDate.isValid();
        const outOfOrder = startDate?.isValid() && endDate?.isValid() && !startDate.isBefore(endDate);
        if(invalidStart || invalidEnd || outOfOrder){
            setIsValidRange(false);
        } else {
            setIsValidRange(true);
        }
    }, [startDate, endDate]);

    const updateErrorRange = () => {
        if (!isValidRange){
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
        dbFetchErrorLogs(start, end).then((newErrorMessages) => {
            props.errorMessagesUpdate(newErrorMessages);
            props.countUpdate(newErrorMessages.length);
        });
    };

    return (
        <Box width="95%" mx={2}>
            <Box display="flex" flexDirection="row" flexWrap="wrap" style={{ marginTop: "15px" }}>
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
                <Button onClick={updateErrorRange} variant="contained" color="primary" disabled={!isValidRange}>Apply</Button>
            </Box>
            {!isValidRange && <Alert severity="warning">Dates must be valid and sequential</Alert>}
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
                            <TableRow key={row.logID}>
                                <TableCell component="th" scope="row">
                                    {dayjs(row.logTimestamp).local().format("dddd, MMMM D, YYYY, h:mm:ss a")}
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
                <Alert severity="info">There are no error logs in this time frame</Alert>
            )}
        </Box>
    );
}
