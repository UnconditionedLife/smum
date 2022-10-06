//************************************************
//***** DATABASE SECTION JAVASCRIPT FUNCTIONS *****
//************************************************

import moment from 'moment';
import { utilArrayToObject, utilCleanUpDate, utilChangeWordCase, utilRemoveDupClients, utilStringToArray, isEmpty } from './GlobalUtils';
import { calDecodeRules, calEncodeRules } from './Calendar';
// import { calcFamilyCounts, calcDependentsAges } from './Clients/ClientUtils';
// import { searchClients } from './Clients/Clients';
import { prnConnect } from './Clients/Receipts';
import jwt_decode from 'jwt-decode';

const dbBase = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/';

//**** CACHED VARIABLES ****

let dbUrl = '';
let cachedSession = null;
let cachedSettings = null;
let cachedSvcTypes = []
let cachedAppVersion = "";
const MAX_ID_DIGITS = 5

export let globalMsgFunc = null;

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function showCache() {
    console.log('Cached session:', cachedSession);
    console.log('Settings:', cachedSettings);
    console.log('DB URL:',  dbUrl);
    console.log('Service Types:', cachedSvcTypes);
    console.log('AppVer:', cachedAppVersion);
}

//**************** GLOBAL MESSAGE *****************
//*************************************************

export function setGlobalMsgFunc(callback) {
    globalMsgFunc = callback
}

//******************* SESSION ********************
//************************************************

export function cacheSessionVar(newSession) {
    cachedSession = newSession;
    if (newSession.user)
        cachedSession.user = { userName: newSession.user.userName, userRole: newSession.user.userRole }
    cachedSession.editingState = false;
    console.log('New session:', cachedSession)
}

export function sessionTimeRemaining() {
    let decodedTkn = jwt_decode(cachedSession.auth.idToken);
    return decodedTkn.exp*1000 - new Date().getTime();
}

export function navigationAllowed() {
    let minutes = Math.round(sessionTimeRemaining() / 60000);
    const warningMinutes = 30;

    if (getEditingState()) {
        globalMsgFunc('error', "Edit in progress. Save or Cancel before changing screens.");
        return false;
    }
    else if (minutes < 0) {
        globalMsgFunc('warning', 'Session is expired. Log out and back in again.');
        return false;
    }
    else if (minutes < warningMinutes)
        globalMsgFunc('warning', 'Session will expire in ' + minutes + ' minutes. Log out and back in again.') 
    return true;
}

export function initCache() {
    dbGetSettingsAsync()
        .then( settings => { 
            cachedSettings = settings;
            prnConnect(settings);
        });
    
    dbGetSvcTypesAsync()
        .then( svcTypes => { 
            cachedSvcTypes = svcTypes;
            console.log("svcTypes", svcTypes)
        });
}

export function clearCache() {
    cachedSession = null;
    cachedSettings = null;
    cachedSvcTypes = [];
    cachedAppVersion = "";
}

export function getSession() {
    return cachedSession;
}

export function getUserName() {
    return cachedSession?.user?.userName;
}

export function isAdmin() {
    return ['Admin', 'TechAdmin'].includes(cachedSession?.user?.userRole);
}

export function isTechAdmin() {
    return cachedSession?.user?.userRole === 'TechAdmin';
}

export function getCognitoHandle() {
    return cachedSession?.cogUser;
}

export function getEditingState() {
    return cachedSession?.editingState;
}

export function setEditingState(newState) {
    cachedSession.editingState = newState
}

export function setAppVersion(newVersion) {
    cachedAppVersion = newVersion.toString()
}

export function getAppVersion() {
    return cachedAppVersion
}

//**************** APP SETTINGS ******************
//************************************************

export async function dbGetSettingsAsync() {
    return await dbGetDataPageAsync("/settings")
        .then( settings => {
            const fields = ["serviceZip", "serviceCat", "calClosed",
                "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"];
            fields.forEach(x => {
                settings[x] = utilStringToArray(settings[x]);
            });
            Object.assign(settings, calDecodeRules(settings));

            cachedSettings = settings;
            return settings;
        });
}

