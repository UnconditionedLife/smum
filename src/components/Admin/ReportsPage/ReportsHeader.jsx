import React  from "react";
import { Box, TableRow, TableCell, Typography, TableHead } from "@mui/material";
import moment from 'moment';
import logo from '/public/images/receipt-logo.png';
import PropTypes from 'prop-types';

ReportsHeader.propTypes = {
    reportDate: PropTypes.string.isRequired,
    reportType: PropTypes.string.isRequired,
    reportCategory: PropTypes.string.isRequired,
    groupColumns: PropTypes.array,
    columns: PropTypes.array.isRequired,
    showEfa7Header: PropTypes.bool
}

export default function ReportsHeader(props) {
    const { reportDate, reportType, reportCategory, columns, groupColumns } = props
    const showEfa7Header = props.showEfa7Header ? props.showEfa7Header : false



    return (
        <TableHead >
            <TableRow>
                <TableCell colSpan={columns.length} style={{ backgroundColor: 'white', alignContent: "center" }}>
                    <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <Box style={{fontSize: '1.55rem', 
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: 'bold'}}>
                            { reportCategory }
                        </Box>
                        <Box>
                            <Box align="center"><img width='70%' src={ logo } /></Box>
                            <Typography style={{ fontSize: '13px', fontWeight: 'bold' }} align='center'>Generated:&nbsp;{ moment().format("MMM DD, YYYY | h:mm a") }</Typography>
                        </Box>
                        <Box style={{fontSize: '1.55rem', 
                            lineHeight: '1.58rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            fontWeight: 'bold'}}>
                            { reportDate }
                            <br />
                            {reportType}
                        </Box>
                    </Box>
                    { showEfa7Header ?
                        <Box style={{fontWeight: 'normal',
                        justifyContent: 'left',
                        alignItems: 'left',
                        textAlign: 'left'}}>
                           <strong>You self-declare that:</strong>
                           <Box ml={4}>
                            <ol>
                                    <li>Your name and address listed is correct; if homeless, you can put homeless as the address.</li>
                                    <li>Your household size as stated and resides within this state and organization’s service area.</li>
                                    <li>Your income is within 235% of the Federal Poverty Guidelines as posted for this distribution.</li>
                                    <li>You agree that TEFAP food is for home consumption only and will not be sold, traded, or bartered.</li>
                                    <li>You have been shown and have read the full USDA Nondiscrimination Statement.</li>
                            </ol>
                           </Box>
                           <Box style={{border:"solid 2px black", padding:"8px", marginTop:"16px", marginBottom:"16px"}}>
                                <strong>You will not be denied TEFAP food if you refuse to disclose any information that is not a requirement of TEFAP.</strong> You will <strong><i>never</i></strong> need to provide your social security number or proof of income.
                           </Box>
                        </Box> : null
                    }
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
                                    font-size: 13px;
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
                                    font-size: 13px;
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