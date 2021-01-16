import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AppBar, Box, Tab, Tabs } from '@material-ui/core';
import { ListAlt, RoomService, AccountBox, AccountCircle, 
            Assessment, SettingsApplications, Input } from '@material-ui/icons';
import { AdminServicesPage, AllUsersPage, ImportPage, ReportsPage, 
            ServiceTypePage, SettingsPage, UserPage } from '../../Admin';

AdminMain.propTypes = {
    session: PropTypes.object.isRequired,
}

export default function AdminMain(props) {
    const [ selectedTab, setSelectedTab ] = React.useState(0);
    const [selectedUser, setSelectedUser] = useState('');

    const handleChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    function onSelectUser(userName) {
        setSelectedUser(userName);
        setSelectedTab(4);
    }

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
            <Tab icon={<AccountCircle/>} label="User" />
            <Tab icon={<SettingsApplications/>} label="Settings" />
            <Tab icon={<Input/>} label="Import" />
            </Tabs>
        </AppBar>
        {selectedTab === 0 && <ServiceTypePage session={ props.session } />}
        {selectedTab === 1 && <ReportsPage session={ props.session } />}
        {selectedTab === 2 && <AllUsersPage session={ props.session } onSelect={ onSelectUser }/>}
        {selectedTab === 3 && <UserPage session={ props.session } userName={ selectedUser }/>}
        {selectedTab === 4 && <SettingsPage session={ props.session } />}
        {selectedTab === 5 && <ImportPage session={ props.session } />}
        </Box>
    );
}