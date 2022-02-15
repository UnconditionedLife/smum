import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ClientsHeader, ClientsContent } from '..';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { arrayAddIds, calcFamilyCounts, calcDependentsAges, utilCalcAge } from '../../System/js/Clients/ClientUtils';
import moment from 'moment';
import { dbSearchClientsAsync, dbGetClientActiveServiceHistoryAsync, dbSetModifiedTime,
     utilEmptyPlaceholders, getSession, globalMsgFunc } from '../../System/js/Database';
import { updateLastServed } from '../../System/js/Clients/History';

ClientsMain.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    handleSearchTermChange: PropTypes.func.isRequired,
    selectedTab: PropTypes.number.isRequired,
    checkClientsURL: PropTypes.func,
    updateURL: PropTypes.func,
    url: PropTypes.string,
}

export default function ClientsMain(props) {
    const { searchTerm, selectedTab, checkClientsURL, updateURL, url }  = props
    const [ clientsFound, setClientsFound ] = useState([]);
    const [ client, setClient ] = useState({});
    const [ showFound, setShowFound ] = useState(false);
    const [ showServices, setShowService ] = useState(false);
    const [ showClient, setShowClient ] = useState(false);
    const [ openAlert, setOpenAlert ] = useState(false)
    const [ alertSeverity, setAlertSeverity ] = useState("")
    const [ alertMsg, setAlertMsg ] = useState("")
    const [ session ] = useState(getSession())

    useEffect(() => {
        if (session != null && !isEmpty(session)){
             checkClientsURL(client); 
            } 
    }, [session, url])

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
            dbSearchClientsAsync(searchTerm).then(clients => { 
                changeClientsFound(clients)
                if (clients.length === 0) {
                    globalMsgFunc('error', "No clients found matching: '"+ searchTerm + "'")
                }
             })
        }
    }, [searchTerm]);

    useEffect(() => {
        if (!isEmpty(client)) {
            const lastServed = client.lastServed
            if (lastServed.length > 0) {
                lastServed.sort((a, b) => moment.utc(b.serviceDateTime).diff(moment.utc(a.serviceDateTime)))
                // NOT SURE IF ANY OF THIS IS NEEDED
                // if last service is same day as today - build the svcsRendered state (??? Store svcType & svcId & maybe svcName ????)
//                 if (moment(lastServed[0].serviceDateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
//                     // 
//                     const svcHistoryToday = client.svcHistory.filter( obj => moment(obj.serviceDateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
                    
// console.log("SVC HIST TODAY:", svcHistoryToday)

                    // get history and build services rendered array from records that have today's date

                // }
            }
        }
    }, [client.lastServed])

    // NOTIFY user if there are children over age of 17
    useEffect(() => {
        const deps = client?.dependents ? client.dependents : []
        deps.forEach((dep) => {        
            if (dep.age > 17 && dep.isActive === "Active") {
                if (dep.relationship === "Child" || dep.relationship === "Other") {
                    const msg = dep.givenName + " " + dep.familyName + " is over 17 years of age and still active."
                    globalMsgFunc('error', msg)
                }
            }
        })
    }, [client])

    function changeClientsFound(newValue, shouldUpdateURL) {
        if (clientsFound !== newValue) {
            setClientsFound(newValue);
            // window.clientData = newValue // used temporarily to keep global vars in sync
            // window.utilUpdateClientGlobals() // used temporarily to keep global vars in sync
            if (newValue.length === 1) {
                changeClient(newValue[0], 1)
            } else {
                changeClient({}, 0) // second aregument is tab to change URL to
            }
        }
    }

    function changeClient(newClient, clientsTab){
        if (!isEmpty(newClient)) {
            if ( newClient.clientId !== "0" ){
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
                dbGetClientActiveServiceHistoryAsync(newClient.clientId).then( history => { 
                    newClient.svcHistory = history
                    // newClient.svcsRendered = getSvcsRendered(newClient.svcHistory)
                    setClient(newClient)
                    updateURL(newClient.clientId, clientsTab)
                })
                
            } else {
                dbSetModifiedTime(newClient, true);
                setClient(newClient)
                updateURL(newClient.clientId, clientsTab)
            }
        }
    }

    function updateClient(newClient){
        newClient = utilCalcAge(newClient)
        newClient.lastServed = updateLastServed(newClient)
        setClient(newClient);
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
        // svcsRendered: []
    }

    function isNewClientChange(){
        changeClientsFound([])        
        changeClient(emptyClient, 2) // second argument is tab to set URL to
    }

    function showAlert(severity, msg){
        setAlertSeverity(severity) // error, warning, info, success
        setAlertMsg(msg)
        setOpenAlert(true)
    }

    function handleAlertClose(){
        setOpenAlert(false)
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
            <Snackbar open={ openAlert } autoHideDuration={ 15000 } onClose={ handleAlertClose }>
                <Alert onClose={ handleAlertClose } severity={ alertSeverity }>{ alertMsg }</Alert>
            </Snackbar>

            <ClientsHeader { ...passProps } />
            <ClientsContent { ...passProps } showAlert={ showAlert } />
        </Box>
    )
}