export async function dbSaveSettingsAsync(settings) {
    let data = { ... settings };
    data.calClosed = calEncodeRules(data.calClosed);
    const fields = ["serviceZip", "serviceCat", "calClosed", 
        "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"];
    fields.forEach(x => {
        data[x] = utilArrayToObject(data[x]);
    });

    return await dbPostDataAsync('/settings/', data)
        .then( () => {
            cachedSettings = settings;
        });
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
        calClosed: cachedSettings.calClosed,
    };
}

//************************************************
//******************* SVCTYPES *******************
//******************* OLD TABLE ******************

export async function dbGetOldSvcTypesAsync() {
    return await dbGetDataAsync("serviceTypes", "/servicetypes")
        .then(svcTypes => {
            // case-insensitive sort
            return  svcTypes.sort((a, b) => a.svcName.localeCompare(b.svcName, undefined, {sensitivity: 'base'}));
        }
    )
}

//************************************************
//******************* SVCTYPES *******************
//******************* NEW TABLE ******************

export async function dbGetSvcTypesAsync(){
    return await dbGetDataAsync("serviceTypes", "/svctypes")
        .then(serviceTypes => {
            // case-insensitive sort
            return  serviceTypes.sort((a, b) => a.svcName.localeCompare(b.svcName, undefined, {sensitivity: 'base'}));
        }
    )
}



export function getSvcTypes(){
    return cachedSvcTypes    
}

// ********* BEFORE MIGRATION TO NEW TABLE *****
// export async function dbSaveSvcTypeAsync(data) {
//     return await dbPostDataAsync('/servicetypes/', data)
// }
// ********* BEFORE MIGRATION TO NEW TABLE *****

export async function dbSaveSvcTypeAsync(data) {
    // return await dbPostDataAsync('/svctypes/', MakeNewSvcType(data))
    return await dbPostDataAsync('/svctypes/', data)
}

// *********** USED FOR MIGRATION ONLY **************
export async function dbMigrateSvcTypeAsync(data) {
    return await dbPostDataAsync('/svctypes/', data)
}

//******************** USERS *********************
//************************************************

export async function dbGetUserAsync(userName) {
    return await dbGetDataAsync("users", "/users/" + userName)
        .then( users => {
            if (users.length == 1)
                return users[0];
            else
                return Promise.reject('User not found');
        }
    )
}

export async function dbGetAllUsersAsync() {
	return await dbGetDataAsync("users", "/users");
}

export async function dbSaveUserAsync(data) { 
    return await dbPostDataAsync('/users/', data);
}

//******************** CLIENTS ********************
//*************************************************

export async function dbSearchClientsAsync(searchTerm) {
    const dateRegex = /^\d+[./-]\d+[./-]\d+/g
    const isDate = dateRegex.test(searchTerm) //checks to see if search term is a date
    // const regex = /[/.]/g was used to do dash count
    // const slashCount = (searchTerm.match(regex) || []).length

    return await dbGetClientsAsync(searchTerm, isDate).then(
        clients => {
            if (clients == undefined || clients == null || clients.length == 0){
                clients = []
            }
            return clients
        }
    )
}

async function dbGetClientsAsync(searchTerm, isDate){
	let clientData = []
	if (isDate){
		searchTerm = utilCleanUpDate(searchTerm)
		// searchTerm = moment(searchTerm, 'MM-DD-YYYY').format('YYYY-MM-DD') // moved to utilCleanUpDate
		return await dbGetDataAsync("clients", "/clients/dob/" + searchTerm)
	} else if (!isNaN(searchTerm) && searchTerm.length < MAX_ID_DIGITS){
		return await dbGetDataAsync("clients", "/clients/" + searchTerm)
	} else if (searchTerm.includes(" ")){
		searchTerm = utilChangeWordCase(searchTerm)
		let split = searchTerm.split(" ")
//*** TODO deal with more than two words ***
		const d1 = await dbGetDataAsync("clients", "/clients/givenname/" + split[0])
		const d2 = await dbGetDataAsync("clients", "/clients/familyname/" + split[0])
		const d3 = await dbGetDataAsync("clients", "/clients/givenname/" + split[1])
		const d4 = await dbGetDataAsync("clients", "/clients/familyname/" + split[1])
		return utilRemoveDupClients(d1.concat(d2).concat(d3).concat(d4))
	} else if (clientData==null||clientData.length==0){
		searchTerm = utilChangeWordCase(searchTerm)
		const d2 = await dbGetDataAsync("clients", "/clients/givenname/" + searchTerm)
		const d1 = await dbGetDataAsync("clients", "/clients/familyname/" + searchTerm)
		if (d1.length > 0 && d2.length < 1){
			return utilRemoveDupClients(d1.concat(d2))
		}	else if (d2.length > 0){
			return utilRemoveDupClients(d2.concat(d1))
		}
	}
}

