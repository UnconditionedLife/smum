import React, { useState, useEffect } from 'react';
import { AppBar, Box, Tab, Tabs } from '@material-ui/core';
import { RoomService, AccountBox, AccountCircle, 
            Assessment, SettingsApplications, Input } from '@material-ui/icons';
import { AllUsersPage, ImportPage, ReportsPage, 
            ServiceTypePage, SettingsPage } from '..';
import { getSession } from '../../System/js/Database';
import { isEmpty } from '../../System/js/GlobalUtils';

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
        setSelectedTab(newValue);
    };

    if (session === null) return null // do not render admin if session is not set

    return (
        <Box width='100%' p={ 2 }>
        <AppBar position="static" color="default">
            <Tabs
            value={selectedTab}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="primary"
            selectionFollowsFocus
            >
            <Tab icon={<RoomService/>} label="Service Types" />
            <Tab icon={<Assessment/>} label="Reports" />
            <Tab icon={<AccountBox/>} label="Users" />
            <Tab icon={<SettingsApplications/>} label="Settings" />
            <Tab icon={<Input/>} label="Import" />
            </Tabs>
        </AppBar>
        {selectedTab === 0 && <ServiceTypePage />}
        {selectedTab === 1 && <ReportsPage />}
        {selectedTab === 2 && <AllUsersPage />}
        {selectedTab === 3 && <SettingsPage />}
        {selectedTab === 4 && <ImportPage />}
        </Box>
    );
}