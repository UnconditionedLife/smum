import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { ClientsHeader, ClientsContent } from '../../Clients';
import { isEmpty } from '../../System/js/Utils.js';
import { searchClients, arrayAddIds, calcClientFamilyCounts, calcClientDependentsAges } from '../../System/js/Clients.js';
import moment from 'moment';
import { getServiceHistory } from '../../System/js/Clients';

ClientsMain.propTypes = {
    session: PropTypes.object.isRequired,
    searchTerm: PropTypes.string.isRequired,
    handleSearchTermChange: PropTypes.func.isRequired,
    selectedTab: PropTypes.number.isRequired,
//     checkClientsURL: PropTypes.func.isRequired,
//     updateURL: PropTypes.object.isRequired,
    url: PropTypes.string,
}

export default function ClientsMain(props) {
    const searchTerm = props.searchTerm
    const session = props.session
    const selectedTab = props.selectedTab
    const checkClientsURL = props.checkClientsURL
    const updateURL = props.updateURL
    const url = props.url
    const [ clientsFound, setClientsFound ] = useState([]);
    const [ client, setClient ] = useState({});
    const [ svcsRendered, setSvcsRendered ] = useState([])

    useEffect(() => { if (session != null && !isEmpty(session)) { checkClientsURL(client); } }, [session, url])

    useEffect(() => {
        if (searchTerm !== '') {
            if (window.stateCheckPendingEdit()) return // used temporarily to keep global vars in sync
            window.uiShowHideClientMessage('hide')   // hide ClientMessage overlay in case it's open
            const searchResults = searchClients(searchTerm)
            handleClientsFoundChange(searchResults)
        }
    }, [searchTerm]);


    console.log(client.lastServed)

    useEffect(() => {
        console.log('effect')
        if (!isEmpty(client) && svcsRendered === []) {
            const lastServed = client.lastServed
            lastServed.sort((a, b) => moment.utc(b.serviceDateTime).diff(moment.utc(a.serviceDateTime)))
            // if last service is same day as today - build the svcsRendered state (??? Store svcType & svcId & maybe svcName ????)
            if (moment(lastServed[0].serviceDateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
                const svcHistory = getServiceHistory().filter( obj => moment(obj.serviceDateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
                console.log(svcHistory)
                // get history and build services rendered array from records that have today's date

            }
        }
    },[])

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

    function updateSvcsRendered(newArray){
        console.log(newArray)
        setSvcsRendered(newArray)
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
                client={ client }
                clientsFound={ clientsFound }
                handleIsNewClientChange={ handleIsNewClientChange }
                selectedTab={ selectedTab }
                updateURL={ updateURL }
            />
            <ClientsContent
                client={ client }
                clientsFound={ clientsFound }
                handleClientChange={ handleClientChange }
                updateURL={ updateURL }
                session={ session }
                svcsRendered={ svcsRendered }
                updateSvcsRendered={ updateSvcsRendered }
            />
        </Box>
    )
}