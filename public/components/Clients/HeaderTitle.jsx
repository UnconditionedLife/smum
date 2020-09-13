import React, { Fragment, useState } from "react";
import { Box, Typography } from '@material-ui/core';
import { isEmpty } from '../System/js/Utils.js';

export default function HeaderTitle(props) {
    const client = props.client
    const isNewClient = props.isNewClient
    const clientsFound = props.clientsFound
    const todaysDate = window.moment().format("dddd, MMM DD YYYY")
    const [ headerMessage, setHeaderMessage ] = useState(todaysDate)
    // const classes = useStyles();
    let titleType = 'nonclient';

    if (!isEmpty(client)) {
        titleType = 'client'
        const parsed = parseInt(client.clientId)
        if (parsed !== headerMessage) setHeaderMessage(parsed)
    } else {
        titleType = 'nonclient'
        if (isNewClient) {
            if (headerMessage !== 'New Client') setHeaderMessage('New Client');
        } else {
            if (!isEmpty(clientsFound)) {
                const count = clientsFound.length;
                if (count === 1) {
                    if (headerMessage !== '1 Client Found') setHeaderMessage('1 Client Found');
                } else {
                    const msg = count + ' Clients Found'
                    if (headerMessage !== msg ) setHeaderMessage(msg);
                }
            } else {
                if (headerMessage !== todaysDate ) setHeaderMessage(todaysDate);
            }
        }
    }; 

    return (
        <Fragment>
            { titleType === 'nonclient' &&   
                <Box display='flex' minHeight='100%' width={ 1 } pt={ .5 } justifyContent='center'>
                    <Typography color='primary' align='center' variant='h5' noWrap >
                        { headerMessage }
                    </Typography>
                </Box>              
            }
            {/* { headerState === 'new-client' && { "NEW CLIENT" } } //TODO WIRE TO NEW CLIENT PAGE */}
            { titleType === 'client' && 
                <Box display='flex' height='72px'>
                    <Box height='56px' p={ 1.125 } mt={ -1 } ml={ -1 } bgcolor='primary.main' borderRadius={ 6 } >
                        <Typography color='textPrimary' align='center' variant='h4' noWrap>
                            <b>{ headerMessage }</b>
                        </Typography>
                    </Box>
                    <Box ml={ 2 } mt={ .75 }>
                        <Typography color='primary' align='center' variant='h5' noWrap>
                           <b>{ client.givenName } { client.familyName }</b>
                        </Typography>
                    </Box>
                </Box> 
            }
        </Fragment>   
    )
};