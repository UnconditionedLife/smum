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
import theme from '../Sections/Theme.jsx';
import { isEmpty } from '../js/Utils.js';
import { searchClients } from '../js/Clients.js';
import ClientsHeader from './ClientsHeader.jsx';
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
    },
    wrapper: {
        width: '100vw',
        padding: '15px'
    }
}));

export default function ClientsMain(props) {
  const classes = useStyles();
  const searchTerm = props.searchTerm
  const handleSearchTermChange = props.handleSearchTermChange
  const [ selectedTab, setSelectedTab ] = useState(0);
  const [ clientsFound, setClientsFound ] = useState([]);
  const [ client, setClient ] = useState({});
  const [ isNewClient, setIsNewClient ] = useState(false);
  
  useEffect(() => {
    if (searchTerm !== '') { 
        if (window.stateCheckPendingEdit()) return // used temporarily to keep global vars in sync
        window.uiShowHideClientMessage('hide')   // hide ClientMessage overlay in case it's open
        const searchResults = searchClients(searchTerm)
        handleClientsFoundChange(searchResults)
        handleSearchTermChange('')
    }
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleClientsFoundChange = (newValue) => {
    if (clientsFound !== newValue) {
      setClientsFound(newValue);
      window.clientData = newValue // used temporarily to keep global vars in sync
      window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync
      if (newValue.length === 1) {
        handleClientChange(newValue[0])
        handleTabChange(0,1)
      } else {
        handleClientChange({})
        handleTabChange(0,0)
      }
    }
  };

  const handleClientChange = (newClient) => {
    if (newClient !== client) {
      window.client = newClient // used temporarily to keep global vars in sync
      window.servicesRendered = [] // used temporarily to keep global vars in sync
      window.uiResetNotesTab() // used temporarily to keep global vars in sync
      window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync
      setClient(newClient);

console.log(client)

      if (!isEmpty(client)) { 
        handleTabChange(0,1) 
      }
    }
  };

  const handleIsNewClientChange = () => {
    if (isNewClient !== true) {
      window.clickShowNewClientForm()
      handleClientChange({})
      handleClientsFoundChange([])
      setIsNewClient(true)
      handleTabChange(0,2)
    }
  };
  
  return (
    <div className= { classes.wrapper }>
      <ClientsHeader 
        client={ client } 
        clientsFound = { clientsFound }
        handleIsNewClientChange={ handleIsNewClientChange }
        isNewClient = { isNewClient }
      />
      <AppBar position="static" color="default">
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="primary"
          selectionFollowsFocus
          centered
        >
          <Tab icon={<PageviewIcon />} label="Found" />
          <Tab icon={<RoomServiceIcon />} label="Services" />
          <Tab icon={<HouseIcon />} label="Client" />
          <Tab icon={<SupervisorAccountIcon />} label="Dependents" />
          <Tab icon={<HistoryIcon />} label="History" />
          {/* <Tab icon={<CommentIcon />} label="Notes" /> */}
          {/* <Tab icon={<AssessmentIcon />} label="Today" /> */}
        </Tabs>
      </AppBar>
      <Container className={ classes.marginTop }>
        {selectedTab === 0 && <FoundPage 
          clientsFound = { clientsFound }
          client={ client }
          handleClientChange={ handleClientChange }
          isNewClient = { isNewClient }
        />} 
        {selectedTab === 1 && <ServicesPage client={ client } isNewClient = { isNewClient } />}
        {selectedTab === 2 && <ClientPage client={ client } isNewClient = { isNewClient } />}
        {selectedTab === 3 && <DependentsPage client={ client } isNewClient = { isNewClient } />}
        {selectedTab === 4 && <HistoryPage client={ client } isNewClient = { isNewClient } />}
        {/* {selectedTab === 5 && <NotesPage client={ client } isNewClient = { isNewClient } />} */}
        {/* {selectedTab === 6 && <TodayPage/>} */}
      </Container>
    </div>
  );
};