export async function dbGetSingleClientAsync(clientId) {
    return await dbGetDataAsync("clients", "/clients/" + clientId)
        .then(result => {
            if (result.length === 1)
                return result[0];
            else
                return null;
        })
}

export async function dbGetNewClientIDAsync(){
    let emptyId = 0
    let newId = await dbGetDataPageAsync("/clients/lastid")
        .then( async data => { return parseInt(data.lastId) + 1 })

    while(emptyId === 0) {
        emptyId = await dbGetDataPageAsync("/clients/exists/" + newId)
            .then( data => {
                if (data.count == 0) {
                    emptyId = newId
                } else {
                    newId++
                }
                return emptyId
            })
    }
    const request = { lastId: newId.toString() }
    dbPostDataAsync("/clients/lastid", request)
        .catch( msg => {
            globalMsgFunc('error', 'New Client ID save failed')
            console.log('New Client ID save failed', msg);
        });
    return emptyId
}

// ***************************************************************
// *****************  OLD TABLE USED FOR MIGRATION ***************
export async function dbGetClientActiveServiceHistoryAsync(clientId){
    return await dbGetDataAsync("services", "/clients/services/" + clientId)
}
// *****************  OLD TABLE USED FOR MIGRATION ***************
// ***************************************************************



// ***************************************************************
// *********************** NEW SVCS DATABASE *************************
export async function dbGetClientActiveSvcHistoryAsync(clientId){
    console.log("GET HISTORY", clientId);
    const paramObj = { cid: clientId }
    return await dbGetDataAsync("svcs", "/clients/svcs/bycid/", paramObj)
        .then(svcs => {
            return svcs.filter(item => item.svcValid === true);
        })
}

export async function dbGetAllClientSvcsAsync(clientId){
    const paramObj = { cid: clientId }
    return await dbGetDataAsync("svcs", "/clients/svcs/bycid/", paramObj)
}

// *********************** NEW SVCS DATABASE *************************
// ***************************************************************



export async function dbSaveClientAsync(data) {
	if (data.clientId === "0") {
        dbSetModifiedTime(data, true);
        return await dbGetNewClientIDAsync()
            .then( async newClientId  => {
                if ( newClientId ) {
                    data.clientId = newClientId
                    // getNewClient(newClientId)
                    const result = await dbPostDataAsync("/clients/", data)
                    if (isEmpty(result)) {
                        result.clientId = newClientId
                        return result
                    } else {
                        return result
                    }
                } else {
                    globalMsgFunc('error', 'New Client ID Failure') 
                }
            }
        )
	} else {
        dbSetModifiedTime(data, false);
        return await dbPostDataAsync("/clients/", data)
	}
}

// ***************************************************************
// *********************** NEW SVCS DATABASE *************************
export async function dbSaveServicePatchAsync(svc) {
	// return await dbPostDataAsync("/clients/svcs", makeNewSvc(svc))
    return await dbPostDataAsync("/clients/svcs", svc)
}

export async function dbSaveServiceRecordAsync(svc) {
    // to be used in production
    // return await dbPostDataAsync("/clients/svcs", makeNewSvc(svc))

    // to be used during migration period
    // return await dbPostDataAsync("/clients/svcs", makeNewSvc(svc))
    return await dbPostDataAsync("/clients/svcs", svc)
        .then( async (r) => {
            if (Object.keys(r).length === 0) {
                const svcTypes = getSvcTypes()
                const svcArray = []
                svcArray.push(svc)
                const oldSvc = makeOldServices(svcArray)
                svcTypes.forEach(s => {
                    if (s.svcTypeId === oldSvc.svcTypeId) 
                        oldSvc.svcTypeId = s.serviceOldTypeId
                });
                return await dbPostDataAsync("/clients/services", oldSvc[0])
            } else
                return r 
        })
}

