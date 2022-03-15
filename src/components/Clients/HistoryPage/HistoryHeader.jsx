import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import moment from 'moment';

HistoryHeader.propTypes = {
    client: PropTypes.object.isRequired, // current client record
    lastServedFoodDate: PropTypes.object,
}

export default function HistoryHeader(props) {
    const { client, lastServedFoodDate } = props;

    let lsFoodDate = "** Never **"
    if (lastServedFoodDate !== null) {
        lsFoodDate = moment(lastServedFoodDate).format("MMM DD, YYYY - h:mm a")
    } 
    
    return (
        <TableContainer key={ lastServedFoodDate }> 
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
                    <TableCell align="center">{ lsFoodDate }</TableCell>
                    <TableCell align="center">{ moment(client.familyIdCheckedDate).format("MMM DD, YYYY") }</TableCell>
                </TableRow>
            </TableBody>
            </Table>
        </TableContainer>
    )
}