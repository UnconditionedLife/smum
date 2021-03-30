//************************************************
//***** DATABASE SECTION JAVASCRIPT FUNCTIONS *****
//************************************************

import moment from 'moment';
import { utilCleanUpDate, utilChangeWordCase, utilRemoveDupClients, isEmpty, utilStringToArray } from './GlobalUtils';
// import { calcFamilyCounts, calcDependentsAges } from './Clients/ClientUtils';
// import { searchClients } from './Clients/Clients';

const dbBase = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/';

//**** CACHED VARIABLES ****

let dbUrl = '';
let cachedSession = {}
let cachedSettings = null;
let cachedSvcTypes = []
const MAX_ID_DIGITS = 5

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
    cachedSession = newSession;
}

export function showCache() {
    console.log('Cached session: ');
    console.log(JSON.stringify(cachedSession));
    console.log('Settings: ');
    console.log(JSON.stringify(cachedSettings));
    console.log('DB URL: ' + dbUrl);
    console.log('Service Types: ');
    console.log(cachedSvcTypes);
}

// Utility Functions

export function dbSetUrl(instance) {
    dbUrl = dbBase + instance;
    console.log('DB URL set to ' + dbUrl)
}

export function dbSetModifiedTime(obj, isNew) {
    const now = moment().format('YYYY-MM-DDTHH:mm');
    obj.updatedDateTime = now;
    if (isNew)
        obj.createdDateTime = now;
}

// Users

export function dbGetUser(userName) {
    let result = dbFetchUrl(undefined, "/users/" + userName).users;
    if (result.length == 1)
        return result[0];
    else
        return null;
}

