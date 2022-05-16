/* eslint-disable react/jsx-key */
import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { Fab } from '../../System';
import { DependentsFormDialog } from '..';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { navigationAllowed } from '../../System/js/Database';


DependentsDisplay.propTypes = {
    client: PropTypes.object.isRequired,
    saveAndUpdateClient: PropTypes.func.isRequired,
    saveMessage: PropTypes.object.isRequired,
}

export default function DependentsDisplay(props) {
    const { client, saveAndUpdateClient, saveMessage } = props
    const [ editRecord, setEditRecord ] = useState(null);
    const [ selectedDependent, setSelectedDependent ] = useState(null);
    const [ anchorEl, setAnchorEl ] = useState(null);
    const dependents = client.dependents

    function handleEditRecord(newRecord){
        setEditRecord(newRecord)
    }

    function handleSelectedDependent(event, newDepId) {
        if (navigationAllowed()) {
            setSelectedDependent(newDepId);
            const record = dependents.filter(function( obj ) {
                return obj.depId === newDepId
            })[0]
            setEditRecord(record)
            setAnchorEl(anchorEl ? null : event.currentTarget);
        }
    }

    function handleNewDependent() {
        const emptyDep = {
            age: "", dob: "", familyName: "", gender: "", givenName: "",
            grade: "", gradeDateTime: "", isActive: "Active", relationship: ""
        }
        setEditRecord(emptyDep)
        setSelectedDependent("new")
    }

    const dialogProps = {
        client, saveAndUpdateClient, saveMessage, selectedDependent, 
        editRecord, handleEditRecord, setAnchorEl, setSelectedDependent
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Box display="flex" flexDirection="column" alignItems="flex-end" style={{ overflow: "hidden auto" }}>
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
                        { (!isEmpty(dependents)) &&
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
                    

                                </Fragment>
                            ))}
                            </TableBody>
                        }
                        </Table>
                    </TableContainer>
                    { selectedDependent !== null &&
                        <DependentsFormDialog { ...dialogProps } />
                    }
            </Box>
            <Box display="flex" mt={ 2 }>
                <Tooltip title= 'Add Dependent' placement="left-end">
                    <Fab  float='right' onClick={() => handleNewDependent()} size='small' color='default' ><Add /></Fab> 
                </Tooltip>
            </Box>
        </Box>
    );
}