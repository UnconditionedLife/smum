import React from "react";
import { Box, TableRow, TableCell, Typography, TableHead } from "@material-ui/core";
import moment from 'moment';
import logo from '../../../images/receipt-logo.png';
import PropTypes from 'prop-types';

ReportsHeader.propTypes = {
    reportType: PropTypes.string,
    reportCategory: PropTypes.string,
    columns: PropTypes.array
}

export default function ReportsHeader(props) {
    const reportType = props.reportType
    const reportCategory = props.reportCategory
    const columns = props.columns

    return (
        <TableHead>
            <TableRow>
                <TableCell colSpan={columns.length} style={{ alignContent: "center" }}>
                    <Box style={{ display: 'grid', gridTemplateColumns: 'repeat('+columns.length+', 1fr)' }}>
                        <Box style={{fontSize: '2rem', 
                            display: 'flex',
                            justifyContent: 'center',
                            color: 'var(--grey-green)',
                            alignItems: 'center',
                            fontWeight: 'bold'}}>
                            {reportCategory}
                        </Box>
                        <Box>
                            <Box align="center"><img width='40%' src={logo} /></Box>
                            <Typography style={{ fontWeight: 'bold' }} align='center'>SANTA MARIA URBAN MINISTRY</Typography>
                            <Typography style={{ fontWeight: 'bold' }} align='center'>{ moment().format("MMMM DD, YYYY | HH:MM a") }</Typography>
                        </Box>
                        <Box style={{fontSize: '2rem', 
                            display: 'flex',
                            color: 'var(--grey-green)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: 'bold'}}>
                            {reportType}
                        </Box>
                    </Box>
                </TableCell>
            </TableRow>
            <TableRow>
                {columns.map((item) =>
                    <TableCell key={item} align="center">{item}</TableCell>
                )}
            </TableRow>
        </TableHead>
    )
}