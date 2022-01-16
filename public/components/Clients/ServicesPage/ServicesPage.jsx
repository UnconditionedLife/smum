import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@material-ui/core';
import { Card } from '../../System';
import { addServiceAsync } from '../../System/js/Clients/Services'
import { LastServed, PrimaryButtons, SecondaryButtons, ServiceNotes } from '..';
import { removeSvcAsync } from '../../System/js/Clients/History';
import { globalMsgFunc } from '../../System/js/Database';

ServicesPage.propTypes = {
    client: PropTypes.object.isRequired, updateClient: PropTypes.func.isRequired,
    svcsRendered: PropTypes.object,
    updateSvcsRendered: PropTypes.func,
    showAlert: PropTypes.func.isRequired,
}

export default function ServicesPage(props) {
    const client = props.client
    const updateClient = props.updateClient
    const [ svcHistory, setSvcHistory ] = useState(null)

    useEffect(() => {
        if (JSON.stringify(client.svcHistory) !== svcHistory) {
            setSvcHistory(JSON.stringify(client.svcHistory))
        }
    },[ svcHistory ])

    function handleAddSvc(serviceTypeId){        
        addServiceAsync( client, serviceTypeId )
            .then((updatedClient) => {
                if (updatedClient !== null){
                    // updates svcHistory
                    updateClient(updatedClient)
                } else {   
                    globalMsgFunc('error', "FAILED to add service")
                }
            })
    }

    function handleUndoSvc(svc){ 
        removeSvcAsync( client, svc )
            .then((updatedClient) => {                
                if (updatedClient !== null){
                    // updates svcHistory
                    updateClient(updatedClient)
                } else {   
                    globalMsgFunc('error', "FAILED to remove service")
                }
            })
    }

    return (
        <Box key={ svcHistory } display="flex" justifyContent="space-around" flexWrap="wrap">
            <Box width='100%' maxWidth="800px" mt={ 5 } pt={ 0 }>
                <Card width='100%' height='80px'>
                    <Box width='100%' display='flex' p={ 2.5 } justifyContent='center' alignItems='center' flexDirection='column'>
                        <Typography variant='h6' color='textPrimary' align='center' noWrap>AVAILABLE SERVICES</Typography>
                        <LastServed { ...props }/>
                    </Box>
                </Card>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <PrimaryButtons { ...props } handleAddSvc={ handleAddSvc } handleUndoSvc={ handleUndoSvc } />
                        {/* clickedButton={ clickedButton } */}
                </Box>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <SecondaryButtons { ...props } handleAddSvc={ handleAddSvc } handleUndoSvc={ handleUndoSvc } />
                </Box>
            </Box>
            <Box maxWidth="500px" mt={ 5 } justifyContent="center">
                <ServiceNotes { ...props } />
            </Box>
        </Box>
    )
}