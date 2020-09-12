import React, { useState, useEffect } from 'react';
import { AppBar, Tabs, Tab, Box } from '@material-ui/core';
import { Pageview, RoomService, House, History } from '@material-ui/icons';

import { ClientsHeader, FoundPage, ServicesPage, ClientPage, HistoryPage } from '../Clients';
import { Container } from '../System';

import { isEmpty } from '../System/js/Utils.js';
import { searchClients, arrayAddIds } from '../System/js/Clients.js';


export default function ClientsMain(props) {
  const searchTerm = props.searchTerm
  const handleSearchTermChange = props.handleSearchTermChange
  const session = props.session
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

  function handleTabChange(event, newTab) {
    setSelectedTab(newTab);
  };

  const handleClientsFoundChange = (newValue) => {
    if (clientsFound !== newValue) {
      setClientsFound(newValue);
      window.clientData = newValue // used temporarily to keep global vars in sync
      window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync
      if (newValue.length === 1) {
        handleClientChange(newValue[0])
        handleTabChange('event', 1)
      } else {
        handleClientChange({})
        handleTabChange('event', 0)
      }
    }
  };

  const handleClientChange = (newClient) => {
    if (newClient !== client) {
      window.client = newClient // used temporarily to keep global vars in sync
      window.servicesRendered = [] // used temporarily to keep global vars in sync
      window.uiResetNotesTab() // used temporarily to keep global vars in sync
      window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync

      if (!isEmpty(newClient)){
        // TODO client should be sorted and have ids for nested arrays saved to the database
        newClient.dependents.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
        newClient.dependents = arrayAddIds(newClient.dependents, 'depId')
        newClient.notes.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
        newClient.notes = arrayAddIds(newClient.notes, 'noteId')
      }
      
      setClient(newClient);
      handleTabChange('event', 1);
    }
  };

  const handleIsNewClientChange = () => {
    if (isNewClient !== true) {
      window.clickShowNewClientForm()
      handleClientChange({})
      handleClientsFoundChange([])
      setIsNewClient(true)
      handleTabChange('event', 2)
    }
  };
  
  return (
    <Box width="100%" p={ 2 }>
      <ClientsHeader 
        client={ client } 
        clientsFound = { clientsFound }
        handleIsNewClientChange={ handleIsNewClientChange }
        isNewClient = { isNewClient }
      />
      <AppBar position="static" color="default">
        <Tabs
          value={selectedTab}
          onChange= { handleTabChange }
          indicatorColor="secondary"
          textColor="primary"
          selectionFollowsFocus
          centered
        >
          <Tab icon={<Pageview />} label="Found" />
          <Tab icon={<RoomService />} label="Services" />
          <Tab icon={<House />} label="Client" />
          <Tab icon={<History />} label="History" />
        </Tabs>
      </AppBar>
      <Container maxWidth='lg' mt={ 0 } pt={ 0 }>
        {selectedTab === 0 && <FoundPage 
          clientsFound = { clientsFound }
          client = { client }
          handleClientChange = { handleClientChange }
          isNewClient = { isNewClient }
        />} 
        {selectedTab === 1 && <ServicesPage 
          client={ client } 
          isNewClient = { isNewClient }
          handleClientChange =  { handleClientChange }
          session = { session }
        />}
        {selectedTab === 2 && <ClientPage client={ client } isNewClient = { isNewClient } />}
        {selectedTab === 3 && <HistoryPage client={ client } isNewClient = { isNewClient } />}
      </Container>
    </Box>
  );
};