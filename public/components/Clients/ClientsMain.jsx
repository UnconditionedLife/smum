import React, { useState, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { ClientsHeader, ClientsContent } from '../Clients';
import { isEmpty } from '../System/js/Utils.js';
import { searchClients, arrayAddIds } from '../System/js/Clients.js';

export default function ClientsMain(props) {
  const searchTerm = props.searchTerm
  const session = props.session
  const selectedTab = props.selectedTab
  const checkClientsURL = props.checkClientsURL
  const updateURL = props.updateURL
  const url = props.url

  const [clientsFound, setClientsFound] = useState([]);
  const [client, setClient] = useState({});
  const [isNewClient, setIsNewClient] = useState(false);

  useEffect(() => { if (session != null && !isEmpty(session)) { checkClientsURL(); } }, [session, url])

  useEffect(() => {
    if (searchTerm !== '') {
      if (window.stateCheckPendingEdit()) return // used temporarily to keep global vars in sync
      window.uiShowHideClientMessage('hide')   // hide ClientMessage overlay in case it's open
      const searchResults = searchClients(searchTerm)
      handleClientsFoundChange(searchResults)
    }
  }, [searchTerm]);

  const handleClientsFoundChange = (newValue, shouldUpdateURL) => {
    if (clientsFound !== newValue) {
      setClientsFound(newValue);
      window.clientData = newValue // used temporarily to keep global vars in sync
      window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync
      if (newValue.length === 1) {
        handleClientChange(newValue[0])
        updateURL(newValue[0].clientId, 1)
      } else {
        handleClientChange({})
        updateURL(null, 0)
      }
    }
  };

  const handleClientChange = (newClient) => {
    if (newClient !== client) {
      window.client = newClient // used temporarily to keep global vars in sync
      window.servicesRendered = [] // used temporarily to keep global vars in sync
      window.uiResetNotesTab() // used temporarily to keep global vars in sync
      window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync

      if (!isEmpty(newClient)) {
        // TODO client should be sorted and have ids for nested arrays saved to the database
        newClient.dependents.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
        newClient.dependents = arrayAddIds(newClient.dependents, 'depId')
        newClient.notes.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
        newClient.notes = arrayAddIds(newClient.notes, 'noteId')
      }

      setClient(newClient);
    }
  };

  return (
    <Box width="100%" p={2} >
      <ClientsHeader
        client={client}
        clientsFound={clientsFound}
        isNewClient={isNewClient}
        selectedTab={selectedTab}
        updateURL={updateURL}
      />
      <ClientsContent
        client={client}
        clientsFound={clientsFound}
        handleClientChange={handleClientChange}
        isNewClient={isNewClient}
        updateURL={updateURL}
        session={session}
      />
    </Box>
  );
};