export async function dbSaveSvcAsync(svc) {
	return await dbPostDataAsync("/clients/svcs", svc)
}
// *********************** NEW SVCS DATABASE *************************
// ***************************************************************




// export async function dbGetDaysSvcsAsync(dayDate){
//     return await dbGetDataAsync("services", "/clients/services/byday/" + dayDate)
// }


// *********************** NEW SVCS DATABASE *************************
// ***************************************************************
export async function dbGetAllSvcsByDateAsync(month, svcCat, date) {
    const paramObj = { month: month }
    if (svcCat) paramObj.svccat = svcCat
    if (date) paramObj.date = date

    return await dbGetDataAsync("svcs", "/clients/svcs/bymonth", paramObj)
        .then(svcs => {
            return svcs
        })
}

export async function dbGetValidSvcsByDateAsync(month, svcCat, date) {
    const paramObj = { month: month }
    if (svcCat) paramObj.svccat = svcCat
    if (date) paramObj.date = date

    return await dbGetDataAsync("svcs", "/clients/svcs/bymonth", paramObj)
        .then(svcs => {
            return svcs.filter(item => item.svcValid == true);
        })
}

// *********************** NEW SVCS DATABASE *************************
// ***************************************************************

// export async function dbGetSvcsByIdAndYear(serviceTypeId, year) {
// 	return await dbGetDataAsync("services", "/clients/services/byservicetype/" + serviceTypeId)
//             .then( data => { 
//                 return data
//                 .filter(item => item.serviceValid == 'true')
//                 .filter(item => moment(item.svcDT).year() == year)
//             })					
// }

// formerly utilGetServicesInMonth in app.js
export async function dbGetSvcsInMonthAsync(monthYear){    
    const currentMonth = moment().format("YYYYMM")
    let daysInMonth = moment(monthYear, "YYYYMM").daysInMonth()
    if (monthYear == currentMonth) daysInMonth = moment().format("D")
    let monthOfSvcs = []
    daysInMonth = parseInt(daysInMonth) + 1
    // Loop through days of month
    for (var i = 1; i < daysInMonth; i++) {
        const day = String(i).padStart(2, '0')
        const dayDate = monthYear + day
        monthOfSvcs = monthOfSvcs.concat(await dbGetValidSvcsByDateAsync(dayDate).then( svcs => { return svcs }))
    }
    return monthOfSvcs
}

// ***** NOT USED *****
export async function dbGetServiceAsync(svcId) {
	return await dbGetDataAsync("services", "/clients/services/byid/" + svcId)
}
// ***** NOT USED *****

// export async function dbSaveLastServedAsync(client, serviceTypeId, serviceCategory, itemsServed, isUSDA){
// 	const serviceDateTime = moment().format('YYYY-MM-DDTHH:mm')
//     const newClient = Object.assign({}, client)
// 	const newRecord = { serviceTypeId, serviceDateTime, serviceCategory, itemsServed, isUSDA }
// 	const newLastServed = []
// 	let notPushed = true
// 	if (newClient.lastServed) {
// 		newClient.lastServed.forEach((svcRecord) => {
//             if (serviceTypeId == svcRecord.serviceTypeId) {
// 				notPushed = false
// 				newLastServed.push(newRecord)
// 			} else {
// 				newLastServed.push(svcRecord)
// 			}
//         })
// 	}
// 	if (notPushed) newLastServed.push(newRecord)
// 	newClient.lastServed = newLastServed
//     return await dbSaveClientAsync(newClient).then(() => {
//         return newLastServed
//     })
// }

//******************* REPORTS *********************
//*************************************************

export async function dbGetEthnicGroupCountAsync(ethnicGroup){

    console.log("CACHED SESSION", cachedSession)

    return await dbGetDataPageAsync("/clients/ethnicgroup/" + ethnicGroup)
        .then( data => { return data.count})
}

