import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { utilSetLastServedFood } from '../../System/js/Clients/Services.js';
import moment from 'moment';

HistoryHeader.propTypes = {
    client: PropTypes.object.isRequired, // current client record
}

export default function HistoryHeader(props) {
    const client = props.client;

    useEffect(() => {
        // Used to update a temp field in client to display last served food in header
        utilSetLastServedFood(client)
    })

    return (
        <TableContainer key={ client.lastServedFoodDateTime }> 
            <Table >
            <TableHead>
                <TableRow>
                    <TableCell align="center">Profile Created</TableCell>
                    <TableCell align="center">Profile Updated</TableCell>
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
                    <TableCell align="center">{ moment(client.lastServedFoodDateTime).format("MMM DD, YYYY - h:mm a") }</TableCell>
                    <TableCell align="center">{ moment(client.familyIdCheckedDate).format("MMM DD, YYYY") }</TableCell>
                </TableRow>
            </TableBody>
            </Table>
        </TableContainer>
    )
}