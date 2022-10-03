import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Snackbar } from '@mui/material';
import { Alert } from '@mui/material';
import { ClientsHeader, ClientsContent } from '..';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { arrayAddIds, calcFamilyCounts, calcDependentsAges, utilCalcAge } from '../../System/js/Clients/ClientUtils';
import moment from 'moment';
import { dbSearchClientsAsync, dbGetAllClientSvcsAsync, dbSetModifiedTime,
     utilEmptyPlaceholders, getUserName, globalMsgFunc } from '../../System/js/Database';
import { getLastServedDays } from '../../System/js/Clients/Services'

ClientsMain.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    handleSearchTermChange: PropTypes.func.isRequired,
    selectedTab: PropTypes.number.isRequired,
    checkClientsURL: PropTypes.func,
    updateClientsURL: PropTypes.func,
    url: PropTypes.string,
}

export default function ClientsMain(props) {
    const { searchTerm, selectedTab, checkClientsURL, updateClientsURL, url }  = props
    const [ clientsFound, setClientsFound ] = useState([]);
    const [ client, setClient ] = useState({});
    const [ showFound, setShowFound ] = useState(false);
    const [ showServices, setShowService ] = useState(false);
    const [ showClient, setShowClient ] = useState(false);
    const [ openAlert, setOpenAlert ] = useState(false)
    const [ alertSeverity, setAlertSeverity ] = useState("info")
    const [ alertMsg, setAlertMsg ] = useState("")
    const [ lastServedDays, setLastServedDays ] = useState(null)
    const [ lastServedFoodDate, setLastServedFoodDate ] = useState(null)
    const [ clientInactive, setClientInactive ]  = useState(null)

    useEffect(() => {
        if (getUserName()){
             checkClientsURL(client); 
            } 
    }, [ getUserName, url ])

    useEffect(() => {
        const foundEval = !isEmpty(clientsFound)
        let clientEval = !isEmpty(client)
        if (!clientEval) clientEval = client?.clientId === "0"
        let servicesEval = !isEmpty(client)
        if (servicesEval) servicesEval = client?.clientId !== "0"
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
            // add client history of none exists
            if (!("svcHistory" in client)) client.svcHistory = []
            const tempLastServedDays = getLastServedDays(client)
            if (lastServedDays !== tempLastServedDays) setLastServedDays(tempLastServedDays)
            if (lastServedFoodDate !== tempLastServedDays.lastServedFoodDate) setLastServedFoodDate(tempLastServedDays.lastServedFoodDate)
            if (client.isActive === "Inactive") {
                setClientInactive(true)
            } else {
                setClientInactive(false)
            }
        }
    },[ client, client.isActive ])

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

    function changeClientsFound(newValue) {
        if (clientsFound !== newValue) {
            setClientsFound(newValue);
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
                // Existing client record
                newClient = utilEmptyPlaceholders(newClient, "remove")
                newClient = utilCalcAge(newClient)
                newClient.dependents = calcDependentsAges(newClient)
                newClient.family = calcFamilyCounts(newClient)
                newClient.dependents.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
                newClient.dependents = arrayAddIds(newClient.dependents, 'depId')
                newClient.notes.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
                newClient.notes = arrayAddIds(newClient.notes, 'noteId')
                // add service handling objects
                dbGetAllClientSvcsAsync(newClient.clientId)
                    .then( svcHistory => { 

                        console.log(svcHistory)

                        newClient.svcHistory = svcHistory.filter(svc => { 
                            return svc.svcValid === true 
                        })
                        newClient.invalidSvcs = svcHistory.filter(svc => {
                            return svc.svcValid === false
                        })

                        console.log(newClient.svcHistory)
                        console.log(newClient.invalidSvcs)

                        setClient(newClient)
                        updateClientsURL(newClient.clientId, clientsTab)
                    })
            } else {
                // New client record
                dbSetModifiedTime(newClient, true);
                setClient(newClient)
                updateClientsURL(newClient.clientId, clientsTab)
            }
        } else {
            updateClientsURL("", clientsTab)
        }
    }

    function updateClient(newClient){
        newClient = utilCalcAge(newClient)
        setClient(newClient);
    }

    const emptyClient = {
        clientId: "0",
        givenName: "",
        familyName: "",
        gender: "",
        dob: "",
        age: 0,
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
        selectedTab, updateClientsURL,
        showFound: showFound,
        showServices: showServices,
        showClient: showClient,
        lastServedDays, lastServedFoodDate,
        clientInactive
    }

    // do not render admin if session/userName is not set
    // if (getUserName() === null) return null 

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