// NOT CURRENTLY BEING CALLED
// async function  dbGetDaysServicesAsync(dayDate){
// 	dayDate = moment(dayDate).format("YYYYMMDD")
// 	return dbGetDataAsync("services", "/clients/services/byday/" + dayDate )
// }

//******************* UTILITIES *******************
//*************************************************

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
// **************************************  DATABASE GET & POST FUNCTIONS *********************************
// *******************************************************************************************************

const httpCodes = [
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

function httpMessage(result) {
    let match = httpCodes.find(x => x.code == result);
    if (match)
        return match.msg;
    else
        return 'Unknown Error ' + result;
}

// convert LastEvaluatedKey to map
function stringToMap(string) {
    let newString = string.replaceAll('{', '{"')
    newString = newString.replaceAll('={', '":{')
    newString = newString.replaceAll('=', '":"')
    newString = newString.replaceAll('}', '"}')
    newString = newString.replaceAll('}"}', '}}')
    newString = newString.replaceAll(', ', ', "')
    return newString
}


async function dbPostDataAsync(subUrl, data) {

console.log("POSTING:", data)

    return fetch(dbUrl + subUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',    
            "Authorization": cachedSession.auth.idToken,
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            const message = httpMessage(response.status);
            return Promise.reject(message);
        }
    })
    .then(json => {
        if ( json.message ) {
            return Promise.reject(json.message);
        } else {
            return Promise.resolve(json);
        }
    })
    .catch((error) => {
        console.error('dbPostData Error: ' + JSON.stringify(error));
        globalMsgFunc('error', 'Database Failure') 
        return Promise.reject('Save Failed');
    })
}

async function dbGetDataAsync(arrayName, subUrl, paramObj=null) {
    let lastKey = null;
    let allData = [];
    do {
        const queryParams = (lastKey) ? { ... paramObj, lastkey: lastKey } : paramObj;
        const dataPage = await dbGetDataPageAsync(subUrl, queryParams)
            .then(data => {
                lastKey = data.LastEvaluatedKey ? stringToMap(data.LastEvaluatedKey) : null;
                return data[arrayName];
            })
        allData = allData.concat(dataPage);  
    } while (lastKey != null);
    return allData;
}

async function dbGetDataPageAsync(subUrl, paramObj) { 
    const params = (paramObj) ? "?" + new URLSearchParams(paramObj) : "";
    return await fetch(dbUrl + subUrl + params, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',    
            "Authorization": cachedSession.auth.idToken,
        }
    })
    .then(response => {
        if (response.ok) {
            return Promise.resolve(response.json());
        } else {
            const message = httpMessage(response.status);
            return Promise.reject(message);
        }
    })
    .catch((error) => {
        console.error('dbGetData Error:', error);
        globalMsgFunc('error', 'Error while loading - try again!!') 
        Promise.reject(error);
    })
}

// Return success with prob% probability
// eslint-disable-next-line no-unused-vars
async function simulatedSave(prob) {
    if (Math.random() * 100 > prob)
        return Promise.reject('Simulated error');
    else
        return Promise.resolve();
}

// function makeNewSvc(service){
    
//     console.log(service);

//     return (
//         {
//             adults: service.totalAdultsServed,
//             children: service.totalChildrenServed,
//             cFamName: service.clientFamilyName,
//             cGivName: service.clientGivenName,
//             cId: service.clientServedId,
//             cStatus: service.clientStatus,
//             cZip: service.clientZipcode,
//             fillBy: (service.fulfillment.dateTime === service.servicedDateTime) ? "" : service.fulfillment.byUserName,
//             fillDT: (service.fulfillment.dateTime === service.servicedDateTime) ? "" : service.fulfillment.dateTime,
//             fillItems: (service.fulfillment.dateTime === service.servicedDateTime) ? "" : service.fulfillment.itemCount,
//             fillPending: service.fulfillment.pending,
//             fillVoucher: (service.fulfillment.dateTime === service.servicedDateTime) ? "" : service.fulfillment.voucherNumber,
//             homeless: ( service.homeless === "YES" ) ? true : false,
//             individuals: service.totalIndividualsServed,
//             seniors: service.totalSeniorsServed,
//             // svcDTId: service.servicedDateTime + "#" + service.serviceId,
//             svcBtns: service.serviceButtons,
//             svcBy: service.servicedByUserName,
//             svcCat: service.serviceCategory,
//             svcDT: service.servicedDateTime,
//             svcFirst: ( service.svcFirst == true ) ? true : false,
//             svcId: service.serviceId,
//             svcItems: service.itemsServed,
//             svcName: service.serviceName,
//             svcTypeId: service.serviceTypeId,
//             svcUpdatedDT: ( service.updatedDateTime === undefined ) ? "" : service.updatedDateTime,
//             svcUSDA: service.isUSDA,
//             svcValid: ( service.serviceValid == true ) ? true : false,
//         }
//     )
// }


