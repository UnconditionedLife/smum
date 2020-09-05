import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { isEmpty } from '../js/Utils.js';

export default function FoundPage(props) {
    const clientsFound = props.clientsFound
    const client = props.client
    const handleClientChange = props.handleClientChange

    let clientId = null
    if (client !== undefined && !isEmpty(client)) {
        clientId = client.clientId
    } 

    function handleSelectedClient(event, newClientId) {
        if (clientId !== newClientId) {
            const newClient = clientsFound.filter(obj => obj.clientId == newClientId)
            handleClientChange(newClient[0])
        }
    };

    if (!isEmpty(clientsFound)){
        return (
            <Box mt={ 4 }>
                <TableContainer > 
                    <Table >
                    <TableHead>
                        <TableRow>
                        <TableCell>ID #</TableCell>
                        <TableCell align="center">Given Name</TableCell>
                        <TableCell align="center">Family Name</TableCell>
                        <TableCell align="center">DOB</TableCell>
                        <TableCell align="center">Street Address</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clientData.map((row) => (
                        <TableRow 
                            key={row.clientId} 
                            onClick= { (event) => handleSelectedClient(event, row.clientId)}
                            selected= { row.clientId == clientId }
                            >
                            <TableCell component="th" scope="row">{row.clientId}</TableCell>
                            <TableCell align="center">{row.givenName}</TableCell>
                            <TableCell align="center">{row.familyName}</TableCell>
                            <TableCell align="center">{row.dob}</TableCell>
                            <TableCell align="center">{row.street}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    } else {
        return null
    }  
};