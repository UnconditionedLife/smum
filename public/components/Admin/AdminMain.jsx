import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
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

export default function AdminMain(props) {
  const classes = useStyles();
  // const theme = {theme} // useTheme();
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
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="primary"
          selectionFollowsFocus
        >
          <Tab icon={<ListAltIcon/>} label="Services" />
          <Tab icon={<RoomServiceIcon/>} label="Service Type" />
          <Tab icon={<AssessmentIcon/>} label="Reports" />
          <Tab icon={<AccountBoxIcon/>} label="Users" />
          <Tab icon={<AccountCircleIcon/>} label="User" />
          <Tab icon={<SettingsApplicationsIcon/>} label="Settings" />
          <Tab icon={<InputIcon/>} label="Import" />
        </Tabs>
      </AppBar>
      {selectedTab === 0 && <AdminServicesPage session={ props.session } />}
      {selectedTab === 1 && <ServiceTypePage session={ props.session } />}
      {selectedTab === 2 && <ReportsPage session={ props.session } />}
      {selectedTab === 3 && <AllUsersPage session={ props.session } onSelect={ onSelectUser }/>}
      {selectedTab === 4 && <UserPage session={ props.session } userName={ selectedUser }/>}
      {selectedTab === 5 && <SettingsPage session={ props.session } />}
      {selectedTab === 6 && <ImportPage session={ props.session } />}
    </div>
  );
}

AdminMain.propTypes = {
    session: PropTypes.object.isRequired,
}