import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { getLastServedFood } from '../../System/js/Clients/Services.js';
import moment from 'moment';

HistoryHeader.propTypes = {
    client: PropTypes.object.isRequired, // current client record
}

export default function HistoryHeader(props) {
    const client = props.client;
    const [ lastServedFood, setlastServedFood ] = useState("")

    useEffect(() => {
        // Used to update a temp field in client to display last served food in header
        const temp = getLastServedFood(client)
        if (lastServedFood !== temp) {
            if (temp !== "Never") {
                setlastServedFood(moment(temp).format("MMM DD, YYYY - h:mm a"))
            }
        }
    }, [ JSON.stringify(client.svcHistory) ])

    return (
        <TableContainer key={ lastServedFood }> 
            <Table >
            <TableHead>
                <TableRow>
                    <TableCell align="center">Created</TableCell>
                    <TableCell align="center">Updated</TableCell>
                    <TableCell align="center">First Seen</TableCell>
                    <TableCell align="center">Last Served</TableCell>
                    <TableCell align="center">Last ID Check</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell align="center">{ moment(client.createdDateTime).format("MMM DD, YYYY - h:mm a") }</TableCell>
                    <TableCell align="center">{ moment(client.updatedDateTime).format("MMM DD, YYYY - h:mm a") }</TableCell>
                    <TableCell align="center">{ moment(client.firstSeenDate).format("MMM DD, YYYY") }</TableCell>
                    <TableCell align="center">{ lastServedFood }</TableCell>
                    <TableCell align="center">{ moment(client.familyIdCheckedDate).format("MMM DD, YYYY") }</TableCell>
                </TableRow>
            </TableBody>
            </Table>
        </TableContainer>
    )
}