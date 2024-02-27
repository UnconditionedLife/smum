import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { AppBar, Box, Tab, Tabs } from '@mui/material';
import { RoomService, AccountBox, Assessment, DateRange, SettingsApplications } from '@mui/icons-material';
import { AllUsersPage, CalendarPage, ReportsPage, 
            ServiceTypePage, SettingsPage } from '..';
import { getUserName } from '../../System/js/Database';
import UseWindowSize from '../../System/Hooks/UseWindowSize.jsx';


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
  
  

AdminMain.propTypes = {
    selectedTab: PropTypes.number.isRequired,
    checkAdminURL: PropTypes.func,
    updateAdminURL: PropTypes.func,
    url: PropTypes.string,
}

export default function AdminMain(props) {
    const { selectedTab, checkAdminURL, updateAdminURL, url } = props;
    const classes = useStyles(); // Use the styles defined above
    const size = UseWindowSize();
    const [tabVariant, setTabVariant] = useState('standard');

    useEffect(() => {
        if (getUserName()) checkAdminURL()
    }, [ getUserName, url ])

    useEffect(() => {
        const updateTabVariant = () => {
          setTabVariant(size.width < 400 ? 'scrollable' : 'standard');
        };
        updateTabVariant();
      }, [size.width]);

    let navLabels = [ 'Reports', 'Calendar', 'Service Types', 'Users', 'Settings' ]
    if (UseWindowSize().width < 450) navLabels = [ '','','','' ]

    return (
        <Box  width="100%">
            <Box  width={ 1 } display="flex" flexWrap="wrap-reverse">
                <AppBar position="static" color="default" className={classes.appBar}>
                    <Tabs
                    value={ selectedTab }
                    // onChange={ handleTabChange }
                    onChange={(event, newValue) => { updateAdminURL(newValue) }}
                    indicatorColor="secondary"
                    textColor="primary"
                    variant={tabVariant}
                    centered={tabVariant === 'standard'}
                    scrollButtons="auto"                  
                    selectionFollowsFocus
                    className={classes.tabs}
                    >
                        <Tab icon={<Assessment/>} label={ navLabels[0] } />
                        <Tab icon={<DateRange/>} label={ navLabels[1] } />
                        <Tab icon={<RoomService/>} label={ navLabels[2] } />
                        <Tab icon={<AccountBox/>} label={ navLabels[3] } />
                        <Tab icon={<SettingsApplications/>} label={ navLabels[4] } />
                    </Tabs>
                </AppBar>
            </Box>
            {selectedTab === 0 && <ReportsPage />}
            {selectedTab === 1 && <CalendarPage />}
            {selectedTab === 2 && <ServiceTypePage />}
            {selectedTab === 3 && <AllUsersPage />}
            {selectedTab === 4 && <SettingsPage />}
        </Box>
    );
}