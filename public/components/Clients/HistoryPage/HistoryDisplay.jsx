import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Popper, Table, TableBody, TableCell, TableContainer, 
            TableHead, TableRow } from '@material-ui/core';
import { Card } from '../../System';
import { HistoryFormDialog, HistoryPopupMenu } from '../../Clients';
import { isEmpty } from '../../System/js/Utils';
import { getServiceHistory } from '../../System/js/Clients';

HistoryDisplay.propTypes = {
    session: PropTypes.object.isRequired,
    client: PropTypes.object,       // current client object
}

export default function HistoryDisplay(props) {
    const [ clientHistory, setClientHistory ] = useState(getServiceHistory());
    const [ selectedService, setSelectedService ] = useState(null);
    const [ editMode, setEditMode ] = useState('none');
    const [ anchorEl, setAnchorEl ] = useState(null);
    const [ editRecord, setEditRecord ] = useState(null);
    const [ message, setMessage ] = useState({})
    const [ delay, setDelay ] = useState(false)

    let delayInt
    let reloadHistory = false

    function handleClientHistory(){
        setClientHistory(getServiceHistory())
    }
    
    function handleSelectedService(event, newServiceId) {
        setSelectedService(newServiceId)
        const record=clientHistory.filter(function( obj ) {
            return obj.serviceId === newServiceId
        })[0]
        console.log(record)
        console.log(anchorEl)
        setEditMode('none')
        setEditRecord(record)
        setAnchorEl(anchorEl ? null : event.currentTarget);
    }

    function handleEditMode(newEditMode) {
        console.log(newEditMode)
        switch(newEditMode) {
            case 'cancel':
                setSelectedService(null)
                setEditMode('none')
                setAnchorEl(null)
                break;
            case 'edit':
                setEditMode('edit')
                setAnchorEl(null)
                break;
            case 'remove':
                setEditMode('confirm')
                break;
            case 'confirm':
                removeService()
                setSelectedService(null)
                setEditMode('message')
                break;
            case 'message':
                console.log('Show Message')
                if (delay === false) {
                    setEditMode('none')
                    setAnchorEl(null)
                }
        }
    }

    function removeService(){
        const service = window.utilRemoveService(selectedService)
        if (service !== ""){
            handleMessage({ text: "Service successfully removed!", severity: "success" })
            setDelayTimer(true)
            reloadHistory = true
        } else {
            handleMessage({ text: "Failed to remove service!", severity: "error" })
        }
    }

    function handleEditRecord(newRecord){
        console.log('update history record')
        setEditRecord(newRecord)
        handleEditMode('none')
    }

    function handleMessage(newMessage){
        setMessage(newMessage)
    }

    function setDelayTimer(boo){
        if (boo === false) {
            if  (reloadHistory) {
                setEditMode('none')
                setAnchorEl(null)
                setClientHistory(getServiceHistory())
                const result = window.utilUpdateLastServed()
                reloadHistory = false
                if (result == "failed") return
            }
            clearTimeout(delayInt)
            setDelay(false)
        } else {
            delayInt = setTimeout(function(){
                setDelayTimer(false);
            }, 1500)
            setDelay(true)
        }
    }

    const menuOpen = Boolean(anchorEl);
    const id = menuOpen ? 'simple-popper' : undefined;

    console.log(clientHistory)

    if (isEmpty(clientHistory)) return null

    return (
        <Fragment>
            <Popper id={ id } open={ menuOpen } anchorEl={ anchorEl }>
                <Card m={ 0 } p={ 2 }>
                    <HistoryPopupMenu editMode={ editMode } handleEditMode={ handleEditMode } 
                        message={ message } delay={ delay }/>
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
                { clientHistory.map((row) => (
                    <Fragment key={row.serviceId} >
                        {/* { ((editMode === 'none') || (editMode === 'edit' && row.serviceId !== selectedService )) &&  */}
                            <TableRow 
                                key={row.serviceId}
                                onClick= { (event) => handleSelectedService(event, row.serviceId)}
                                selected= { row.serviceId == selectedService } >
                                <TableCell align="center">{ window.moment(row.servicedDateTime).format("MMM DD, YYYY - h:mm a") }</TableCell>
                                <TableCell align="center">{ row.serviceName }</TableCell>
                                <TableCell align="center">{ row.clientStatus }</TableCell>
                                <TableCell align="center">{ row.homeless }</TableCell>
                                <TableCell align="center">{ row.itemsServed }</TableCell>
                                <TableCell align="center">{ row.totalAdultsServed }</TableCell>
                                <TableCell align="center">{ row.totalChildrenServed }</TableCell>
                                <TableCell align="center">{ row.totalIndividualsServed }</TableCell>
                                <TableCell align="center">{ row.totalSeniorsServed }</TableCell>
                                <TableCell align="center">{ row.servicedByUserName }</TableCell>
                            </TableRow>
                        {/* } */}
                        
                        { editMode === 'edit' &&
                            <HistoryFormDialog session={ props.session } client = { props.client } editMode={ editMode } 
                            handleEditMode={ handleEditMode } editRecord={ editRecord } handleEditRecord={ handleEditRecord } 
                            handleClientHistory={ handleClientHistory }/>
                        }
                    </Fragment>
                ))}
            </TableBody>
            </Table>
        </TableContainer>
        </Fragment>
    )
}