import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import { AppBar, Box, Tab, Tabs, Tooltip, Snackbar } from '@material-ui/core';
import { Add, Pageview, RoomService, House, History } from '@material-ui/icons';
import { Fab } from '../../System';
import { HeaderTitle } from '..';
import { navigationAllowed } from '../../System/js/Database';

ClientsHeader.propTypes = {
    clientsFound: PropTypes.array.isRequired,
    client: PropTypes.object.isRequired, 
    isNewClientChange: PropTypes.func.isRequired,
    updateURL: PropTypes.func.isRequired,
    selectedTab: PropTypes.number.isRequired,
    showFound: PropTypes.bool.isRequired,
    showServices: PropTypes.bool.isRequired,
    showClient: PropTypes.bool.isRequired,
}

export default function ClientsHeader(props) {
    const client = props.client
    const clientsFound = props.clientsFound
    const isNewClientChange = props.isNewClientChange
    const selectedTab = props.selectedTab
    const updateURL = props.updateURL

    function handleNewClient() {
        if (navigationAllowed()) {
            isNewClientChange(true)
        }
    }

    return (
        <Fragment>
        <Snackbar  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={ true }>
            <Tooltip title= 'Add Client' placement="left-end">
                <Fab  float='right' onClick={() => handleNewClient()} size='medium' color='primary' ><Add /></Fab> 
            </Tooltip>
        </Snackbar>
        <Box width={ 1 } display="flex" flexWrap="wrap-reverse">
            <AppBar position="static" color="default" style={{ display:'flex', width: '100%', maxHeight:'72px',
                justifyContent: 'space-between', alignItems: 'center', flexDirection:'row', overflow: 'hidden', zIndex:'1075' }}>
                {/* <Box display='flex'> */}
                <Box ml={ 3 } display='flex' >
                        <HeaderTitle client={ client } clientsFound={ clientsFound } selectedTab = { selectedTab } />
                </Box>
                <Tabs
                    value={selectedTab}
                    onChange={(event, newValue) => { updateURL(client.clientId, newValue) }}
                    indicatorColor="secondary"
                    textColor="primary"
                    selectionFollowsFocus
                    centered
                    style={{ justifyContent: 'space-between' }}
                >
                    <Tab icon={<Pageview />} disabled={ !props.showFound } label="Found" />
                    <Tab icon={<RoomService />} disabled={ !props.showServices } label="Services" />
                    <Tab icon={<House />} disabled={ !props.showClient } label="Client" />
                    <Tab icon={<History />} disabled={ !props.showClient }  label="History" />
                </Tabs>
            </AppBar>
        </Box>
        </Fragment>
    )
}