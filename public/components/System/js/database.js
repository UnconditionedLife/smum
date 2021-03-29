//************************************************
//***** DATABASE SECTION JAVASCRIPT FUNCTIONS *****
//************************************************

import moment from 'moment';
import { utilCleanUpDate, utilChangeWordCase, utilRemoveDupClients, isEmpty, utilStringToArray } from './GlobalUtils';
import { calcFamilyCounts, calcDependentsAges } from './Clients/ClientUtils';
import { searchClients } from './Clients/Clients';


const dbBase = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/';

//**** CACHED VARIABLES ****

let dbUrl = '';
let cachedSession = {}
let cachedSettings = null;
let cachedSvcTypes = []
const MAX_ID_DIGITS = 5

function dbFetchUrl(session, subUrl) {
    return dbGetData(dbUrl + subUrl);
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


// ServiceTypes

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

export function dbGetClientActiveServiceHistory(clientId){

console.log('GET HISTORY FROM DB')

    let history = dbGetData(dbUrl + "/clients/services/" + clientId).services
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

export async function dbSaveClient(data, callback){
	if (data.clientId === "0") {
        dbSetModifiedTime(data, true);
        data.clientId = dbGetNewClientID()

console.log("GET CLIENT ID")
console.log(data.clientId)

        if (data.clientId === 'failed') callback('error', 'Unable to get new client ID')
	} else {
        dbSetModifiedTime(data, false);
        // DELETE svcHistory, svcsRendered from client before saving
        // delete data.svcHistory
        // delete data.svcsRendered
        // Assign dependents, lastServed, and notes arrays if undefined
		// if (data.dependents === undefined) data.dependents = []
        // if (data.lastServed === undefined) data.lastServed = []
        // if (data.notes === undefined) data.notes = []
        // DELETE Age fields
        // delete data.age
		// for (var i = 0; i < data.dependents.length; i++) delete data.dependents[i].age
	}
    const subUrl = "/clients/"
    await dbPostData(subUrl, data, callback)
}

export function dbSearchClients(searchTerm) {
    const regex = /[/.]/g
    const slashCount = (searchTerm.match(regex) || []).length    
    let clientsFoundTemp = dbGetClients(searchTerm, slashCount)    
    if (clientsFoundTemp == undefined || clientsFoundTemp==null || clientsFoundTemp.length==0){
      clientsFoundTemp = []
      window.servicesRendered = [] // used temporarily to keep global vars in sync
      window.uiClearCurrentClient()
    }
    return clientsFoundTemp
}

function dbGetClients(searchTerm, slashCount){
	let clientData = []
	if (slashCount == 2){
		searchTerm = utilCleanUpDate(searchTerm)
		searchTerm = moment(searchTerm, 'MM/DD/YYYY').format('YYYY-MM-DD')
		clientData = dbGetData(dbUrl + "/clients/dob/" + searchTerm).clients
	} else if (!isNaN(searchTerm) && searchTerm.length < MAX_ID_DIGITS){
		clientData = dbGetData(dbUrl + "/clients/" + searchTerm).clients
	} else if (searchTerm.includes(" ")){
		searchTerm = utilChangeWordCase(searchTerm)
		let split = searchTerm.split(" ")
//*** TODO deal with more than two words ***
		let d1 = dbGetData(dbUrl + "/clients/givenname/" + split[0]).clients
		let d2 = dbGetData(dbUrl + "/clients/familyname/" + split[0]).clients
		let d3 = dbGetData(dbUrl + "/clients/givenname/" + split[1]).clients
		let d4 = dbGetData(dbUrl + "/clients/familyname/" + split[1]).clients
		clientData = utilRemoveDupClients(d1.concat(d2).concat(d3).concat(d4))
	} else if (clientData==null||clientData.length==0){
		searchTerm = utilChangeWordCase(searchTerm)
		let d2 = dbGetData(dbUrl + "/clients/givenname/" + searchTerm).clients
		let d1 = dbGetData(dbUrl + "/clients/familyname/" + searchTerm).clients
		if (d1.length > 0 && d2.length < 1){
			clientData = utilRemoveDupClients(d1.concat(d2))
		}	else if (d2.length > 0){
			clientData = utilRemoveDupClients(d2.concat(d1))
		}
	}
	return clientData
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

export function dbGetNewClientID(){

    function postCallback(response, msg){
        if (response !== "success") {
            console.log("Last client ID not Saved - ", msg)
            return 'failed'
        }
    }

    const lastIdJson = dbGetData(dbUrl + "/clients/lastid")

console.log(lastIdJson)

    let newId = lastIdJson.lastId
    let notEmpty = true
    while (notEmpty) {
        const result = dbGetData(dbUrl + "/clients/exists/" + newId)
        if (result.count == 0) {
            notEmpty = false
        } else {
            newId++
        }
    }
    let request = {}
    request['lastId'] = newId.toString()
    dbPostData("/clients/lastid", JSON.stringify(request), postCallback)
    return newId
}

export function dbSaveServiceRecord(service){
	const URL = dbUrl + "/clients/services"
	return dbPostData(URL, JSON.stringify(service))
}

// formerly utilGetServicesInMonth in app.js
export function dbGetSvcsInMonth(monthYear){

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
		const dayOfSvcs = dbGetDaysSvcs(dayDate)
		monthOfSvcs = monthOfSvcs.concat(dayOfSvcs)
	}
	return monthOfSvcs
}

export function dbGetService(serviceId){
	return dbGetData(dbUrl + "/clients/services/byid/" + serviceId).services
    //return dbFetchUrl(cachedSession, "/clients/services/byid/" + serviceId).services;
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

// UNEXPORTED FUNCTIONS

function dbGetUsers(){
	return dbGetData(dbUrl + "/users").users
}

function dbGetDaysSvcs(dayDate){
	const subUrl = "/clients/services/byday/" + dayDate
    return dbGetData(dbUrl + subUrl).services
}

const statusMessages = [
    {code: 200, msg: 'Save Confirmed'},
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

function getMessage(code) {
    const match = statusMessages.find(x => x.code == code);
    if (match)
        return match.msg;
    else
        return 'Unknown Error ' + code;
}

async function dbPostData(subUrl, data, callback) {
    callback('working', '');
    if (cachedSession.auth) {
        return fetch(dbUrl + subUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',    
                "Authorization": cachedSession.auth.idToken,
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            let message = getMessage(response.status);

            if (response.ok) {
                console.log('success:', message);
                callback('success', message);
            } else {
                console.log('error:', message);
                callback('error', message);
            }
        })
        // .then(data => {
        //     XXX data is always undefined, so this always returns success
        //     XXX Pretty sure this block of code should be deleted
        //     console.log('Raw Data:', data);
        //     if (data !== undefined) {
        //         if (data.message === "Unauthorized") {
        //             console.log('error:', 'Unauthorized Connection');
        //             callback('error', 'Unauthorized Connection')
        //         } else {
        //             console.log('Success:', 'Save Confirmed');
        //             callback('success', 'Save Confirmed')
        //         }
        //     } else {
        //         callback('success', 'Save Confirmed')
        //     }
        // })
        .catch((error) => {
            console.error('Error:', error);
            callback('error', error)
        })
    } else {
        console.error('Error:', 'Session Expired');
        callback('error', 'Session Expired') 
    }
}

function dbGetData(uUrl){
	cogCheckSession()
	let urlNew = uUrl;
	let ans = null;
// TODO /// move Ajax calls to [.done .fail . always syntax]
	$.ajax({
    type: "GET",
    url: urlNew,
		headers: {"Authorization": authorization.idToken},
    async: false,
    dataType: "json",
		contentType:'application/json',
    success: function(json){
			if (json!==undefined) {
				// console.log(urlNew)
			}
    	ans = json
		},
		statusCode: {
			401: function() {
console.log("Error: 401")
				cogLogoutUser()
				//$(loginError).html("Sorry, your session has expired.")
				console.log("Session Expired")
			},
			0: function() {
console.log("Error: 0")
				console.log("Status code: 0")
				cogLogoutUser()
				$(loginError).html("Sorry, your session has expired.")
				console.log("Unauthorized")
			}
		},
		error: function(jqXHR, status, error){
			// utilErrorHandler(message, status, error, "aws")
			// console.log(jqXHR)
			console.log(jqXHR.status)
			// console.log(jqXHR + ", " + status + ", " + error)
			// // alert(error);
			// // TODO try to capture the error 401 - ????
			// // TODO add same error handling to dbPostData
			//
			// console.log(typeof error)
			//
			// // if (error.indexOf("NetworkError: Failed to execute 'send' on 'XMLHttpRequest'") > -1) {
			// 	cogLogoutUser()
			// 	$('#nav5').html('Login')
			// 	$('#nav4').html('')
			// 	$(loginError).html("Sorry, your session has expired.")
			// //}

			// if (message.readyState == 0) {
			// 	console.log("Error of some kind!")
			// }
		}
	}).done(function(data, textStatus, jqXHR) {
    //console.log("DONE")
		//console.log(data)
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.log("status", jqXHR.status)
		if (jqXHR.status == 0) {

        }
        if (errorThrown) {
	    	console.log("errorThrown", errorThrown)
            console.log("errorThrown", JSON.parse(errorThrown))
        }

		// if (errorThrown.includes("DOMException: Failed to execute 'send' on 'XMLHttpRequest':")){
		// 	console.log("ACCESS ERROR") // force logon
		// }
	}).always(function (data, textStatus, jqXHR) {
    // TODO most likely remove .always
	})
// console.log(JSON.stringify(ans))
	return ans
}

function dbGetDaysServices(dayDate){
	dayDate = moment(dayDate).format("YYYYMMDD")
	return dbGetData(dbUrl + "/clients/services/byday/"+dayDate).services
}


// async function dbGetData(subUrl, data, callback){
//     callback('loading', '' )
//     if (cachedSession.auth) {
//         return fetch(dbUrl + subUrl, {
//             headers: {
//                 'Content-Type': 'application/json',    
//                 "Authorization": cachedSession.auth.idToken,
//             },
//             body: JSON.stringify(data),
//         })
//         .then(response => {

//             console.log(response)

//             if (response.ok) {
//                 response.json()
//                 if (response.status === 200) {
//                     console.log('success:', "Save Confirmed")
//                     callback('success', "")
//                 } 
//             } else {
//                 if (response.status === 400) {
//                     console.log('error:', "Bad Request Exception")
//                     callback('error', "Bad Request Exception")
//                 } else if (response.status === 401) {
//                     console.log('error:', "Authentication Failed")
//                     callback('error', "Authentication Failed")
//                 }else if (response.status === 403) {
//                     console.log('error:', "Access Denied Exception")
//                     callback('error', "Access Denied Exception")
//                 } else if (response.status === 404) {
//                     console.log('error:', "Not Found Exception")
//                     callback('error', "Not Found Exception")
//                 } else if (response.status === 409) {
//                     console.log('error:', "Conflict Exception")
//                     callback('error', "Conflict Exception")
//                 } else if (response.status === 413) {
//                     console.log('error:', "Request Too Large")
//                 } else if (response.status === 429) {
//                     console.log('error:', "API Configuration Error/Throttled")
//                     callback('error', "API Configuration Error/Throttled")
//                 } else if (response.status === 500) {
//                     console.log('error:', "Bad Gateway Exception")
//                     callback('error', "Bad Gateway Exception")
//                 } else if (response.status === 502) {
//                     console.log('error:', "Bad Gateway Exception")
//                     callback('error', "Bad Gateway Exception")
//                 } else if (response.status === 503) {
//                     console.log('error:', "Service Unavailable Exception")
//                     callback('error', "Service Unavailable Exception")
//                 } else if (response.status === 504) {
//                     console.log('error:', "Endpoint Request Timed-out Exception")
//                     callback('error', "Endpoint Request Timed-out Exception")
//                 } else {
//                     console.log(response.status)
//                     console.log('error:', "Database can't be reached!")
//                     callback('error', "Database can't be reached!")
//                 }
//             }
//         })
//         .then(data => {
//             console.log('Raw Data:', data);
//             if (data !== undefined) {
//                 if (data.message === "Unauthorized") {
//                     console.log('error:', 'Unauthorized Connection');
//                     callback('error', 'Unauthorized Connection')
//                 } else {
//                     console.log('Success:', data);
//                     callback('success', data)
//                 }
//             } else {
//                 callback('error', 'No Data Returned')
//             }
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             callback('error', error)
//         })
//     } else {
//         console.error('Error:', 'Session Expired');
//         callback('error', 'Session Expired') 
//     }
// }
