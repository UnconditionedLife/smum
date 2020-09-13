import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { isEmpty } from '../System/js/Utils.js';

export default function HistoryHeader(props) {
    const client = props.client;

    window.utilSetLastServedFood()

    if (!isEmpty(client)) {
        return (
            <TableContainer > 
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
                        <TableCell align="center">{ window.moment(client.createdDateTime).format("MMM Do, YYYY  |  LT") }</TableCell>
                        <TableCell align="center">{ window.moment(client.updatedDateTime).format("MMM Do, YYYY  |  LT") }</TableCell>
                        <TableCell align="center">{ window.moment(client.firstSeenDate).format("MMM Do, YYYY") }</TableCell>
                        <TableCell align="center">{ window.moment(client.lastServedFoodDateTime).format("MMM Do, YYYY  |  LT") }</TableCell>
                        <TableCell align="center">{ window.moment(client.familyIdCheckedDate).format("MMM Do, YYYY") }</TableCell>
                    </TableRow>
                </TableBody>
                </Table>
            </TableContainer>
        );
    } else {
        return null
    }
};