export async function dbSaveUser(data, callback) {
    await dbPostData('/users/', data, callback)
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
//************************************************
//******************* SESSION ********************

export function cacheSessionVar(newSession, callback) {
    cachedSession = newSession;
    if (!isEmpty(cachedSession)) {
        dbGetSettingsAsync().then( settings => { cachedSettings = settings })
        dbGetSvcTypesAsync()
            .then( svcTypes => { 
                cachedSvcTypes = svcTypes 
                if (callback) callback()  // used to call prnConnect after settings have been stored in globalVar
        })
    }
}

export function getSession(){
    return cachedSession
}

//************************************************
//**************** APP SETTINGS ******************

export async function dbGetSettingsAsync() {
    return await dbGetDataAsync("/settings")
        .then( settings => {
            const fields = ["serviceZip", "serviceCat", "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"]
            fields.forEach(x => {
                settings[x] = utilStringToArray(settings[x]);
            });
            cachedSettings = settings;
            return settings;
        })
}

export function SettingsSound() {
    if (!cachedSettings)
        dbGetSettings();
    return (cachedSettings.sounds == 'YES');
}

export function SettingsPrinter() {
    if (!cachedSettings)
        dbGetSettings();
    return (cachedSettings.printerIP);
}

export function SettingsSeniorAge() {
    if (!cachedSettings)
        dbGetSettings();
    return (parseInt(cachedSettings.seniorAge, 10));
}

export function SettingsServiceCats() {
    if (!cachedSettings)
        dbGetSettings();
    return (cachedSettings.serviceCat);
}

export function SettingsZipcodes() {
    if (!cachedSettings)
        dbGetSettings();
    return (cachedSettings.serviceZip);
}

export function SettingsSchedule() {
    if (!cachedSettings)
        dbGetSettings();
    return {
        closedDays: cachedSettings.closedDays,
        closedEveryDays: cachedSettings.closedEveryDays,
        closedEveryDaysWeek: cachedSettings.closedEveryDaysWeek,
        openDays: cachedSettings.openDays,
    };
}

//************************************************
//******************* SVCTYPES *******************

export function getSvcTypes(){
    if (isEmpty(cachedSvcTypes) && !isEmpty(cachedSession)) {
        dbGetSvcTypesAsync().then( svcTypes => { cachedSvcTypes = svcTypes })
    }
    return cachedSvcTypes
}

export function dbGetSvcTypes(){
	const temp = dbGetData(dbUrl + "/servicetypes").serviceTypes
        // case-insensitive sort
        .sort((a, b) => a.serviceName.localeCompare(b.serviceName, undefined, {sensitivity: 'base'}));
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
export async function dbGetSvcTypesAsync(){
	return await dbGetDataAsync("/servicetypes")
        .then( data => {
            const svcTypes = data.serviceTypes
            return svcTypes.sort(function(a, b){
                let nameA= a.serviceName.toLowerCase()
                let nameB= b.serviceName.toLowerCase()
                if (nameA < nameB) return -1
                if (nameA > nameB) return 1
                return 0;
            })
        }
    )
}

export function globalSvcTypes(){
    return cachedSvcTypes
}

//******************** USERS *********************
//************************************************

export async function dbGetUserAsync(userName) {
    return await dbGetDataAsync("/users/" + userName)
        .then( data => {
            const users = data.users
            if (users.length == 1)
            return users[0];
        else
            return null;
        }
    )
}

export async function dbSaveUserAsync(data, callback) {
    return await dbPostDataAsync('/users/', data, callback)
}

export async function dbGetAllUsersAsync() {
	return await dbGetDataAsync("/users").then( data => { 
        return data.users });
}

export async function utilGetCurrentUserAsync(username) {
    return await dbGetUsersAsync()
        .then( users => {
            const userList = users.filter(obj => obj.userName == username)
            if (userList.length == 1)
                return userList[0]
            else
                return null
        })
}

async function dbGetUsersAsync(){
	return await dbGetDataAsync("/users").then( data => { return data.users })
}

//******************** CLIENTS *********************
//**************************************************

export async function dbSearchClientsAsync(searchTerm) {
    const regex = /[/.]/g
    const slashCount = (searchTerm.match(regex) || []).length    
    return await dbGetClientsAsync(searchTerm, slashCount).then(
        clients => {
            if (clients == undefined || clients == null || clients.length == 0){
                clients = []
                window.servicesRendered = [] // used temporarily to keep global vars in sync
                window.uiClearCurrentClient() // used temporarily to keep global vars in sync
            }
            return clients
        }
    )
}

async function dbGetClientsAsync(searchTerm, slashCount){
	let clientData = []
	if (slashCount == 2){
		searchTerm = utilCleanUpDate(searchTerm)
		searchTerm = moment(searchTerm, 'MM/DD/YYYY').format('YYYY-MM-DD')
		return await dbGetDataAsync("/clients/dob/" + searchTerm).then(data => { return data.clients })
	} else if (!isNaN(searchTerm) && searchTerm.length < MAX_ID_DIGITS){
		return await dbGetDataAsync("/clients/" + searchTerm).then(data => { return data.clients })
	} else if (searchTerm.includes(" ")){
		searchTerm = utilChangeWordCase(searchTerm)
		let split = searchTerm.split(" ")
//*** TODO deal with more than two words ***
		const d1 = await dbGetDataAsync("/clients/givenname/" + split[0]).then(data => { return data.clients })
		const d2 = await dbGetDataAsync("/clients/familyname/" + split[0]).then(data => { return data.clients })
		const d3 = await dbGetDataAsync("/clients/givenname/" + split[1]).then(data => { return data.clients })
		const d4 = await dbGetDataAsync("/clients/familyname/" + split[1]).then(data => { return data.clients })
		return utilRemoveDupClients(d1.concat(d2).concat(d3).concat(d4))
	} else if (clientData==null||clientData.length==0){
		searchTerm = utilChangeWordCase(searchTerm)
		const d2 = await dbGetDataAsync("/clients/givenname/" + searchTerm).then(data => { return data.clients })
		const d1 = await dbGetDataAsync("/clients/familyname/" + searchTerm).then(data => { return data.clients })
		if (d1.length > 0 && d2.length < 1){
			return utilRemoveDupClients(d1.concat(d2))
		}	else if (d2.length > 0){
			return utilRemoveDupClients(d2.concat(d1))
		}
	}
}



// Utility Functions

export function dbSetUrl(instance) {
    dbUrl = dbBase + instance;
    console.log('DB URL set to ' + dbUrl)
}

export function dbSetModifiedTime(obj, isNew) {
    const now = moment().format('YYYY-MM-DDTHH:mm');
    obj.updatedDateTime = now;
    if (isNew)
        obj.createdDateTime = now;
}



// Clients

// export async function dbGetClientAsync(clientId) {
//     return await dbGetDataAsync("/clients/" + clientId)
//         .then( data => {
//             let result = data.clients
//             if (result.length == 1)
        
//                 return result[0];
//             else
//                 return null;

//         }).clients;


// }


export async function dbGetClientActiveServiceHistoryAsync(clientId){
    return await dbGetDataAsync("/clients/services/" + clientId).then(data => { 

        console.log(data)
        const svcs = data.services
        const activeSvcs = svcs.filter(item => item.serviceValid == "true")
            .sort((a, b) => moment.utc(b.servicedDateTime).diff(moment.utc(a.servicedDateTime))) 
    
        console.log(activeSvcs)
        return activeSvcs
    })
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

export async function dbSaveClient(data, callback){
	if (data.clientId === "0") {
        dbSetModifiedTime(data, true);
        dbGetNewClientIDAsync()
            .then( newClientId => {
                
                console.log("GET CLIENT ID")
                console.log(data.clientId)

                if (data.clientId === 'failed') { 
                    callback('error', 'Unable to get new client ID')
                    return
                }
                data.clientId = newClientId
            }
        )
	} else {
        dbSetModifiedTime(data, false);
	}
    await dbPostDataAsync("/clients/", data, callback)
}

// export function dbSaveClient(data){
//     data = utilEmptyPlaceholders(data, "add") // "add" or "remove"
// 	const URL = aws + "/clients/"
// 	const result = dbPostData(URL,JSON.stringify(data))
// 	if (result == "success") {
// 		searchClients(data.clientId)
// 	}
// 	return result
// }

export async function dbGetNewClientIDAsync(){
    function postCallback(response, msg){
        if (response !== "success") {
            console.log("Last client ID not Saved - ", msg)
            return 'failed'
        }
    }

    return await dbGetDataAsync("/clients/lastid")
        .then( async data => {

            console.log(data)

            let newId = data.lastId
            let notEmpty = true
            while (notEmpty) {
                return await dbGetDataAsync("/clients/exists/" + newId)
                    .then( data => {
                        if (data.count == 0) {
                            notEmpty = false
                        } else {
                            newId++
                        }
                        let request = {}
                        request['lastId'] = newId.toString()
                        dbPostDataAsync("/clients/lastid", JSON.stringify(request), postCallback)
                        return newId
                    })
            }
        })
}

export async function dbSaveServiceRecord(service){
	return dbPostDataAsync("/clients/services", JSON.stringify(service))
}

// formerly utilGetServicesInMonth in app.js
export async function dbGetSvcsInMonthAsync(monthYear){

console.log("Month Year")
console.log(monthYear)

	const currentMonth = moment().format("YYYYMM")
	let daysInMonth = moment(monthYear, "YYYYMM").daysInMonth()
	if (monthYear == currentMonth) daysInMonth = moment().format("D")
	let monthOfSvcs = []
	daysInMonth = parseInt(daysInMonth) + 1
    // Loop through days of month
	for (var i = 1; i < daysInMonth; i++) {
		const day = String(i).padStart(2, '0')
		const dayDate = monthYear + day
		monthOfSvcs = monthOfSvcs.concat(await dbGetDaysSvcsAsync(dayDate).then( svcs => { return svcs }))
	}
	return monthOfSvcs
}

export async function dbGetServiceAsync(serviceId){
	return await dbGetDataAsync("/clients/services/byid/" + serviceId).then( data => { return data.services})
}

export function utilEmptyPlaceholders(obj, action){ // action = "add" or "remove"
    const fromVal = (action === "remove") ? "*EMPTY*" : ""
    const toVal = (action === "add") ? "*EMPTY*" : ""
    for (const [key, value] of Object.entries(obj)) {
        if (value === fromVal || value === undefined) {
            obj[key] = toVal
        } else if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
                const array = value[i]
                for (const [arrayKey, arrayVal] of Object.entries(array)) {
                    if (arrayVal === fromVal) {
                        obj[key][i][arrayKey] = toVal
                    }
                }
			}
        }
    }
    return obj
}
// *******************************************************************************************************
// ************************************* UNEXPORTED FUNCTIONS ********************************************
// *******************************************************************************************************

async function dbGetDaysSvcsAsync(dayDate){
    return await dbGetDataAsync("/clients/services/byday/" + dayDate).then(data => { return data.services })
}



function getMessage(code, method) {
    let match = statusMessages.find(x => x.code == code);
    if (match.msg === "Success") match.msg = (method === "GET") ? "Load Confirmed" : "Save Confirmed"
    if (match)
        return match.msg;
    else
        return 'Unknown Error ' + code;
}

// NOT CURRENTLY BEING CALLED
// async function  dbGetDaysServicesAsync(dayDate){
// 	dayDate = moment(dayDate).format("YYYYMMDD")
// 	return dbGetDataAsync("/clients/services/byday/" + dayDate ).then( data => { return data.services })
// }

// *******************************************************************************************************
// **************************************  DATABASE GET & POST FUNCTIONS *********************************
// *******************************************************************************************************

const statusMessages = [
    {code: 200, msg: 'Success'},
    {code: 400, msg: 'Bad Request Exception'},
    {code: 401, msg: 'Authentication Failed'},
    {code: 403, msg: 'Access Denied Exception'},
    {code: 404, msg: 'Not Found Exception'},
    {code: 409, msg: 'Conflict Exception'},
    {code: 413, msg: 'Request Too Large'},
    {code: 429, msg: 'API Configuration Error/Throttled'},
    {code: 500, msg: 'Internal Server Error'},
    {code: 502, msg: 'Bad Gateway Exception'},
    {code: 503, msg: 'Service Unavailable Exception'},
    {code: 504, msg: 'Endpoint Request Timed-out Exception'},
];

async function dbPostDataAsync(subUrl, data, callback) {
    callback('working', '');

    return fetch(dbUrl + subUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',    
            "Authorization": cachedSession.auth.idToken,
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        const message = getMessage(response.status, "POST");

        if (response.ok) {
            console.log('success:', message);
            callback('success', message);
        } else {
            console.log('error:', message);
            callback('error', message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        callback('error', error)
    })
}

async function dbGetDataAsync(subUrl){
    // callback('working', '' )
    console.log("Starting fetch...")

    return await fetch(dbUrl + subUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',    
            "Authorization": cachedSession.auth.idToken,
        }
    })
    .then(response => {
        const message = getMessage(response.status, "GET");
        if (response.ok) {
            console.log('success:', message);
            // callback('success', message);
        } else {
            console.log('error:', message);
            // callback('error', message);
        }
        return response.json()
    })
    .then(data => {
        console.log(data)
        return data
    })
    .catch((error) => {
        console.error('Error:', error);
        // callback('error', error)
    })
}