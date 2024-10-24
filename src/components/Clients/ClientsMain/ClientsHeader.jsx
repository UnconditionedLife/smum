import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import { AppBar, Box, Tab, Tabs, Tooltip, Snackbar } from '@mui/material';
import { Add, Pageview, RoomService, House, History } from '@mui/icons-material';
import { Fab } from '../../System';
import { navigationAllowed } from '../../System/js/Database';
import UseWindowSize from '../../System/Hooks/UseWindowSize.jsx';

ClientsHeader.propTypes = {
    clientsFound: PropTypes.array.isRequired,
    client: PropTypes.object.isRequired, 
    isNewClientChange: PropTypes.func.isRequired,
    updateClientsURL: PropTypes.func.isRequired,
    selectedTab: PropTypes.number.isRequired,
    showFound: PropTypes.bool.isRequired,
    showServices: PropTypes.bool.isRequired,
    showClient: PropTypes.bool.isRequired,
}

export default function ClientsHeader(props) {
    const { client, isNewClientChange, selectedTab, 
        updateClientsURL, showFound, showServices, showClient } = props

    function handleNewClient() {
        if (navigationAllowed()) {
            isNewClientChange(true)
        }
    }

    let navLabels = [ 'Found', 'Services', 'Client', 'History' ]
    if (UseWindowSize().width < 400) navLabels = [ '','','','' ]

    return (
        <Fragment>
            
            <Snackbar  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={ true }>
                <Tooltip title= 'Add Client' placement="left-end">
                    <Fab  float='right' onClick={() => handleNewClient()} size='small' color='default' ><Add /></Fab> 
                </Tooltip>
            </Snackbar>

            <Box mt={ -2 } width={ 1 } display="flex" flexWrap="wrap-reverse">
                <AppBar position="static" color="default" style={{ display:'flex', width: '100%', maxHeight:'60px',
                    justifyContent: 'center', alignItems: 'center', flexDirection:'row', overflow: 'hidden', zIndex:'1075' }}>
                    <Tabs
                        value={ selectedTab }
                        onChange={(event, newValue) => { updateClientsURL(client.clientId, newValue) }}
                        indicatorColor="secondary"
                        textColor="primary"
                        selectionFollowsFocus
                        centered
                        style={{ justifyContent: 'space-between' }}
                    >
                        <Tab icon={<Pageview />} disabled={ !showFound } label={ navLabels[0] } style={{  minWidth:'64px' }} />
                        <Tab icon={<RoomService />} disabled={ !showServices } label={ navLabels[1] } style={{  minWidth:'64px' }} />
                        <Tab icon={<House />} disabled={ !showClient } label={ navLabels[2] } style={{  minWidth:'64px' }} />
                        <Tab icon={<History />} disabled={ !showClient } label={ navLabels[3] } style={{  minWidth:'64px' }} />
                    </Tabs>
                </AppBar>
            </Box>
        </Fragment>
    )
}