/* eslint-disable react/jsx-key */
import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { HistoryButtons } from '../../Clients';
import theme from '../../Theme.jsx';
import { DependentsFormDialog } from '../../Clients';
import { isEmpty } from '../../System/js/GlobalUtils.js';


DependentsDisplay.propTypes = {
    client: PropTypes.object.isRequired,
}

export default function DependentsDisplay(props) {

    function handleEditMode(newEditMode) {
        switch(newEditMode) {
            case 'edit':
                setEditMode('edit')
                // setAnchorEl(null)
                break;
        }
    }
    const [ editRecord, setEditRecord ] = useState(null);

    function handleEditRecord(newRecord){
        setEditRecord(newRecord)
        handleEditMode('none')
    }

    const dependentsNoAges = props.client.dependents ? props.client.dependents : []
    const [selectedDependent, setSelectedDependent] = useState(null);
    const [anchorEl, setAnchorEl ] = useState(null);
    const dependents = window.utilCalcDependentsAges(dependentsNoAges)
    console.log(dependents);

    function handleSelectedDependent(event, newDepId) {
        setSelectedDependent(newDepId);
        const record = dependentsNoAges.filter(function( obj ) {
            return obj.depId === newDepId
        })[0]
        // setEditMode('none')
        setEditRecord(record)
        setAnchorEl(anchorEl ? null : event.currentTarget);
    }

    function handleEditModeChange(newEditMode) {
        console.log(newEditMode)
        if (newEditMode === 'cancel') {
            setSelectedDependent(null)
        }
    };
    //console.log(dependents)
    // useEffect(() => {
    //     if (!isEmpty(client)) {

    //     }
    // })
    if (!isEmpty(dependents)) {
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
                            <TableCell component="th" scope="row" align="center">{row.givenName}</TableCell>
                            <TableCell align="center">{row.familyName}</TableCell>
                            <TableCell align="center">{row.relationship}</TableCell>
                            <TableCell align="center">{row.gender}</TableCell>
                            <TableCell align="center">{row.dob}</TableCell>
                            <TableCell align="center">{row.age}</TableCell>
                            <TableCell align="center">{row.grade}</TableCell>
                            <TableCell align="center">{row.isActive}</TableCell>
                        </TableRow>
                        { row.depId === selectedDependent &&
                             
                            <DependentsFormDialog session={ props.session } client = { props.client }  
                             editRecord={ editRecord } handleEditRecord={ handleEditRecord } />
                        }
                         {/*{ editMode === 'edit' &&  
                        <TableRow key={ row.depId + '- edit' }>
                        <TableCell align="center" colSpan="10">
                            <HistoryButtons editMode={ editMode } handleEditModeChange = { handleEditModeChange }/>
                        </TableCell>
                    </TableRow>
                        } */}
                        </Fragment>
                    ))}
                    </TableBody>
                    </Table>
                </TableContainer>
             </ThemeProvider>
        </Box>
    );
} else {
    return null
}
}
    
