import React, { useState, useEffect } from 'react';
import { AppBar, Box, Tab, Tabs } from '@material-ui/core';
import { RoomService, AccountBox, Assessment, SettingsApplications, Input } from '@material-ui/icons';
import { AllUsersPage, ImportPage, ReportsPage, 
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

    let navLabels = [ 'Service Types', 'Reports', 'Users', 'Settings', 'Import' ]
    if (UseWindowSize().width < 450) navLabels = [ '','','','' ]

    if (session === null) return null // do not render admin if session is not set

    return (
        // <Box width='100%' p={ 2 } style={{ justifyContent: 'center' }}>
        <Box  width={ 1 } display="flex" flexWrap="wrap">
            {/* <AppBar position="static" color="default"> */}
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
                    <Tab icon={<RoomService/>} label={ navLabels[0] } />
                    <Tab icon={<Assessment/>} label={ navLabels[1] } />
                    <Tab icon={<AccountBox/>} label={ navLabels[2] } />
                    <Tab icon={<SettingsApplications/>} label={ navLabels[3] } />
                    {/* <Tab icon={<Input/>} label={ navLabels[4] } /> */}
                </Tabs>
            </AppBar>
            {selectedTab === 0 && <ServiceTypePage />}
            {selectedTab === 1 && <ReportsPage />}
            {selectedTab === 2 && <AllUsersPage />}
            {selectedTab === 3 && <SettingsPage />}
            {/* {selectedTab === 4 && <ImportPage />} */}
        </Box>
    );
}