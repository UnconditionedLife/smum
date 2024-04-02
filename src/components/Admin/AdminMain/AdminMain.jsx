import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AppBar, Badge, Box, Tab, Tabs } from '@mui/material';
import { RoomService, AccountBox, Assessment, DateRange, SettingsApplications, BugReport } from '@mui/icons-material';
import { AllUsersPage, CalendarPage, ReportsPage, ErrorPage,
            ServiceTypePage, SettingsPage } from '..';
import { getUserName } from '../../System/js/Database';
import UseWindowSize from '../../System/Hooks/UseWindowSize.jsx';
import { dbFetchErrorLogs } from '../../System/js/Database';


AdminMain.propTypes = {
    selectedTab: PropTypes.number.isRequired,
    checkAdminURL: PropTypes.func,
    updateAdminURL: PropTypes.func,
    url: PropTypes.string,
}

export default function AdminMain(props) {
    const { selectedTab, checkAdminURL, updateAdminURL, url } = props;
    const [totalCountErrors, setTotalCountErrors] = useState(0)
    const [countErrors, setCountErrors] = useState(0);
    const [errorMessages, setErrorMessages] = useState([]);
    useEffect(() => {
        // query the error log api to find the number of errors
        dbFetchErrorLogs("","").then((errors) => {
            setErrorMessages(errors);
            setCountErrors(errors.length);
            setTotalCountErrors(errors.length);
        });
    }, []);

    useEffect(() => {
        if (getUserName()) checkAdminURL()
    }, [ getUserName, url ])

    let navLabels = [ 'Reports', 'Calendar', 'Service Types', 'Users', 'Settings', 'Errors' ];
    if (UseWindowSize().width < 450) navLabels = [ '','','','','' ]

    return (
        <Box  width="100%">
            <Box  width={ 1 } display="flex" flexWrap="wrap-reverse">
              <AppBar position="static" color="default" style={{ display:'flex', width: '100%', maxHeight:'72px',
                    justifyContent: 'center', alignItems: 'center', flexDirection:'row', overflow: 'hidden', zIndex:'1075' }}>                    
                    <Tabs
                    value={ selectedTab }
                    // onChange={ handleTabChange }
                    onChange={(event, newValue) => { updateAdminURL(newValue) }}
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
                        <Tab icon={
                            <Badge badgeContent={selectedTab === 5 ? countErrors : totalCountErrors} color='error' max={999}>
                                <BugReport/>
                            </Badge>} 
                            label={ navLabels[5] } />
                    </Tabs>
                </AppBar>
            </Box>
            {selectedTab === 0 && <ReportsPage />}
            {selectedTab === 1 && <CalendarPage />}
            {selectedTab === 2 && <ServiceTypePage />}
            {selectedTab === 3 && <AllUsersPage />}
            {selectedTab === 4 && <SettingsPage />}
            {selectedTab === 5 && <ErrorPage errorMessages={errorMessages} errorMessagesUpdate={setErrorMessages} countUpdate={setCountErrors}/>}
        </Box>
    );
}