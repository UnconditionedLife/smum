import React from "react";
import { Box, TableRow, TableCell, Typography, TableHead } from "@material-ui/core";
import moment from 'moment';
import logo from '/public/images/receipt-logo.png';
import PropTypes from 'prop-types';

ReportsHeader.propTypes = {
    reportType: PropTypes.string.isRequired,
    reportCategory: PropTypes.string.isRequired,
    groupColumns: PropTypes.array,
    columns: PropTypes.array.isRequired
}

export default function ReportsHeader(props) {
    const reportType = props.reportType
    const reportCategory = props.reportCategory
    const columns = props.columns
    const groupColumns = props.groupColumns

    return (
        <TableHead>
            <TableRow>
                <TableCell colSpan={columns.length} style={{ alignContent: "center" }}>
                    <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <Box style={{fontSize: '2rem', 
                            display: 'flex',
                            justifyContent: 'center',
                            color: 'var(--grey-green)',
                            alignItems: 'center',
                            fontWeight: 'bold'}}>
                            {reportCategory}
                        </Box>
                        <Box>
                            <Box align="center"><img width='70%' src={ logo } /></Box>
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
            {groupColumns ? (<TableRow>
                {groupColumns.map((item, ind) =>
                    <TableCell key={item.name+ind} className='greenBackgroundBorder' colSpan={item.length} align="center">
                        <style>
                            {`@media print { 
                                .greenBackgroundBorder { 
                                    padding: 6px 2px 6px 2px;
                                    background-color: rgb(104, 179, 107); 
                                    border: 1px solid #000;
                                    font-size: 14px;
                                    -webkit-print-color-adjust: exact; 
                                    }
                                }`
                            }
                        </style>
                        {item.name}
                    </TableCell>
                )}
            </TableRow>) : null}
            <TableRow>
                {columns.map((item, ind) =>
                    <TableCell className='oulined' style={groupColumns ? {background:"white"} : null} key={item+ind} align="center">
                        <style>
                            {`@media print { 
                                .oulined { 
                                    padding: 6px 2px 6px 2px;
                                    border: .5px solid #000;
                                    font-size: 14px;
                                    }
                                }`
                            }
                        </style>
                        {item}
                    </TableCell>
                )}
            </TableRow>
        </TableHead>
    )
}