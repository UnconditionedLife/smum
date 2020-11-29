import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { isEmpty } from '../../System/js/Utils.js';


const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        marginTop: 24,
        marginBottom: 24,
        padding: 0,
        flexDirection:'row'
    },
}))


HistoryHeader.propTypes = {
    client: PropTypes.object.isRequired, // current client record
}

export default function HistoryHeader(props) {
    const client = props.client;

    const classes = useStyles();
    const headerData = [
        { label: "Profile Created", value: window.moment(client.createdDateTime).format("MMM DD, YYYY - h:mm a") },
        { label: "Profile Updated", value: window.moment(client.updatedDateTime).format("MMM DD, YYYY - h:mm a") },
        { label: "First Seen", value: window.moment(client.firstSeenDate).format("MMM DD, YYYY") },
        { label: "Last Served", value: window.moment(client.lastServedFoodDateTime).format("MMM DD, YYYY - h:mm a") },
        { label: "Last ID Check", value: window.moment(client.familyIdCheckedDate).format("MMM DD, YYYY") }
    ]

    const intViewportWidth = window.clientWidth;


    window.utilSetLastServedFood()

    if (!isEmpty(client)) {
        return (
            <Fragment>
                {/* <Box className={ classes.container}>
                { headerData.map((item) => (
                    <Box key={ item.label } display='flex' flexDirection='column'>
                        <Box p={ 2.5 } bgcolor='primary.main' justifyContent='center' alignItems='center' textAlign='center'><strong>{ item.label }</strong></Box>
                        <Box p={ 2.5 } justifyContent='center' alignItems='center' textAlign='center'>{ item.value }</Box>
                    </Box>
                ))}
                </Box> */}
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
                        <TableCell align="center">{ window.moment(client.createdDateTime).format("MMM DD, YYYY - h:mm a") }</TableCell>
                        <TableCell align="center">{ window.moment(client.updatedDateTime).format("MMM DD, YYYY - h:mm a") }</TableCell>
                        <TableCell align="center">{ window.moment(client.firstSeenDate).format("MMM DD, YYYY") }</TableCell>
                        <TableCell align="center">{ window.moment(client.lastServedFoodDateTime).format("MMM DD, YYYY - h:mm a") }</TableCell>
                        <TableCell align="center">{ window.moment(client.familyIdCheckedDate).format("MMM DD, YYYY") }</TableCell>
                    </TableRow>
                </TableBody>
                </Table>
            </TableContainer>
            </Fragment>
        );
    } else {
        return null
    }
}