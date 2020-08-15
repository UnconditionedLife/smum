import React, { useState, useEffect } from 'react';
import { AppBar, Tabs, Tab, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PageviewIcon from '@material-ui/icons/PageView';
import RoomServiceIcon from '@material-ui/icons/RoomService';
import HouseIcon from '@material-ui/icons/House';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import HistoryIcon from '@material-ui/icons/History';
import CommentIcon from '@material-ui/icons/Comment';
import AssessmentIcon from '@material-ui/icons/Assessment';
import FoundPage from './PageFound.jsx';
import ServicesPage from './PageServices.jsx';
import ClientPage from './PageClient.jsx';
import DependentsPage from './PageDependents.jsx';
import HistoryPage from './PageHistory.jsx';
import NotesPage from './PageNotes.jsx';
import TodayPage from './PageToday.jsx';

const useStyles = makeStyles((theme) => ({
    marginTop: {
        marginTop: '24px'
    }
}));

export default function ClientsMain(props) {
  const classes = useStyles();
  const [ selectedTab, setSelectedTab ] = useState(0);
  const client = props.client
  const clientData = props.clientData

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      <AppBar position="static" color="default">
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="primary"
          selectionFollowsFocus
        >
          <Tab icon={<PageviewIcon />} label="Found" />
          <Tab icon={<RoomServiceIcon />} label="Services" />
          <Tab icon={<HouseIcon />} label="Client" />
          <Tab icon={<SupervisorAccountIcon />} label="Dependents" />
          <Tab icon={<HistoryIcon />} label="History" />
          <Tab icon={<CommentIcon />} label="Notes" />
          <Tab icon={<AssessmentIcon />} label="Today" />
        </Tabs>
      </AppBar>
      <Container className={ classes.marginTop }>
        {selectedTab === 0 && <FoundPage clientData={ clientData } />}
        {selectedTab === 1 && <ServicesPage client={ client } />}
        {selectedTab === 2 && <ClientPage client={ client } />}
        {selectedTab === 3 && <DependentsPage client={ client } />}
        {selectedTab === 4 && <HistoryPage client={ client } />}
        {selectedTab === 5 && <NotesPage client={ client } />}
        {selectedTab === 6 && <TodayPage/>}
      </Container>
    </div>
  );
};