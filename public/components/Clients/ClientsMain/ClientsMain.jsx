import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { ClientsHeader, ClientsContent } from '../../Clients';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { searchClients } from '../../System/js/Clients/Clients';
import { arrayAddIds, calcClientFamilyCounts, calcClientDependentsAges } from '../../System/js/Clients/ClientUtils';
import moment from 'moment';
import { dbGetClientActiveServiceHistory } from '../../System/js/Database';
import { getSvcsRendered } from '../../System/js/Clients/Services'
import SmumLogo from "../../Assets/SmumLogo";

ClientsMain.propTypes = {
    session: PropTypes.object.isRequired,
    searchTerm: PropTypes.string.isRequired,
    handleSearchTermChange: PropTypes.func.isRequired,
    selectedTab: PropTypes.number.isRequired,
    checkClientsURL: PropTypes.func,
    updateURL: PropTypes.func,
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

    useEffect(() => { if (session != null && !isEmpty(session)) { checkClientsURL(client); } }, [session, url])

    useEffect(() => {
        if (searchTerm !== '') {
            if (window.stateCheckPendingEdit()) return // used temporarily to keep global vars in sync
            window.uiShowHideClientMessage('hide')   // hide ClientMessage overlay in case it's open
            const searchResults = searchClients(searchTerm)
            changeClientsFound(searchResults)
        }
    }, [searchTerm]);


//     useEffect(() => {
//         console.log('update history effect')
//         console.log()
//         if (!isEmpty(client) && svcHistory === []) {
//             console.log('updatttting history effect')
//             updateSvcHistory()
//         }
//     })

// console.log(client.lastServed)
// console.log(svcHistory)

    useEffect(() => {
        if (!isEmpty(client)) {
            const lastServed = client.lastServed

console.log(lastServed.length)
            if (lastServed.length > 0) {
                lastServed.sort((a, b) => moment.utc(b.serviceDateTime).diff(moment.utc(a.serviceDateTime)))
                // if last service is same day as today - build the svcsRendered state (??? Store svcType & svcId & maybe svcName ????)
                if (moment(lastServed[0].serviceDateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
                    // 
                    const svcHistoryToday = client.svcHistory.filter( obj => moment(obj.serviceDateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
                    console.log(svcHistoryToday)
                    // get history and build services rendered array from records that have today's date

                }
            }
        }
    })

    function changeClientsFound(newValue, shouldUpdateURL) {
        if (clientsFound !== newValue) {
            setClientsFound(newValue);
            window.clientData = newValue // used temporarily to keep global vars in sync
            window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync
            if (newValue.length === 1) {
                changeClient(newValue[0])
                updateURL(newValue[0].clientId, 1)
            } else {
                changeClient({})
                updateURL(null, 0)
            }
        }
    }

    function changeClient(newClient){
        if (newClient !== client) {
            if (!isEmpty(newClient)){
                // TODO client should be sorted and have ids for nested arrays saved to the database
                newClient.dependents.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
                newClient.dependents = arrayAddIds(newClient.dependents, 'depId')
                newClient.dependents = calcClientDependentsAges(newClient)
                newClient.notes.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
                newClient.notes = arrayAddIds(newClient.notes, 'noteId')
                newClient.family = calcClientFamilyCounts(newClient)
                newClient.svcHistory = dbGetClientActiveServiceHistory(newClient.clientId)
                newClient.svcsRendered = getSvcsRendered(newClient.svcHistory)
            }
            keepAppJsInSync(newClient)
            setClient(newClient);
        }
    }

    function updateClient(newClient){
        keepAppJsInSync(newClient)
        setClient(newClient);
    }

    // TODO - TO BE REMOVED
    function keepAppJsInSync(newClient){
        window.client = newClient // used temporarily to keep global vars in sync
        window.servicesRendered = [] // used temporarily to keep global vars in sync
        window.uiResetNotesTab() // used temporarily to keep global vars in sync
        window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync
    }

    function handleIsNewClientChange(){
        window.clickShowNewClientForm() // used temporarily - remove once clientPage forms have been converted
        changeClient({})
        changeClientsFound([])
        updateURL(null, 2)
    }

    return (
        <Box width="100%" p={2} >
            <ClientsHeader
                client={ client } clientsFound={ clientsFound } handleIsNewClientChange={ handleIsNewClientChange }
                selectedTab={ selectedTab }
                updateURL={ updateURL }
            />
            { !isEmpty(client) &&
                <ClientsContent
                    updateURL={ updateURL } session={ session } clientsFound={ clientsFound }
                    client={ client } changeClient={ changeClient } updateClient={ updateClient }
                />
            } 
            { isEmpty(client) &&
                <Box display="flex" width="100%" height="100%" justifyContent="center" p='30%' pt='4%'>
                    <SmumLogo width='90%' />
                    {/* <Box width="100%" height="100%" bgcolor="#ddd" position="relative" top="0" left="0" 
                        style={{ zIndex: 9, opacity:"0.8" }}>
                    </Box> */}
                </Box>
            }
        </Box>
    )
}