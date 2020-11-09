import React from "react";
import { Add, Pageview, RoomService, House, History } from '@material-ui/icons';
import { AppBar, Box, CardContent, Tab, Tabs, Tooltip } from '@material-ui/core';
import { Card, Fab, Typography } from '../../System';
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
            <Box flexGrow="1"  m={ .5 }>
                <Card height="72px" width={ 1 } m={ 0 } bgcolor="#f5f5f5" >
                    <CardContent>
                        <HeaderTitle 
                            client={ client }
                            clientsFound={ clientsFound }
                            selectedTab = { selectedTab }
                        />
                    </CardContent>
                </Card>
            </Box>
            <Box flexGrow="2" m={ .5 }>
                <AppBar position="static" color="default">
                    <Tabs
                        value={selectedTab}
                        onChange={(event, newValue) => {updateURL(client.clientId, newValue);}}
                        indicatorColor="secondary"
                        textColor="primary"
                        selectionFollowsFocus
                        centered
                    >
                    <Tab icon={<Pageview />} label="Found" />
                    <Tab icon={<RoomService />} label="Services" />
                    <Tab icon={<House />} label="Client" />
                    <Tab icon={<History />} label="History" />
                    </Tabs>
                </AppBar>
            </Box>
            <Box flexGrow="1" m={ .5 }>
                <Card height="72px" elevation={ 4 } m={ 0 } bgcolor="#f5f5f5" >
                    <CardContent>
                        <Box width={ 1 } display='flex' justifyContent='flex-end'>
                            <Typography color='primary' align='center' variant='h4' noWrap>
                                <b>Clients</b>&nbsp;&nbsp;
                            </Typography>
                            <Tooltip title= 'Add Client'>
                                <Fab onClick={() => handleNewClient()} size='small' color='default' >
                                    <Add />
                                </Fab>
                            </Tooltip>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}