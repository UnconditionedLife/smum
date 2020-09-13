import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Add, Pageview, RoomService, House, History } from '@material-ui/icons';
import { AppBar, Box, CardContent, Fab, Tab, Tabs, Tooltip, Typography } from '@material-ui/core';
import { Card } from '../System';
import { HeaderTitle } from '../Clients';

const useStyles = makeStyles((theme) => ({
    card: {
        backgroundColor: "#f5f5f5",
    },
    sectionName: {
        gridColumn: 2,
        gridRow: 1,
        fontSize: '40px',
        fontWeight: 'bold',
        backgroundColor: "#f5f5f5",
        color: theme.palette.primary.light,
        textAlign: 'center',
        lineHeight: '56px'
    },
    roundButton: {
        margingTop: '-28px',
        marginRight: '15px',
        marginBottom: '10px'
    }
}));

export default function clientsHeader(props) {
    const client = props.client
    const clientsFound = props.clientsFound
    const isNewClient = props.isNewClient
    const handleIsNewClientChange = props.handleIsNewClientChange
    const selectedTab = props.selectedTab
    const handleTabChange = props.handleTabChange
    const classes = useStyles();

    function handleNewClient() {
        handleIsNewClientChange(true)
    }

    return (
        <Box width={ 1 } display="flex" >
            <Box flexGrow="1"  mr={ 1 }>
                <Card height="72px" width={ 1 } elevation={ 4 } className={ classes.card } >
                    <CardContent>
                        <HeaderTitle 
                            client={ client }
                            clientsFound={ clientsFound }
                            handleIsNewClientChange={ handleIsNewClientChange }
                            isNewClient = { isNewClient }
                            selectedTab = { selectedTab }
                        />
                    </CardContent>
                </Card>
            </Box>
            <Box flexGrow="2"  mr={ 1 }>
                <AppBar position="static" color="default">
                    <Tabs
                    value={selectedTab}
                    onChange= { handleTabChange }
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
            <Box flexGrow="1">
                <Card height="72px" elevation={ 4 } className={ classes.sectionName } >
                    <CardContent>
                        <Box width={ 1 } display='flex' justifyContent='center'>
                            <Tooltip title= 'Add Client'>
                                <Fab onClick={() => handleNewClient()}  size="small" className={ classes.roundButton } color='default' >
                                    <Add />
                                </Fab>
                            </Tooltip>
                            <Typography color='primary' align='center' variant='h4' noWrap>
                                <b>Clients</b>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
};