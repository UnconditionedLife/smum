import React, { Fragment, useState } from "react";
import PropTypes from 'prop-types';
import { Box, Chip, Typography } from '@mui/material';
import { House } from '@mui/icons-material';
// import { HeaderDateTime } from '..';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import dayjs from 'dayjs';
import { calcFamilyCounts } from '../../System/js/Clients/ClientUtils';

HeaderTitle.propTypes = {
    client: PropTypes.object.isRequired,
    clientsFound: PropTypes.array.isRequired,
}

export default function HeaderTitle(props) {
    const client = props.client
    const clientsFound = props.clientsFound
    const todaysDate = dayjs().format("dddd, MMM DD YYYY")
    const [ headerMessage, setHeaderMessage ] = useState(todaysDate)
    let titleType = 'nonclient';
    const familyCounts = calcFamilyCounts(client)

    if (!isEmpty(client)) {
        titleType = 'client'
        const parsed = parseInt(client.clientId)
        if (parsed !== headerMessage) setHeaderMessage(parsed)
    } else {
        titleType = 'nonclient'
        if (client === {}) {
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
            { titleType === 'nonclient' &&   
                <Box display='flex' minHeight='100%' width={ 1 } pt={ .5 } justifyContent='center'>
                    <Typography color='primary' align='center' variant='h5' noWrap >
                        { headerMessage }
                    </Typography>
                </Box>              
            }
            {/* { headerState === 'new-client' && { "NEW CLIENT" } } //TODO WIRE TO NEW CLIENT PAGE */}
            { titleType === 'client' && 
                <Box mt={ .75 } display='flex' flexDirection='row' height='44px' justifyContent='center' alignContent='center' flexWrap="wrap">
                    <Chip icon={ <House /> } label={ client.clientId } color="primary"
                        style={{ width:'118px', fontSize:'x-large', justifyContent:'left', marginRight: '12px' }} /> 
                    <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }} mt={ 0 }>
                        <Typography color='primary' variant='h6' noWrap>
                           <b>{ client.givenName } { client.familyName }</b>
                        </Typography>
                        <Typography color='primary' variant='subtitle2' noWrap>
                        &nbsp;&nbsp;(Fam: {familyCounts.totalSize}, Kids: {familyCounts.totalChildren})
                        </Typography>
                    </Box>
                </Box> 
            }
        </Fragment>   
    )
}