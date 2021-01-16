import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { getSvcTypes } from '../../System/js/Database.js';

ServiceTypeList.propTypes = {
    list: PropTypes.array.isRequired,
}

function ServiceTypeList(props) {
    return (
        <Box width='100%' mx={ 2 }>
            <TableContainer> 
                <Table>
                <TableHead>
                    <TableRow>
                    <TableCell align="center">Name</TableCell>
                    <TableCell align="center">Category</TableCell>
                    <TableCell align="center">Description</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.list.map((row) => (
                    <TableRow 
                        key={ row.serviceTypeId }
                    >
                        <TableCell component="th" scope="row">{row.serviceName}</TableCell>
                        <TableCell align="center">{row.serviceCategory}</TableCell>
                        <TableCell align="center">{row.serviceDescription}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default function ServiceTypePage() {
    const svcTypes = getSvcTypes();
    return (
        <Box mt={7}>
            <Accordion defaultExpanded={ true }>
                <AccordionSummary expandIcon={ <ExpandMore /> }>
                    <Typography variant='button' >Active Service Types</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <ServiceTypeList 
                        list={ svcTypes.filter(s => s.isActive == 'Active') }
                    />
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={ <ExpandMore /> }>
                    <Typography variant='button' >Inactive Service Types</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <ServiceTypeList 
                        list={ svcTypes.filter(s => s.isActive != 'Active') } 
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}