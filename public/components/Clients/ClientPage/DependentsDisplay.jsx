import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { HistoryButtons } from '../../Clients';
import theme from '../../Theme.jsx';
import { isEmpty } from '../../System/js/GlobalUtils.js';

DependentsDisplay.propTypes = {
    client: PropTypes.object.isRequired,
}

export default function DependentsDisplay(props) {
    const dependentsNoAges = props.client.dependents ? props.client.dependents : []
    const [selectedService, setSelectedService] = useState(null);
    const [editMode, setEditMode] = useState(null);
    const dependents = window.utilCalcDependentsAges(dependentsNoAges)
    console.log(dependents);

    function handleSelectedService(event, newDepId) {
        setSelectedService(newDepId)
    };

    function handleEditModeChange(newEditMode) {
        console.log(newEditMode)
        if (newEditMode === 'cancel') {
            setEditMode(null)
            setSelectedService(null)
        } else if (newEditMode === 'edit') {

        } else if (newEditMode === 'remove') {
        
        }
    };
    //console.log(dependents)
    // useEffect(() => {
    //     if (!isEmpty(client)) {

    //     }
    // })
    if (!isEmpty(dependents)) {
    return (
        <div>
            <ThemeProvider theme={ theme }>
                <TableContainer align="center"> 
                    <Table align="center">
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
                            <Fragment>
                        <TableRow 
                            key={row.depId} 
                            onClick= { (event) => handleSelectedClient(event, row.depId)}
                            selected= { row.clientId == clientId }  >
    
                            <TableCell component="th" scope="row">{row.depId}</TableCell>
                            <TableCell component="th" scope="row" align="center">{row.givenName}</TableCell>
                            <TableCell align="center">{row.familyName}</TableCell>
                            <TableCell align="center">{row.relationship}</TableCell>
                            <TableCell align="center">{row.gender}</TableCell>
                            <TableCell align="center">{row.dob}</TableCell>
                            <TableCell align="center">{row.age}</TableCell>
                            <TableCell align="center">{row.grade}</TableCell>
                            <TableCell align="center">{row.isActive}</TableCell>
                        </TableRow>
                        { row.depId === selectedService &&
                            <TableRow key={ row.depId + '- edit' }>
                                <TableCell align="center" colSpan="10">
                                    <HistoryButtons editMode={ editMode } handleEditModeChange = { handleEditModeChange }/>
                                </TableCell>
                            </TableRow>
                        }
                        </Fragment>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
             </ThemeProvider>
        </div>
    );
} else {
    return null
}
};