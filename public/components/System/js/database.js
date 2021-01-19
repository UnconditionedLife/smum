//************************************************
//***** DATABASE SECTION JAVASCRIPT FUNCTIONS *****
//************************************************

import moment from 'moment';
import { isEmpty, utilStringToArray } from './GlobalUtils';

const dbBase = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/';

//**** CACHED VARIABLES ****

let dbUrl = '';
let cachedSession = {}
let cachedSettings = null;
let cachedSvcTypes = []

function dbFetchUrl(session, subUrl) {
    return window.dbGetData(dbUrl + subUrl);
}

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

// svcTypes

export function getSvcTypes(){
    if (isEmpty(cachedSvcTypes) && !isEmpty(cachedSession)) {
        cachedSvcTypes = dbGetSvcTypes()
    }
    return cachedSvcTypes
}

// Session

export function cacheSessionVar(newSession) {
    cachedSession = newSession
}

// Utility Functions

export function dbSetUrl(instance) {
    dbUrl = dbBase + instance;
    console.log(dbUrl)
}

export function dbSetModifiedTime(obj, isNew) {
    const now = moment().format('YYYY-MM-DDTHH:mm');
    obj.updatedDateTime = now;
    if (isNew)
        obj.createdDateTime = now;
}

// Users

export function dbGetUser(session, userName) {
    let result = dbFetchUrl(session, "/users/" + userName).users;
    if (result.length == 1)
        return result[0];
    else
        return null;
}

export function dbGetAllUsers(session) {
	return dbFetchUrl(session, "/users").users;
}

// Clients

export function dbGetClient(session, clientId) {
    let result = dbFetchUrl(session, "/clients/" + clientId).clients;
    if (result.length == 1)
        return result[0];
    else
        return null;
}

// App settings

export function dbGetSettings(session) {
    let temp = dbFetchUrl(session, "/settings")
    let fields = ["serviceZip", "serviceCat", "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"]
    
    fields.forEach(x => {
        temp[x] = utilStringToArray(temp[x]);
    });
    cachedSettings = temp;
    return temp;
}

export function SettingsSound() {
    return (cachedSettings.sounds == 'YES');
}

export function SettingsPrinter() {
    return (cachedSettings.printerIP);
}

export function SettingsSeniorAge() {
    return (parseInt(cachedSettings.seniorAge, 10));
}

export function SettingsServiceCats() {
    return (cachedSettings.serviceCat);
}

export function SettingsZipcodes() {
    return (cachedSettings.serviceZip);
}

export function SettingsSchedule() {
    return {
        closedDays: cachedSettings.closedDays,
        closedEveryDays: cachedSettings.closedEveryDays,
        closedEveryDaysWeek: cachedSettings.closedEveryDaysWeek,
        openDays: cachedSettings.openDays,
    };
}


// ServiceTypes

export function dbGetSvcTypes(){
    console.log('GETTING SVCTYPES')
	const temp = dbGetData(aws+"/servicetypes").serviceTypes
		.sort(function(a, b){
			let nameA= a.serviceName.toLowerCase()
			let nameB= b.serviceName.toLowerCase()
			if (nameA < nameB) return -1
			if (nameA > nameB) return 1
		return 0; //default return value (no sorting)
    })
    cachedSvcTypes = temp
    return temp
}

// export function saveRecord(object, table){
//     const data = JSON.stringify(object)
//     let apiUrl
//     switch (table){
//         case 'services':
//             apiUrl = dbUrl + "/clients/services"
//     }
//     const result = dbPostData(apiUrl, data)
//     return result
// }

export function dbGetClientActiveServiceHistory(clientId){

console.log('GET HISTORY FROM DB')

    let history = dbGetData(aws + "/clients/services/" + clientId).services
    return history.filter(item => item.serviceValid == "true")
            .sort((a, b) => moment.utc(b.servicedDateTime).diff(moment.utc(a.servicedDateTime)))
}

// export function dbGetAppSettings(){
// 	let temp = dbGetData(aws+"/settings")
// 	let fields = ["serviceZip", "serviceCat", "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"]
// 	for (var i = 0; i < fields.length; i++) {
// 		let x = fields[i]
// 		if (temp[x] == "*EMPTY*") {
// 			temp[x] = []
// 		} else {
// 			temp[x] = utilStringToArray(temp[x])
// 		}
// 	}
// 	return temp
// }

export function dbSaveClient(clientData){
    
	
    clientData = utilPadEmptyFields(clientData)
    cl
	const URL = aws + "/clients/"
	const result = dbPostData(URL,JSON.stringify(clientData))
	if (result == "success") {
	    if (client.clientId !== undefined) {
	 	    utilCalcClientAge("db")
			utilCalcClientFamilyCounts()
			uiToggleClientViewEdit("view")
		} else {
			clientId = $('#clientId.clientForm').val()
			$('#searchField').val(clientId)
			clickSearchClients(clientId)
		}
		if (clientData != null) {
			console.log("REDO CLIENT DATA")
			uiGenSelectHTMLTable('#searchContainer', clientData, ['clientId', 'givenName', 'familyName', 'dob', 'street'],'clientTable')

			console.log(clientData)

			if (clientData.length == 1) clientTableRow = 1
			uiOutlineTableRow('clientTable', clientTableRow)
			// uiSetClientsHeader("numberAndName") MOVED TO REACT
		}
	}
	$("body").css("cursor", "default");
	uiSaveButton('client', 'SAVED!!')
	return result
}

export function dbGetNewClientID(){
    const lastIdJson = dbGetData(aws + "/clients/lastid")
    let newId = lastIdJson.lastId
    let notEmpty = true
    while (notEmpty) {
        const result = dbGetData(aws + "/clients/exists/" + newId)
        if (result.count == 0) {
            notEmpty = false
        } else {
            newId++
        }
    }
    let request = {}
    newId = newId.toString()
    request['lastId'] = newId
    const result = dbPostData(aws+"/clients/lastid",JSON.stringify(request))
    console.log(result)
    if (result !== "success") {
        console.log("Last client ID not Saved")
        return 'failed'
    }
    return newId
}

export function dbSaveServiceRecord(service){
	const URL = aws + "/clients/services"
	return dbPostData(URL, JSON.stringify(service))
}

export function dbGetService(serviceId){
	return dbGetData(aws+"/clients/services/byid/"+serviceId).services
}

export function utilRemoveEmptyPlaceholders(obj){
    // TODO NEED TO ADDRESS THIS SITUATION(key == "zipSuffix" && value == 0)) {
    for (const [key, value] of Object.entries(obj)) {
        if (value === "*EMPTY*") {
            obj[key] = ""
        } else if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
                const array = value[i]
                for (const [arrayKey, arrayVal] of Object.entries(array)) {
                    if (arrayVal === "*EMPTY*") {
                        obj[key][i][arrayKey] = ""
                    }
                }
			}
        }
    }
    return obj
}