import React from 'react';
import { makeStyles, useTheme, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ListAltIcon from '@material-ui/icons/ListAlt';
import RoomServiceIcon from '@material-ui/icons/RoomService';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AssessmentIcon from '@material-ui/icons/Assessment';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import InputIcon from '@material-ui/icons/Input';
import AdminServicesPage from './PageAdminServices.jsx';
import ServiceTypePage from './PageServiceType.jsx';
import ReportsPage from './PageReports.jsx';
import AllUsersPage from './PageAllUsers.jsx';
import UserPage from './PageUser.jsx';
import SettingsPage from './PageSettings.jsx';
import ImportPage from './PageImport.jsx';
// import SectionsHeader from '../Clients/ClientsHeader.jsx'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: "100%"
  }
}));

export default function AdminMain() {
  const classes = useStyles();
  // const theme = {theme} // useTheme();
  const [ selectedTab, setSelectedTab ] = React.useState(0);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="primary"
          selectionFollowsFocus
        >
          <Tab icon={<ListAltIcon />} label="Services" />
          <Tab icon={<RoomServiceIcon />} label="Service Type" />
          <Tab icon={<AssessmentIcon />} label="Reports" />
          <Tab icon={<AccountBoxIcon />} label="Users" />
          <Tab icon={<AccountCircleIcon />} label="User" />
          <Tab icon={<SettingsApplicationsIcon />} label="Settings" />
          <Tab icon={<InputIcon />} label="Import" />
        </Tabs>
      </AppBar>
      {selectedTab === 0 && <AdminServicesPage />}
      {selectedTab === 1 && <ServiceTypePage />}
      {selectedTab === 2 && <ReportsPage />}
      {selectedTab === 3 && <AllUsersPage />}
      {selectedTab === 4 && <UserPage />}
      {selectedTab === 5 && <SettingsPage />}
      {selectedTab === 6 && <ImportPage />}
    </div>
  );
};