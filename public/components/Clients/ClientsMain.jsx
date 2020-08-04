import React, { useState } from 'react';
import { makeStyles, useTheme, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PageviewIcon from '@material-ui/icons/Pageview';
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
  root: {
    backgroundColor: theme.palette.background.paper,
    width: "100%"
  }
}));

export default function ClientsMain(props) {
  const [ selectedTab, setSelectedTab ] = useState(0);
  const classes = useStyles();
  const client = props.client
  const clientData = props.clientData
  
  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div className={classes.root}>
        {/* <div className = "contentHeader">
              <div id = "clientsTitle" className = "contentTitle">{todaysDate}</div>
              <div className = "sectionName">{sectionName}</div>
        </div> */}
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
      {selectedTab === 0 && <FoundPage clientData={ clientData } />}
      {selectedTab === 1 && <ServicesPage client={ client } />}
      {selectedTab === 2 && <ClientPage client={ client } />}
      {selectedTab === 3 && <DependentsPage client={ client } />}
      {selectedTab === 4 && <HistoryPage client={ client } />}
      {selectedTab === 5 && <NotesPage client={ client } />}
      {selectedTab === 6 && <TodayPage client={ client } />}
    </div>
  );
};