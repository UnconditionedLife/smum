import React, { useState, Fragment } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { HistoryButtons } from '../Clients';
import { isEmpty } from '../System/js/Utils';
import { getServiceHistory } from '../System/js/Clients';

export default function HistoryHeader(props) {
    const client = props.client;
    const [selectedService, setSelectedService] = useState(null);
    const [editMode, setEditMode] = useState(null);
    const [clientHistory, setClientHistory] = useState(getServiceHistory());

    //const clientHistory = getServiceHistory()

    function handleSelectedService(event, newServiceId) {
        setSelectedService(newServiceId)
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

    console.log(clientHistory)

    if (!isEmpty(clientHistory)) {
        return (
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
                    {clientHistory.map((row) => (
                        <Fragment>
                        <TableRow 
                            key={row.serviceId}
                            onClick= { (event) => handleSelectedService(event, row.serviceId)}
                            selected= { row.serviceId == selectedService } >
                            <TableCell align="center">{ window.moment(row.servicedDateTime).format("MMM Do, YYYY  |  LT") }</TableCell>
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
                        { row.serviceId === selectedService &&
                            <TableRow key={ row.serviceId + '- edit' }>
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
        );
    } else {
        return null
    }
};