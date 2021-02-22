//************************************************
//***** DATABASE SECTION JAVASCRIPT FUNCTIONS *****
//************************************************

import moment from 'moment';
import { utilNow, isEmpty, utilStringToArray } from './GlobalUtils';
import { calcFamilyCounts, calcDependentsAges } from './Clients/ClientUtils';
import { searchClients } from './Clients/Clients';


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

export function dbSearchClients(str) {
    const regex = /[/.]/g
    const slashCount = (str.match(regex) || []).length
    let clientsFoundTemp = window.dbSearchClients(str, slashCount)
    
    if (clientsFoundTemp == undefined || clientsFoundTemp==null || clientsFoundTemp.length==0){
      clientsFoundTemp = []
      window.servicesRendered = [] // used temporarily to keep global vars in sync
      window.uiClearCurrentClient()
    }
    return clientsFoundTemp
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


// function OLDdbPostData(URL,data){
// 	const sessionStatus = cogCheckSession()
// 	if (authorization.idToken == 'undefined' || sessionStatus == "FAILED") {
// 		utilBeep()
// 		return
// 	}
// 	let ans = "failed";
// 	$.ajax({
//     type: "POST",
//     url: URL,
// 		headers: {"Authorization": authorization.idToken},
//     async: false,
//     dataType: "json",
//     data: data,
//     contentType:'application/json',
//     success: function(message){
// 			if (typeof message.message !== 'undefined') {
// 				console.log(message.message)
// 				utilBeep()
// 			} else if (message.__type != undefined) {
// 				console.log(message.__type)
// 				console.log("ERROR")
// 				utilBeep()
// 				// TODO need proper error messaging
// 			} else {
// 				//utilBloop()
// 				ans = "success"
// 				console.log("SUCCESS")
// 				if (URL.includes('/servicetypes')) {
// 					// dbGetServiceTypes() // MOVED TO REACT
// 					uiShowServiceTypes()
// 					uiSetServiceTypeHeader()
// 					uiPopulateForm(serviceTypes, 'serviceTypes')
// 					uiSaveButton('serviceType', 'SAVED!!')
// 				}
// 			}
// 		},
// 		error: function(json){
// 				console.log("ERROR")
// 	    	console.log(json)
// 				// TODO move this to funtion and make sure all save buttons are covered
// 				if (URL.includes('/servicetypes')) {
// 					uiSaveButton('serviceType', 'ERROR!!')
// 				} else if (URL.includes('/clients')) {
// 					uiSaveButton('client', 'ERROR!!')
// 				} else if (URL.includes('/users')) {
// 					console.log("show error in button")
// 				}
// 		}
// 	})
// 	return ans
// };


async function dbPostData(subUrl, data, callback){
    callback('loading', '' )
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

            console.log(response)

            if (response.ok) {
                response.json()
                if (response.status === 200) {
                    console.log('success:', "Save Confirmed")
                    callback('success', "")
                } 
            } else {
                if (response.status === 400) {
                    console.log('error:', "Bad Request Exception")
                    callback('error', "Bad Request Exception")
                } else if (response.status === 401) {
                    console.log('error:', "Authentication Failed")
                    callback('error', "Authentication Failed")
                }else if (response.status === 403) {
                    console.log('error:', "Access Denied Exception")
                    callback('error', "Access Denied Exception")
                } else if (response.status === 404) {
                    console.log('error:', "Not Found Exception")
                    callback('error', "Not Found Exception")
                } else if (response.status === 409) {
                    console.log('error:', "Conflict Exception")
                    callback('error', "Conflict Exception")
                } else if (response.status === 413) {
                    console.log('error:', "Request Too Large")
                } else if (response.status === 429) {
                    console.log('error:', "API Configuration Error/Throttled")
                    callback('error', "API Configuration Error/Throttled")
                } else if (response.status === 500) {
                    console.log('error:', "Bad Gateway Exception")
                    callback('error', "Bad Gateway Exception")
                } else if (response.status === 502) {
                    console.log('error:', "Bad Gateway Exception")
                    callback('error', "Bad Gateway Exception")
                } else if (response.status === 503) {
                    console.log('error:', "Service Unavailable Exception")
                    callback('error', "Service Unavailable Exception")
                } else if (response.status === 504) {
                    console.log('error:', "Endpoint Request Timed-out Exception")
                    callback('error', "Endpoint Request Timed-out Exception")
                } else {
                    console.log(response.status)
                    console.log('error:', "Database can't be reached!")
                    callback('error', "Database can't be reached!")
                }
            }
        })
        .then(data => {
            console.log('Raw Data:', data);
            if (data !== undefined) {
                if (data.message === "Unauthorized") {
                    console.log('error:', 'Unauthorized Connection');
                    callback('error', 'Unauthorized Connection')
                } else {
                    console.log('Success:', data);
                    callback('success', data)
                }
            } else {
                callback('success', '')
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            callback('error', error)
        })
    } else {
        console.error('Error:', 'Session Expired');
        callback('error', 'Session Expired') 
    }
}

function OLDdbGetData(uUrl){
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
};


// async function dbGetData(subUrl, data){

// console.log("GETTING DATA")

//     let results = "failed"
//     fetch(dbUrl + subUrl, {
//         headers: {
//             'Content-Type': 'application/json',    
//             "Authorization": cachedSession.auth.idToken,
//         },
//         body: JSON.stringify(data),
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Success:', data);
//         results = "success"
    
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//     });
//     return results
// }