import React, { Fragment, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { AppBar, Box, Tab, Tabs, Tooltip, Snackbar } from '@mui/material';
import { Add, Pageview, RoomService, House, History } from '@mui/icons-material';
import { Fab } from '../../System';
// import { HeaderTitle } from '..';
import { navigationAllowed } from '../../System/js/Database';
import UseWindowSize from '../../System/Hooks/UseWindowSize.jsx';
import makeStyles from '@mui/styles/makeStyles';

// Define your custom styles
const useStyles = makeStyles((theme) => ({
    appBar: {
      display: 'flex',
      width: '100%',
      maxHeight: '60px',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      overflow: 'hidden',
      zIndex: 1075,
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        maxHeight: 'none',
      },
    },
    tabs: {
      justifyContent: 'space-between',
      width: '100%', // Ensure Tabs take full width of AppBar
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'row',
      },
      '& .MuiTab-root': { // Reduce padding or hide text for tabs
        minWidth: '50px', // Reduce minimum width of tabs
        [theme.breakpoints.down('xs')]: {
          paddingLeft: '6px',
          paddingRight: '6px',
          fontSize: '0.7rem', // Reduce font size on very small screens
        },
      },
    },
  }));
  

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
    const { client, clientsFound, isNewClientChange, selectedTab, 
        updateClientsURL, showFound, showServices, showClient } = props
    
    const classes = useStyles(); // Use the styles defined above
    const size = UseWindowSize();
    const [tabVariant, setTabVariant] = useState('standard');

    function handleNewClient() {
        if (navigationAllowed()) {
            isNewClientChange(true)
        }
    }

    useEffect(() => {
        const updateTabVariant = () => {
          setTabVariant(size.width < 350 ? 'scrollable' : 'standard');
        };
        updateTabVariant();
      }, [size.width]);

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
                <AppBar position="static" color="default" className={classes.appBar}>
                    {/* <Box display='flex'> */}
                    {/* <Box ml={ 3 } display='flex' >
                            <HeaderTitle client={ client } clientsFound={ clientsFound } selectedTab = { selectedTab } />
                    </Box> */}
                    <Tabs
                        value={ selectedTab }
                        onChange={(event, newValue) => { updateClientsURL(client.clientId, newValue) }}
                        indicatorColor="secondary"
                        textColor="primary"
                        variant={tabVariant}
                        scrollButtons="auto"                      
                        selectionFollowsFocus
                        centered={tabVariant === 'standard'}
                        className={classes.tabs}
                    >
                        <Tab icon={<Pageview />} disabled={ !showFound } label={ navLabels[0] } />
                        <Tab icon={<RoomService />} disabled={ !showServices } label={ navLabels[1] } />
                        <Tab icon={<House />} disabled={ !showClient } label={ navLabels[2] } />
                        <Tab icon={<History />} disabled={ !showClient } label={ navLabels[3] } />
                    </Tabs>
                </AppBar>
            </Box>
        </Fragment>
    )
}