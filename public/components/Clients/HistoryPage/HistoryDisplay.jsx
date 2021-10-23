import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Popper, Table, TableBody, TableCell, TableContainer, 
            TableHead, TableRow } from '@material-ui/core';
import { Card } from '../../System';
import { HistoryFormDialog, HistoryPopupMenu } from '../../Clients';
import { isEmpty } from '../../System/js/GlobalUtils';
import { getServiceHistoryAsync, updateLastServed, utilRemoveServiceAsync } from '../../System/js/Clients/History';
import { dbGetClientActiveServiceHistoryAsync } from '../../System/js/Database';

HistoryDisplay.propTypes = {
    client: PropTypes.object.isRequired, updateClient: PropTypes.func.isRequired,
}

export default function HistoryDisplay(props) {
    const client = props.client
    const updateClient = props.updateClient
    const svcHistory = props.client.svcHistory
    
    const [ selectedService, setSelectedService ] = useState(null);
    const [ editMode, setEditMode ] = useState('none');
    const [ anchorEl, setAnchorEl ] = useState(null);
    const [ editRecord, setEditRecord ] = useState(null);
    const [ message, setMessage ] = useState({})
    const [ delay, setDelay ] = useState(false)
    const [ reloadHistory, setReloadHistory ] = useState(false)

    let delayInt = 1500
    
    useEffect(() => {
        if (!isEmpty(client)) {
            const lastServed = client.lastServed
            if (lastServed.length > 0) {
                lastServed.sort((a, b) => moment.utc(b.serviceDateTime).diff(moment.utc(a.serviceDateTime)))
                // if last service is same day as today - UPDATE HISTORY
                if (moment(lastServed[0].serviceDateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
                    getServiceHistoryAsync(client.clientId)
                        .then((currentHistory) => {
                            const newClient = Object.assign({}, client)
                            newClient.svcHistory = currentHistory
                            updateClient(newClient)
        
                            //const svcHistoryToday = client.svcHistory.filter( obj => moment(obj.serviceDateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
                            // get history and build services rendered array from records that have today's date
                        }
                    )
                }
            }
        }
    }, [client.lastServed])

    function handleSelectedService(event, newServiceId) {
        setSelectedService(newServiceId)
        const record = svcHistory.filter(function( obj ) {
            return obj.serviceId === newServiceId
        })[0]
        // setEditMode('none')
        setEditRecord(record)
        setAnchorEl(anchorEl ? null : event.currentTarget);
    }

    function clearSelection(){
        setSelectedService(null)
        setAnchorEl(null)
        setEditRecord(null)
    }

    function handleEditMode(newEditMode) {
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
                removeService()
                break;
            case 'message':             
                setEditMode('none')
                clearSelection()
                setReloadHistory(true)
                setDelay(false)
        }
    }

    function removeService(){
        utilRemoveServiceAsync(selectedService)
            .then((svcRecord) => {

//console.log("RETURN FROM REMOVE SERVICE")
                
                if (svcRecord !== ""){
                    setDelay(true)
                    setDelayTimer(true)
                    handleMessage({ text: "Service successfully removed!", severity: "success" })
                    setEditMode('none')
                    setAnchorEl(null)
                    updateSvcHistory()
                    updateLastServed(client)
                    setEditMode('message')
                } else {
                    handleMessage({ text: "Failed to remove service!", severity: "error" })
                }
            }
        )
    }

    function handleEditRecord(newRecord){
        setEditRecord(newRecord)
        clearSelection()
    }

    function handleMessage(newMessage){
        setMessage(newMessage)
    }

    function updateSvcHistory(){
        dbGetClientActiveServiceHistoryAsync(client.clientId)
            .then((clientHistory) => {

// console.log("UPDATING SVC HST IN CLINET OBJ")

                    const tempClient = Object.create(client)
                    tempClient.svcHistory = clientHistory
                    updateClient(tempClient)
                }
        )
    }

//  WAS USED PRIOR TO ASYNC FUNCTIONS - NOT SURE IF DELAY NEEDS RO BE PASSED TO CHILD COMPONENT
    function setDelayTimer(delay){

console.log("DELAY HISTORY???")

        if (!delay) {
            if  (reloadHistory) {
                setEditMode('none')
                setAnchorEl(null)
                updateSvcHistory()
                const result = updateLastServed(client)
                setReloadHistory(false)
                if (result === "failed") return
            }
            clearTimeout(delayInt)
            setDelay(false)
        } else {
            delayInt = setTimeout(function(){
                setDelayTimer(false);
            }, 1000)
            setDelay(true)
        }
    }

    const menuOpen = Boolean(anchorEl);
    const id = menuOpen ? 'simple-popper' : undefined;

    if (isEmpty(svcHistory)) return null

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
                <Fragment key={ svcHistory }>
                    { svcHistory.map((row) => (
                        <Fragment key={row.serviceId} >
                            <TableRow 
                                key={row.serviceId}
                                onClick= { (event) => handleSelectedService(event, row.serviceId)}
                                selected= { row.serviceId == selectedService } >
                                <TableCell align="center">
                                        { window.moment(row.servicedDateTime).format("MMM DD, YYYY - h:mm a") }
                                </TableCell>
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
                        </Fragment>
                    ))}
                    { editMode === 'edit' &&
                        <HistoryFormDialog client = { props.client } editMode={ editMode } 
                        handleEditMode={ handleEditMode } editRecord={ editRecord } handleEditRecord={ handleEditRecord } />
                    }
                </Fragment>
            </TableBody>
            </Table>
        </TableContainer>
        </Fragment>
    )
}