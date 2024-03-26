import React from 'react';
import { AppBar, Box, Tab, Tabs, Typography } from '@mui/material';
import { useHistory, useLocation, matchPath } from "react-router-dom";
import { RoomService, AccountBox, Assessment, DateRange, SettingsApplications, BugReport } from '@mui/icons-material';
import { AllUsersPage, CalendarPage, ReportsPage, ErrorPage,
            ServiceTypePage, SettingsPage } from '..';
import { globalMsgFunc, isAdmin, navigationAllowed } from '../../System/js/Database';
import UseWindowSize from '../../System/Hooks/UseWindowSize.jsx';

const tabURL = [
    "/admin/reports",
    "/admin/calendar",
    "/admin/servicetypes",
    "/admin/users",
    "/admin/settings",
    "/admin/error"
];

export default function AdminMain(props) {
    const history = useHistory();
    const route = useLocation();
    const url = route.pathname;

    function sectionFromURL(url) {   
        for (let i = 0; i < tabURL.length; i++) {
            if (matchPath(url, { path: tabURL[i], exact: true, strict: false }))
                return i;
        }
        return -1;
    }
    
    function selectTab(newTab) {
        if (navigationAllowed()) {
            history.push(tabURL[newTab]);
        }
    }
    
    if (!isAdmin()) {
        // Does not work because either globalMsgFunc or the "beep" sound is not initialized yet.
        // globalMsgFunc('error', "This function is only available to administrative users.");
        return <Typography>Not an admin user</Typography>
    }

    let navLabels = [ 'Reports', 'Calendar', 'Service Types', 'Users', 'Settings', 'Errors' ];
    if (UseWindowSize().width < 450) 
        navLabels = [ '','','','','' ]

    let selectedTab = sectionFromURL(url);
    if (selectedTab < 0) {
        // State change cannot happen from within the render context.
        setTimeout(() => { history.push(tabURL[0]); }, 0);
        return null;
    }

    return (
        <Box width="100%">
            <Box width={ 1 } display="flex" flexWrap="wrap-reverse">
                <AppBar position="static" color="default" style={{ display:'flex', width: '100%', maxHeight:'60px',
                    justifyContent: 'center', alignItems: 'center', flexDirection:'row', overflow: 'hidden', zIndex:'1075' }}>                    
                    <Tabs
                        value={ selectedTab }
                        onChange={(event, newValue) => { selectTab(newValue) }}
                        indicatorColor="secondary"
                        textColor="primary"
                        centered                    
                        selectionFollowsFocus
                        style={{ justifyContent: 'space-between' }}
                    >
                        <Tab icon={<Assessment/>} label={ navLabels[0] } style={{  minWidth:'62px' }} />
                        <Tab icon={<DateRange/>} label={ navLabels[1] } style={{  minWidth:'62px' }} />
                        <Tab icon={<RoomService/>} label={ navLabels[2] } style={{  minWidth:'62px' }} />
                        <Tab icon={<AccountBox/>} label={ navLabels[3] } style={{  minWidth:'62px' }} />
                        <Tab icon={<SettingsApplications/>} label={ navLabels[4] } style={{  minWidth:'62px' }} />
                        <Tab icon={<BugReport/>} label={ navLabels[5] } style={{  minWidth:'62px' }} />
                    </Tabs>
                </AppBar>
            </Box>
            <Box maxWidth="100%" display="flex" justifyContent="center" mt={0} pt={0}>
                <Box maxWidth='lg' mt={0} pt={2}>
                    {selectedTab === 0 && <ReportsPage />}
                    {selectedTab === 1 && <CalendarPage />}
                    {selectedTab === 2 && <ServiceTypePage />}
                    {selectedTab === 3 && <AllUsersPage />}
                    {selectedTab === 4 && <SettingsPage />}
                    {selectedTab === 5 && <ErrorPage />}
                </Box>
            </Box>
        </Box>
    );
}