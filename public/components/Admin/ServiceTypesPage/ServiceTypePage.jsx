import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { getSvcTypes } from '../../System/js/Database.js';
import { ServiceTypeFormDialog } from '../../Admin';

ServiceTypeList.propTypes = {
    list: PropTypes.array.isRequired,
    session: PropTypes.object.isRequired,
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
        clearSelection()   
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
        console.log(record)
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
                        <ServiceTypeFormDialog editMode={ editMode } handleEditMode={ handleEditMode } 
                          serviceTypes={ props.list } editRecord={ editRecord } handleEditRecord={ handleEditRecord } />
                    }
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

ServiceTypePage.propTypes = {
    session: PropTypes.object.isRequired,
}

export default function ServiceTypePage(props) {
    const svcTypes = getSvcTypes();
    return (
        <Box mt={7}>
            <Accordion defaultExpanded={ true }>
                <AccordionSummary expandIcon={ <ExpandMore /> }>
                    <Typography variant='button' >Active Service Types</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <ServiceTypeList 
                        session={props.session}
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
                        session={props.session}
                        list={ svcTypes.filter(s => s.isActive != 'Active') } 
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}