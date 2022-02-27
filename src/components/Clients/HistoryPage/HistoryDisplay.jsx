import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Popper, Table, TableBody, TableCell, TableContainer, 
            TableHead, TableRow } from '@material-ui/core';
import { Card } from '../../System';
import { HistoryFormDialog, HistoryPopupMenu } from '..';
import { isEmpty } from '../../System/js/GlobalUtils';
import { removeSvcAsync } from '../../System/js/Clients/History';
import { globalMsgFunc } from '../../System/js/Database';
import moment from 'moment';

HistoryDisplay.propTypes = {
    client: PropTypes.object.isRequired, updateClient: PropTypes.func.isRequired,
}

export default function HistoryDisplay(props) {
    const { client, updateClient } = props
    const svcHistory = client.svcHistory
    
    const [ selectedService, setSelectedService ] = useState(null);
    const [ editMode, setEditMode ] = useState('none');
    const [ anchorEl, setAnchorEl ] = useState(null);
    const [ editRecord, setEditRecord ] = useState(null);
    
    function handleSelectedService(event, newSelSvc) {
        setSelectedService(newSelSvc)
        const record = svcHistory.filter(function( obj ) {
            return obj.serviceId === newSelSvc.serviceId
        })[0]
        setEditRecord(record)
        setAnchorEl(anchorEl ? null : event.currentTarget);
    }

    function clearSelection(){
        setSelectedService(null)
        setAnchorEl(null)
        setEditRecord(null)
    }

    function handleEditMode(newEditMode) {

        console.log("EDIT MODE", newEditMode )

        switch(newEditMode) {
            case 'cancel':
                setEditMode('none')
                clearSelection()
                break;
            case 'edit':
                setEditMode('edit')
                setAnchorEl(null)
                break;
            case 'remove':
                setEditMode('confirm')
                break;
            case 'confirm':
                handleRemoveSvc()
                break;
        }
    }

    function handleRemoveSvc(){
        removeSvcAsync(client, selectedService)
            .then((newClient) => {                
                if (newClient !== null){
                    setEditMode('none')
                    setAnchorEl(null)
                    updateClient(newClient)
                    globalMsgFunc('success', "Service removed")
                } else {
                    setEditMode('none')
                    globalMsgFunc('error', "FAILED to remove service")
                }
                clearSelection()
            }
        )
    }

    function handleEditRecord(newRecord){
        setEditRecord(newRecord)
        clearSelection()
    }

    const menuOpen = Boolean(anchorEl);
    const id = menuOpen ? 'simple-popper' : undefined;

    if (isEmpty(svcHistory)) return null

    return (
        <Fragment>
            <Popper id={ id } open={ menuOpen } anchorEl={ anchorEl }>
                <Card m={ 0 } p={ 2 }>
                    <HistoryPopupMenu editMode={ editMode } handleEditMode={ handleEditMode } 
                         /> 
                         {/* message={ message } */}
                        {/* delay={ delay } */}
                </Card>
            </Popper>
        <TableContainer > 
            <Table >
            <TableHead>
                <TableRow>
                    <TableCell align="center">Served</TableCell>
                    <TableCell align="center">Service</TableCell>
                    <TableCell align="center">Client Status</TableCell>
                    <TableCell align="center">Homeless</TableCell>
                    <TableCell align="center"># Items</TableCell>
                    <TableCell align="center"># Adults</TableCell>
                    <TableCell align="center"># Children</TableCell>
                    <TableCell align="center"># Individuals</TableCell>
                    <TableCell align="center"># Seniors</TableCell>
                    <TableCell align="center">Serviced By</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <Fragment key={ svcHistory }>
                    { svcHistory.map((svc) => (
                        <Fragment key={svc.serviceId} >
                            <TableRow 
                                key={svc.serviceId}
                                onClick= { (event) => handleSelectedService(event, svc)}
                                selected= { svc.serviceId == selectedService } >
                                <TableCell align="center">
                                        { moment(svc.servicedDateTime).format("MMM DD, YYYY - h:mm a") }
                                </TableCell>
                                <TableCell align="center">{ svc.serviceName }</TableCell>
                                <TableCell align="center">{ svc.clientStatus }</TableCell>
                                <TableCell align="center">{ svc.homeless }</TableCell>
                                <TableCell align="center">{ svc.itemsServed }</TableCell>
                                <TableCell align="center">{ svc.totalAdultsServed }</TableCell>
                                <TableCell align="center">{ svc.totalChildrenServed }</TableCell>
                                <TableCell align="center">{ svc.totalIndividualsServed }</TableCell>
                                <TableCell align="center">{ svc.totalSeniorsServed }</TableCell>
                                <TableCell align="center">{ svc.servicedByUserName }</TableCell>
                            </TableRow>
                        </Fragment>
                    ))}
                    { editMode === 'edit' &&
                        <HistoryFormDialog client = { client } editMode={ editMode } updateClient = {props.updateClient}
                        handleEditMode={ handleEditMode } editRecord={ editRecord } handleEditRecord={ handleEditRecord } />
                    }
                </Fragment>
            </TableBody>
            </Table>
        </TableContainer>
        </Fragment>
    )
}