import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@material-ui/core';
import { Card } from '../../System';
import { addServiceAsync } from '../../System/js/Clients/Services'
import { LastServed, PrimaryButtons, SecondaryButtons, ServiceNotes } from '..';
import { removeSvcAsync } from '../../System/js/Clients/History';
import { globalMsgFunc } from '../../System/js/Database';
import { HeaderTitle } from '..';

ServicesPage.propTypes = {
    client: PropTypes.object.isRequired, 
    updateClient: PropTypes.func.isRequired,
    svcsRendered: PropTypes.object,
    updateSvcsRendered: PropTypes.func,
    clientsFound: PropTypes.array,
    selectedTab: PropTypes.string,
    showAlert: PropTypes.func.isRequired,
}

export default function ServicesPage(props) {
    const { client, updateClient, clientsFound, selectedTab } = props
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
            <Box width='100%' maxWidth="800px" mt={ 4 } pt={ 0 }>
                <Box p={ 1 } pl={ 2 } pr={ 2 } display='flex' justifyContent="space-between" flexWrap="wrap" 
                    style={{ borderRadius: "6px", backgroundColor:"#F3F3F3" }}>
                    <HeaderTitle client={ client } clientsFound={ clientsFound } selectedTab = { selectedTab } />
                    <LastServed { ...props }/>
                </Box>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <PrimaryButtons { ...props } handleAddSvc={ handleAddSvc } handleUndoSvc={ handleUndoSvc } />
                </Box>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <SecondaryButtons { ...props } handleAddSvc={ handleAddSvc } handleUndoSvc={ handleUndoSvc } />
                </Box>
            </Box>
            <Box maxWidth="500px" mt={ 3 } justifyContent="center">
                <ServiceNotes { ...props } />
            </Box>
        </Box>
    )
}