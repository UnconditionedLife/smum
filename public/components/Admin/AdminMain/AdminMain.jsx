import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AppBar, Box, Tab, Tabs } from '@material-ui/core';
import { RoomService, AccountBox, AccountCircle, 
            Assessment, SettingsApplications, Input } from '@material-ui/icons';
import { AllUsersPage, ImportPage, ReportsPage, 
            ServiceTypePage, SettingsPage } from '../../Admin';

AdminMain.propTypes = {
    session: PropTypes.object.isRequired,
}

export default function AdminMain(props) {
    const [ selectedTab, setSelectedTab ] = React.useState(0);

    const handleChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

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
        {selectedTab === 0 && <ServiceTypePage session={ props.session } />}
        {selectedTab === 1 && <ReportsPage session={ props.session } />}
        {selectedTab === 2 && <AllUsersPage session={ props.session } />}
        {selectedTab === 3 && <SettingsPage session={ props.session } />}
        {selectedTab === 4 && <ImportPage session={ props.session } />}
        </Box>
    );
}