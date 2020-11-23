import React from "react";
import { Add, Pageview, RoomService, House, History } from '@material-ui/icons';
import { AppBar, Box, Tab, Tabs, Tooltip } from '@material-ui/core';
import { Fab } from '../../System';
import { HeaderTitle } from '../../Clients';

export default function clientsHeader(props) {
    const client = props.client
    const clientsFound = props.clientsFound
    const handleIsNewClientChange = props.handleIsNewClientChange
    const selectedTab = props.selectedTab
    const updateURL = props.updateURL

    function handleNewClient() {
       handleIsNewClientChange(true)
    }
    
    return (
        <Box width={ 1 } display="flex" flexWrap="wrap-reverse">
            <AppBar position="static" color="default" style={{ display:'flex', width: '100%', maxHeight:'72px',
                justifyContent: 'space-between', alignItems: 'center', flexDirection:'row', overflow: 'hidden', zIndex:'1075' }}>
                {/* <Box display='flex'> */}
                <Box ml={ 3 } display='flex' >
                        <HeaderTitle client={ client } clientsFound={ clientsFound } selectedTab = { selectedTab } />
                </Box>
                <Tabs
                    value={selectedTab}
                    onChange={(event, newValue) => {updateURL(client.clientId, newValue);}}
                    indicatorColor="secondary"
                    textColor="primary"
                    selectionFollowsFocus
                    centered
                    style={{ justifyContent: 'space-between' }}
                >
                    <Tab icon={<Pageview />} label="Found" />
                    <Tab icon={<RoomService />} label="Services" />
                    <Tab icon={<House />} label="Client" />
                    <Tab icon={<History />} label="History" />
                </Tabs>
                <Box display='flex' width='100px' mt={ 0 } mr={ 2 } justifyContent='flex-end'>
                    <Tooltip title= 'Add Client'>
                        <Fab  float='right' onClick={() => handleNewClient()} size='medium' color='default' >
                            <Add />
                        </Fab> 
                    </Tooltip>
                </Box>
            </AppBar>
        </Box>
    )
}