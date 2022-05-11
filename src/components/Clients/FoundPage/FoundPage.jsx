import React from 'react';
import PropTypes from 'prop-types';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import moment from 'moment'

FoundPage.propTypes = {
    clientsFound: PropTypes.array.isRequired,
    client: PropTypes.object.isRequired, changeClient: PropTypes.func.isRequired,
    updateClientsURL: PropTypes.func.isRequired
}

export default function FoundPage(props) {
    const { clientsFound, client, updateClientsURL, changeClient } = props
    let clientId = isEmpty(client) ? null : client.clientId

    function handleSelectedClient(event, newClientId) {
        if (clientId !== newClientId) {
            const newClient = clientsFound.filter(obj => obj.clientId == newClientId)
            changeClient(newClient[0])
            updateClientsURL(newClient[0].clientId, 1);
        }
    }
  
    return (
        <Box mt={ 7 }>
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
                    { clientsFound.map((row) => (
                        <TableRow 
                            key={row.clientId} 
                            onClick= { (event) => handleSelectedClient(event, row.clientId)}
                            selected= { row.clientId == clientId }
                            >
                            <TableCell component="th" scope="row">{row.clientId}</TableCell>
                            <TableCell align="center">{row.givenName}</TableCell>
                            <TableCell align="center">{row.familyName}</TableCell>
                            <TableCell align="center">{moment(row.dob).format("MMM DD, YYYY")}</TableCell>
                            <TableCell align="center">{row.street}</TableCell>
                        </TableRow>
                        ))}
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

}