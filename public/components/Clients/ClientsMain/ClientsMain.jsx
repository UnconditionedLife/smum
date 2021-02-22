import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { ClientsHeader, ClientsContent } from '../../Clients';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { arrayAddIds, calcFamilyCounts, calcDependentsAges, utilCalcAge } from '../../System/js/Clients/ClientUtils';
import moment from 'moment';
import { dbSearchClients, dbGetClientActiveServiceHistory, dbSetModifiedTime, utilEmptyPlaceholders } from '../../System/js/Database';
import { getSvcsRendered } from '../../System/js/Clients/Services'

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
    const [ showFound, setShowFound ] = useState(false);
    const [ showServices, setShowService ] = useState(false);
    const [ showClient, setShowClient ] = useState(false);
    

    useEffect(() => { if (session != null && !isEmpty(session)) { checkClientsURL(client); } }, [session, url])

    useEffect(() => {
        const foundEval = !isEmpty(clientsFound)
        const clientEval = (!isEmpty(client) || client?.clientId === "0")
        const servicesEval = (!isEmpty(client) || client?.clientId !== "0")
        if (showFound !== foundEval) setShowFound(foundEval)
        if (showServices !== servicesEval) setShowService(servicesEval)
        if (showClient !== clientEval) setShowClient(clientEval)
    })

    useEffect(() => {
        if (searchTerm !== '') {
            if (window.stateCheckPendingEdit()) return // used temporarily to keep global vars in sync
            window.uiShowHideClientMessage('hide')   // hide ClientMessage overlay in case it's open
            const searchResults = dbSearchClients(searchTerm)
            changeClientsFound(searchResults)
        }
    }, [searchTerm]);

    useEffect(() => {
        if (!isEmpty(client)) {
            const lastServed = client.lastServed
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

console.log("IN CHANGE CLIENT")
console.log(newClient)
console.log("{",newClient.clientId,"}")
        if (!isEmpty(newClient)) {

            if ( newClient.clientId !== "0" ){

    console.log("IN PREP CLIENT")

                // TODO client should be sorted and have ids for nested arrays saved to the database
                newClient = utilEmptyPlaceholders(newClient, "remove")
                newClient = utilCalcAge(newClient)
                newClient.dependents = calcDependentsAges(newClient)
                newClient.family = calcFamilyCounts(newClient)
                newClient.dependents.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
                newClient.dependents = arrayAddIds(newClient.dependents, 'depId')
                newClient.notes.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
                newClient.notes = arrayAddIds(newClient.notes, 'noteId')
                // add service handling objects
                newClient.svcHistory = dbGetClientActiveServiceHistory(newClient.clientId)
                newClient.svcsRendered = getSvcsRendered(newClient.svcHistory)
            } else {
                dbSetModifiedTime(newClient, true);
            }
            keepAppJsInSync(newClient)
            setClient(newClient)
        }
    }

    function updateClient(newClient){
        keepAppJsInSync(newClient)
        newClient = utilCalcAge(newClient)
        setClient(newClient);
    }

    // TODO - TO BE REMOVED
    function keepAppJsInSync(newClient){
        window.client = newClient // used temporarily to keep global vars in sync
        window.servicesRendered = [] // used temporarily to keep global vars in sync
        // window.uiResetNotesTab() // used temporarily to keep global vars in sync
        window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync
    }

    const emptyClient = {
        clientId: "0",
        givenName: "",
        familyName: "",
        gender: "",
        dob: "",
        createdDateTime: "",
        updatedDateTime: "",
        firstSeenDate: moment().format('YYYY-MM-DD'),
        familyIdCheckedDate: moment().format('YYYY-MM-DD'),
        street: "",
        city: "San Jose",
        state: "CA",
        zipcode: "",
        zipSuffix: "",
        telephone: "",
        email: "",
        isActive: "Client",
        ethnicGroup: "",
        homeless: "",
        financials: {
            income: "",
            govtAssistance: "",
            rent: "",
            foodStamps: ""
        },
        dependents: [],
        notes: [],
        lastServed: [],
        family: {
            totalAdults: 0,
            totalChildren: 0,
            totalOtherDependents: 0,
            totalSeniors: 0,
            totalSize: 0,
        },
        svcHistory: [],
        svcsRendered: []
    }

    function isNewClientChange(){
        // window.clickShowNewClientForm() // used temporarily - remove once clientPage forms have been converted
        // NEED TOO CHECK FOR CLIENT EDIT FLAG

console.log("IN NEW CLIENT")

        changeClient(emptyClient)
        changeClientsFound([])
        updateURL(null, 2)
    }

    const passProps = {
        client, clientsFound, 
        changeClient: changeClient,
        updateClient: updateClient, 
        isNewClientChange: isNewClientChange,
        selectedTab, updateURL,
        showFound: showFound,
        showServices: showServices,
        showClient: showClient
    }

    return (
        <Box key={ client.updatedDateTime } width="100%" p={2} >
            <ClientsHeader { ...passProps } />
            <ClientsContent { ...passProps } session={ session } />
        </Box>
    )
}