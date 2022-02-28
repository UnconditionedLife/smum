import React, { useState, useEffect } from 'react';
import { AppBar, Box, Tab, Tabs } from '@material-ui/core';
import { RoomService, AccountBox, Assessment, DateRange, SettingsApplications } from '@material-ui/icons';
import { AllUsersPage, CalendarPage, ReportsPage, 
            ServiceTypePage, SettingsPage } from '..';
import { getSession, navigationAllowed } from '../../System/js/Database';
import { isEmpty } from '../../System/js/GlobalUtils';
import UseWindowSize from '../../System/Hooks/UseWindowSize.jsx';

AdminMain.propTypes = {

}

export default function AdminMain() {
    const [ selectedTab, setSelectedTab ] = useState(0);
    const [ session, setSession ] = useState(null)

    useEffect(() => {
        const sessionVar = isEmpty(getSession()) ? null : getSession()
        setSession(sessionVar)
    })

    const handleChange = (event, newValue) => {
        if (navigationAllowed())
            setSelectedTab(newValue);
    };

    let navLabels = [ 'Reports', 'Calendar', 'Service Types', 'Users', 'Settings' ]
    if (UseWindowSize().width < 450) navLabels = [ '','','','' ]

    if (session === null) return null // do not render admin if session is not set

    return (
        <Box  width={ 1 } display="flex" flexWrap="wrap" style={{ justifyContent: 'center' }}>
            <AppBar position="static" color="default" style={{ display:'flex', width: '100%', maxHeight:'60px',
                    justifyContent: 'center', alignItems: 'center', flexDirection:'row', overflow: 'hidden', zIndex:'1075' }}>
                <Tabs
                value={selectedTab}
                onChange={handleChange}
                indicatorColor="secondary"
                textColor="primary"
                centered
                selectionFollowsFocus
                style={{ justifyContent: 'space-between' }}
                >
                    <Tab icon={<Assessment/>} label={ navLabels[0] } />
                    <Tab icon={<DateRange/>} label={ navLabels[1] } />
                    <Tab icon={<RoomService/>} label={ navLabels[2] } />
                    <Tab icon={<AccountBox/>} label={ navLabels[3] } />
                    <Tab icon={<SettingsApplications/>} label={ navLabels[4] } />
                </Tabs>
            </AppBar>
            {selectedTab === 0 && <ReportsPage />}
            {selectedTab === 1 && <CalendarPage />}
            {selectedTab === 2 && <ServiceTypePage />}
            {selectedTab === 3 && <AllUsersPage />}
            {selectedTab === 4 && <SettingsPage />}
        </Box>
    );
}