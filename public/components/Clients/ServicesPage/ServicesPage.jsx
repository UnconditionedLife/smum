import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@material-ui/core';
import { Card } from '../../System';
import { addServiceAsync } from '../../System/js/Clients/Services'
import { LastServed, PrimaryButtons, SecondaryButtons, ServiceNotes } from '../';


ServicesPage.propTypes = {
    client: PropTypes.object.isRequired, updateClient: PropTypes.func.isRequired,
    svcsRendered: PropTypes.object,
    updateSvcsRendered: PropTypes.func,
    showAlert: PropTypes.func.isRequired,
}

export default function ServicesPage(props) {
    const client = props.client
    const updateClient = props.updateClient
    const [ clickedButton, setClickedButton ] = useState(null)

    function handleAddSvc(serviceTypeId, serviceCategory, svcButtons){        
        setClickedButton(serviceTypeId)
        addServiceAsync( { client: client, serviceTypeId: serviceTypeId, 
            serviceCategory: serviceCategory, svcButtons: svcButtons })
            .then((updatedClient) => {
//  console.log("UPDATED CLIENT - Button", updatedClient)
                updateClient(updatedClient)
            })
    }

    return (
        <Box display="flex" justifyContent="space-around" flexWrap="wrap">
            <Box width='100%' maxWidth="800px" mt={ 5 } pt={ 0 }>
                <Card width='100%' height='80px'>
                    <Box width='100%' display='flex' p={ 2.5 } justifyContent='center' alignItems='center' flexDirection='column'>
                        <Typography variant='h6' color='textPrimary' align='center' noWrap>AVAILABLE SERVICES</Typography>
                        <LastServed { ...props }/>
                    </Box>
                </Card>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <PrimaryButtons { ...props } handleAddSvc={ handleAddSvc } clickedButton={ clickedButton }/>
                </Box>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <SecondaryButtons { ...props } handleAddSvc={ handleAddSvc } clickedButton={ clickedButton } />
                </Box>
            </Box>
            <Box maxWidth="500px" mt={ 5 } justifyContent="center">
                <ServiceNotes { ...props } />
            </Box>
        </Box>
    )
}