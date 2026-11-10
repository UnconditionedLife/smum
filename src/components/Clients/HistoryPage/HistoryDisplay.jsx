import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Popper, Table, TableBody, TableCell, TableContainer, 
            TableHead, TableRow } from '@mui/material';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import { Card } from '../../System';
import { HistoryFormDialog, HistoryPopupMenu, HistoryBodyRow, HistoryBodyCard } from '..';
import { isEmpty, isMobile } from '../../System/js/GlobalUtils';
import { removeSvcAsync } from '../../System/js/Clients/History';
import { globalMsgFunc, isAdmin } from '../../System/js/Database';
import dayjs from 'dayjs';
import { useEffect } from 'react';

HistoryDisplay.propTypes = {
    client: PropTypes.object.isRequired, updateClient: PropTypes.func.isRequired,
}

export default function HistoryDisplay(props) {
    const { client, updateClient } = props
    const [ selectedService, setSelectedService ] = useState(null);
    const [ editMode, setEditMode ] = useState('none');
    const [ anchorEl, setAnchorEl ] = useState(null);
    const [ editRecord, setEditRecord ] = useState(null);
    const [ svcHistory, setSvcHistory ] = useState([])
    const [width, setWidth] = useState(window.innerWidth);

    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    const displayMobile = isMobile(width);

    useEffect(() => {
        // build svcHistory array by combining and sorting valid & invalid services
        let tempHistory = client.svcHistory.concat(client.invalidSvcs)
        // descending sort by updated date/time if avialable or created date/time
        const svcHistoryTemp = tempHistory.sort((a, b) => {
            const x = (a.svcUpdatedDT) ? dayjs(a.svcUpdatedDT) : dayjs(a.svcDT)
            const y = (b.svcUpdatedDT) ? dayjs(b.svcUpdatedDT) : dayjs(b.svcDT)
            return y.diff(x)
        })
        setSvcHistory(svcHistoryTemp)
    }, [ client.svcHistory, client.invalidSvcs ])
    
    function handleSelectedService(event, newSelSvc) {
        setSelectedService(newSelSvc)
        const record = svcHistory.filter(function( obj ) {
            return obj.svcId === newSelSvc.svcId
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

        // console.log("EDIT MODE", newEditMode )

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

    if (isEmpty(svcHistory)) return null

    const menuOpen = Boolean(anchorEl);
    const id = menuOpen ? 'simple-popper' : undefined;
    const validRow = { color: 'text.primary' }
    const invalidRow = { color: 'secondary.main', cursor:'default' }

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
        <TableContainer sx={ displayMobile ? {} : {
            mx: 'auto',
            mt: 2,
            width: 'calc(100% - 32px)',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
        }}> 
            <Table >
            {!displayMobile ? <TableHead>
                <TableRow>
                    <TableCell>Updated <br/> Served</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Client Status</TableCell>
                    <TableCell>Homeless</TableCell>
                    <TableCell># Items</TableCell>
                    <TableCell># Adults</TableCell>
                    <TableCell># Children</TableCell>
                    <TableCell># Individuals</TableCell>
                    <TableCell># Seniors</TableCell>
                    <TableCell>Serviced By</TableCell>
                </TableRow>
            </TableHead> : null}
            {!displayMobile ? <HistoryBodyRow svcHistory = { svcHistory } selectedService = { selectedService } handleSelectedService = { handleSelectedService } /> : 
                <HistoryBodyCard svcHistory = { svcHistory } selectedService = { selectedService } handleSelectedService = { handleSelectedService } />}
            </Table>
        </TableContainer>
        { editMode === 'edit' &&
                <HistoryFormDialog client = { client } editMode={ editMode } updateClient = {props.updateClient}
                handleEditMode={ handleEditMode } editRecord={ editRecord } handleEditRecord={ handleEditRecord } />
            }
        </Fragment>
    )
}