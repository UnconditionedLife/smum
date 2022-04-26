import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Snackbar, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip, Fab } from '@material-ui/core';
import { ExpandMore, Add } from '@material-ui/icons';
import { dbGetSvcTypesAsync, getSvcTypes } from '../../System/js/Database.js';
import { ServiceTypeFormDialog } from '..';

ServiceTypeList.propTypes = {
    list: PropTypes.array.isRequired,
    updateSvcTypes: PropTypes.func.isRequired
}

function ServiceTypeList(props) {
    const [ editMode, setEditMode ] = useState('none');
    const [ selectedService, setSelectedService ] = useState(null);
    const [ editRecord, setEditRecord ] = useState(null);

    function clearSelection(){
        setSelectedService(null)
        setEditRecord(null)
    }

    function handleEditRecord(newRecord){
        setEditRecord(newRecord)
        //clearSelection()   
    }

    function handleEditMode(newEditMode) {
        switch(newEditMode) {
            case 'cancel':
                setEditMode('none')
                clearSelection()
                break;
            case 'message':
                setEditMode('none')
                clearSelection()
        }
    }

    function handleSelectedService(event, newServiceId) {
        setSelectedService(newServiceId)

        const record = props.list.filter(function( obj ) {
            return obj.serviceTypeId === newServiceId
        })[0]
        // console.log(record)
        // setEditMode('none')
        setEditRecord(record)
        setEditMode('edit')
    }

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
                        onClick= { (event) => handleSelectedService(event, row.serviceTypeId)}
                        selected= { row.serviceTypeId == selectedService } >
                        <TableCell component="th" scope="row">{row.serviceName}</TableCell>
                        <TableCell align="center">{row.serviceCategory}</TableCell>
                        <TableCell align="center">{row.serviceDescription}</TableCell>
                    </TableRow>
                    ))}
                    { editMode === 'edit' &&
                        <ServiceTypeFormDialog editMode={ editMode } handleEditMode={ handleEditMode } updateSvcTypes={ props.updateSvcTypes }
                        serviceTypes={ props.list } editRecord={ editRecord } handleEditRecord={ handleEditRecord } />
                    }
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default function ServiceTypePage() {
    const [ svcTypes, setSvcTypes ] = useState( getSvcTypes() )
    const [ isNew, setIsNew ] = useState(false)
    const [ editRecord, setEditRecord ] = useState(null);

    useEffect(() => {
        if (svcTypes.length === 0) updateSvcTypes()
    })

    function updateSvcTypes() {
        dbGetSvcTypesAsync().then(
            data => setSvcTypes(data)
        )
    }

    function handleNewClick() {
        setIsNew(true)
        setEditRecord(null)
    }

    return (
        <Box mt={ 2 }>
            <Snackbar  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={ true } >
                <Tooltip title= 'Add Service Type'>
                    <Fab onClick={()=>handleNewClick()} size="small" color='default' >
                        <Add />
                    </Fab>
                </Tooltip>
            </Snackbar>
            { isNew &&
                <ServiceTypeFormDialog editMode={ "new" } handleEditMode={ ()=>{setIsNew(false)} } updateSvcTypes={ updateSvcTypes }
                    serviceTypes={ svcTypes } editRecord={ editRecord } handleEditRecord={ setEditRecord } />
            }
            <Accordion defaultExpanded={ true }>
                <AccordionSummary expandIcon={ <ExpandMore /> }>
                    <Typography variant='button' >Active Service Types</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <ServiceTypeList 
                        updateSvcTypes={ updateSvcTypes }
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
                        updateSvcTypes={ updateSvcTypes } 
                        list={ svcTypes.filter(s => s.isActive != 'Active') } 
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}