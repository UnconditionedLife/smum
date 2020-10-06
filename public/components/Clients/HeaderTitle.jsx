import React, { Fragment, useState } from "react";
import PropTypes from 'prop-types';
import { Box, Typography } from '@material-ui/core';
import { HeaderDateTime } from '../Clients';
import { isEmpty } from '../System/js/Utils.js';

export default function HeaderTitle(props) {
    const client = props.client
    const isNewClient = props.isNewClient
    const clientsFound = props.clientsFound
    const todaysDate = window.moment().format("dddd, MMM DD YYYY")
    const [ headerMessage, setHeaderMessage ] = useState(todaysDate)
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
                titleType = 'nosearch'
                if (headerMessage !== todaysDate ) setHeaderMessage(todaysDate);
            }
        }
    }

    return (
        <Fragment>
            { titleType === 'nosearch' &&   
                <Box display='flex' minHeight='100%' width={ 1 } pt={ .5 } justifyContent='center'>
                    <HeaderDateTime color='primary' size='h6' />
                </Box>              
            }
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
                    <Box height='48px' p={ 1 } pr={ 1 } pt={ 1.125 } mt={ -.5 } ml={ -.5 } 
                        bgcolor='primary.main' borderRadius={ 6 } >
                        <Typography color='textPrimary' align='center' variant='h6' noWrap>
                            <b>{ client.clientId }</b>
                        </Typography>
                    </Box>
                    <Box ml={ 2 } mt={ -1.125 }>
                        <HeaderDateTime color='primary' size='subtitle1' />
                        <Typography color='primary' variant='h6' noWrap>
                           <b>{ client.givenName } { client.familyName }</b>
                        </Typography>
                    </Box>
                </Box> 
            }
        </Fragment>   
    )
}

HeaderTitle.propTypes = {
    client: PropTypes.object.isRequired,
    isNewClient: PropTypes.object.isRequired,
    clientsFound: PropTypes.object.isRequired,
  }