function makeOldServices(svcs){
    const svcTypes = getSvcTypes()
    
    const services = []
    svcs.forEach(svc => {
        const svcType = svcTypes.filter(svcType => svcType.svcTypeId === svc.svcTypeId )
        const oldSvcTypeId = svcType[0].svcOldTypeId
        const fulfillment = { 
            dateTime: svc.fillDT,
            byUserName: svc.fillBy,
            itemCount: svc.fillItems,
            pending: svc.fillPending,
            voucherNumber: svc.fillVoucher
        }

        services.push( 
            {
                totalAdultsServed: svc.adults,
                totalChildrenServed: svc.children,
                clientFamilyName: svc.cFamName,
                clientGivenName: svc.cGivName,
                clientServedId: svc.cId,
                clientStatus: svc.cStatus,
                clientZipcode: svc.cZip,
                fulfillment: fulfillment,
                homeless: ( svc.homeless === true ) ? "YES" : "NO",
                totalIndividualsServed: svc.individuals,
                totalSeniorsServed: svc.seniors,
                serviceButtons: svc.svcBtns,
                servicedByUserName: svc.svcBy,
                serviceCategory: svc.svcCat,
                servicedDateTime: svc.svcDT,
                servicedDay: moment(svc.svcDT).format("YYYYMMDD"),
                serviceId: svc.svcId,
                itemsServed: svc.svcItems,
                serviceName: svc.svcName,
                serviceTypeId: oldSvcTypeId,
                svcUpdatedDT: svc.svcUpdatedDT,
                isUSDA: svc.svcUSDA,
                serviceValid: svc.svcValid === true
            }
        )
    });

    return services
}

// function makeOldSvcTypes(svcTypes){
//     const serviceTypes = []
//     svcTypes.forEach(svcType => {
//         serviceTypes.push(
//             {
//                 available: svcType.available,
//                 createdDateTime: svcType.createdDT,
//                 fulfillment: svcType.fulfillment,
//                 isActive: ( svcType.isActive ) ? "Active" : "Inactive",
//                 isUSDA: svcType.svcUSDA,
//                 itemsPer: svcType.itemsPer,
//                 numberItems: svcType.numberItems,
//                 serviceButtons: svcType.svcBtns,
//                 serviceCategory: svcType.svcCat,
//                 serviceDescription: svcType.svcDesc,
//                 serviceInterval: svcType.svcInterval,
//                 serviceName: svcType.svcName,
//                 serviceTypeId: svcType.svcTypeId,
//                 serviceOldTypeId: svcType.svcOldTypeId,
//                 target: svcType.target,
//                 updatedDateTime: svcType.updatedDT
//             }
//         )
//     })
//     return serviceTypes
// }

// function MakeNewSvcType(old){
//     return {
//         available: old.available,
//         createdDT: old.createdDateTime,
//         fulfillment: old.fulfillment,
//         isActive: ( old.isActive === "Active" ) ? true : false,
//         svcUSDA: old.isUSDA,
//         itemsPer: old.itemsPer,
//         numberItems: old.numberItems,
//         svcBtns: old.serviceButtons,
//         svcCat: old.serviceCategory,
//         svcDesc: old.serviceDescription,
//         svcInterval: old.serviceInterval,
//         svcName: old.serviceName,
//         svcTypeId: old.serviceTypeId,
//         svcOldTypeId: old.serviceOldTypeId,
//         target: old.target,
//         updatedDT: old.updatedDateTime
//     }
// }