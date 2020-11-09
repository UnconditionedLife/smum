import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from '../../Theme.jsx';
import { isEmpty } from '../../System/js/Utils.js';

DependentsDisplay.propTypes = {
    client: PropTypes.object.isRequired,
}

export default function DependentsDisplay(props) {
    const dependentsNoAges = props.client.dependents ? props.client.dependents : []

    const dependents = window.utilCalcDependentsAges(dependentsNoAges)


    //console.log(dependents)
    // useEffect(() => {
    //     if (!isEmpty(client)) {

    //     }
    // })
    
    return (
        <div>
            <ThemeProvider theme={ theme }>
                <TableContainer > 
                    <Table >
                    <TableHead>
                        <TableRow>
                        {/* <TableCell>ID #</TableCell> */}
                        <TableCell align="center">Given Name</TableCell>
                        <TableCell align="center">Family Name</TableCell>
                        <TableCell align="center">Relationship</TableCell>
                        <TableCell align="center">Gender</TableCell>
                        <TableCell align="center">DOB</TableCell>
                        <TableCell align="center">Age</TableCell>
                        <TableCell align="center">Grade</TableCell>
                        <TableCell align="center">Status</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dependents.map((row) => (
                        <TableRow 
                            key={row.depId} 
                            // onClick= { (event) => handleSelectedClient(event, row.depId)}
                            // selected= { row.clientId == clientId }
                            >
                            {/* <TableCell component="th" scope="row">{row.depId}</TableCell> */}
                            <TableCell component="th" scope="row" align="center">{row.givenName}</TableCell>
                            <TableCell align="center">{row.familyName}</TableCell>
                            <TableCell align="center">{row.relationship}</TableCell>
                            <TableCell align="center">{row.gender}</TableCell>
                            <TableCell align="center">{row.dob}</TableCell>
                            <TableCell align="center">{row.age}</TableCell>
                            <TableCell align="center">{row.grade}</TableCell>
                            <TableCell align="center">{row.isActive}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
            </ThemeProvider>
        </div>
    )
}