import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { ClientsHeader, ClientsContent } from '../../Clients';
import { isEmpty } from '../../System/js/Utils.js';
import { searchClients, arrayAddIds, calcClientFamilyCounts, calcClientDependentsAges } from '../../System/js/Clients.js';

ClientsMain.propTypes = {
    session: PropTypes.object.isRequired,
    searchTerm: PropTypes.string.isRequired,
    handleSearchTermChange: PropTypes.func.isRequired,
//    selectedTab: PropTypes.number.isRequired,
//     checkClientsURL: PropTypes.func.isRequired,
//     updateURL: PropTypes.object.isRequired,
//     url: PropTypes.string,
}

export default function ClientsMain(props) {
    const searchTerm = props.searchTerm
    const session = props.session
    const selectedTab = props.selectedTab
    const checkClientsURL = props.checkClientsURL
    const updateURL = props.updateURL
    const url = props.url
    const [clientsFound, setClientsFound] = useState([]);
    const [client, setClient] = useState({});

    useEffect(() => { if (session != null && !isEmpty(session)) { checkClientsURL(client); } }, [session, url])

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
    }

    const handleClientChange = (newClient) => {
        if (newClient !== client) {
            if (!isEmpty(newClient)){
                // TODO client should be sorted and have ids for nested arrays saved to the database
                newClient.dependents.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
                newClient.dependents = arrayAddIds(newClient.dependents, 'depId')
                newClient.dependents = calcClientDependentsAges(newClient)
                newClient.notes.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
                newClient.notes = arrayAddIds(newClient.notes, 'noteId')
                newClient.family = calcClientFamilyCounts(newClient)
            }
            
            window.client = newClient // used temporarily to keep global vars in sync
            window.servicesRendered = [] // used temporarily to keep global vars in sync
            window.uiResetNotesTab() // used temporarily to keep global vars in sync
            window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync
            
            setClient(newClient);
        }
    }

    const handleIsNewClientChange = () => {
        window.clickShowNewClientForm() // used temporarily - remove once clientPage forms have been converted
        handleClientChange({})
        handleClientsFoundChange([])
        updateURL(null, 2)
    }

    return (
        <Box width="100%" p={2} >
            <ClientsHeader
                client={client}
                clientsFound={clientsFound}
                handleIsNewClientChange={ handleIsNewClientChange }
                selectedTab={selectedTab}
                updateURL={updateURL}
            />
            <ClientsContent
                client={client}
                clientsFound={clientsFound}
                handleClientChange={handleClientChange}
                updateURL={updateURL}
                session={session}
            />
        </Box>
    )
}