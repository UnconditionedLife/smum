/* eslint-disable react/jsx-key */
import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from '../../Theme.jsx';
import { DependentsFormDialog } from '../../Clients';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { getEditingState, globalMsgFunc } from '../../System/js/Database';

DependentsDisplay.propTypes = {
    client: PropTypes.object.isRequired,
    saveAndUpdateClient: PropTypes.func.isRequired,
    saveMessage: PropTypes.object.isRequired,
}

export default function DependentsDisplay(props) {
    const [ editRecord, setEditRecord ] = useState(null);
    const [ selectedDependent, setSelectedDependent ] = useState(null);
    const [ anchorEl, setAnchorEl ] = useState(null);
    const dependents = props.client.dependents

    function handleEditRecord(newRecord){
        setEditRecord(newRecord)
        handleEditMode('none')
    }

    function handleEditMode(newEditMode) {
        switch(newEditMode) {
            case 'edit':
                setEditMode('edit')
                // setAnchorEl(null)
                break;
        }
    }

    function handleSelectedDependent(event, newDepId) {
        if (getEditingState()) {
            globalMsgFunc('error', "Save or Cancel before editing dependents!")
        } else {
            setSelectedDependent(newDepId);
            const record = dependents.filter(function( obj ) {
                return obj.depId === newDepId
            })[0]
            // setEditMode('none')
            setEditRecord(record)
            setAnchorEl(anchorEl ? null : event.currentTarget);
        }
    }

    // function handleEditModeChange(newEditMode) {
    //     console.log(newEditMode)
    //     if (newEditMode === 'cancel') {
    //         setSelectedDependent(null)
    //     }
    // }

    if (isEmpty(dependents)) return null

    return (
        <Box align="center" justifyContent="center">
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
                            <Fragment key={ row.depId } >
                                <TableRow 
                                    key={ row.depId } 
                                    // onClick={ () => handleEditMode('edit')}
                                    // selected= { row.depId == selectedService } 
                                    onClick= { (event) => handleSelectedDependent(event, row.depId)}
                                    selected= { row.depId == selectedDependent } 
                                    >
                                    {/* <TableCell component="th" scope="row">{row.depId}</TableCell>*/}
                                    <TableCell component="th" scope="row" align="center">{ row.givenName }</TableCell>
                                    <TableCell align="center">{ row.familyName }</TableCell>
                                    <TableCell align="center">{ row.relationship }</TableCell>
                                    <TableCell align="center">{ row.gender }</TableCell>
                                    <TableCell align="center">{ row.dob }</TableCell>
                                    <TableCell align="center">{ row.age }</TableCell>
                                    <TableCell align="center">{ row.grade }</TableCell>
                                    <TableCell align="center">{ row.isActive }</TableCell>
                                </TableRow>
                                
                                { row.depId === selectedDependent &&
                                    <DependentsFormDialog client = { props.client } 
                                        saveAndUpdateClient={ props.saveAndUpdateClient } saveMessage={ props.saveMessage }
                                        selectedDependent ={ selectedDependent } editRecord={ editRecord } 
                                        handleEditRecord={ handleEditRecord } />
                                }
                        </Fragment>
                    ))}
                    </TableBody>
                    </Table>
                </TableContainer>
             </ThemeProvider>
        </Box>
    );
}