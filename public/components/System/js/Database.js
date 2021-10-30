//************************************************
//***** DATABASE SECTION JAVASCRIPT FUNCTIONS *****
//************************************************

import moment from 'moment';
import { calConvertLegacyEvents } from './Calendar';
import { utilArrayToObject, utilCleanUpDate, utilChangeWordCase, utilRemoveDupClients, utilStringToArray } from './GlobalUtils';
// import { calcFamilyCounts, calcDependentsAges } from './Clients/ClientUtils';
// import { searchClients } from './Clients/Clients';
import { prnConnect } from './Clients/Receipts';

const dbBase = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/';

//**** CACHED VARIABLES ****

let dbUrl = '';
let cachedSession = {}
let cachedSettings = null;
let cachedSvcTypes = []
const MAX_ID_DIGITS = 5

export let globalMsgFunc = null;

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function showCache() {
    console.log('Cached session: ');
    console.log(JSON.stringify(cachedSession));
    console.log('Settings: ');
    console.log(JSON.stringify(cachedSettings));
    console.log('DB URL: ' + dbUrl);
    console.log('Service Types: ');
    console.log(cachedSvcTypes);
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
        });
}

export function clearCache() {
    cachedSession = {};
    cachedSettings = null;
    cachedSvcTypes = [];
}

export function getSession(){
    return cachedSession
}

//**************** APP SETTINGS ******************
//************************************************

export async function dbGetSettingsAsync() {
    return await dbGetDataAsync("/settings")
        .then( settings => {
            const fields = ["serviceZip", "serviceCat", "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"]
            fields.forEach(x => {
                settings[x] = utilStringToArray(settings[x]);
            });
            if (!(settings.calDaily || settings.calWeekly || settings.calMonthly))
                Object.assign(settings, calConvertLegacyEvents(settings));

            cachedSettings = settings;
            return settings;
        });
}

export async function dbSaveSettingsAsync(settings) {
    let data = { ... settings };
    const fields = ["serviceZip", "serviceCat", "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"]
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
        closedDays: cachedSettings.closedDays,
        closedEveryDays: cachedSettings.closedEveryDays,
        closedEveryDaysWeek: cachedSettings.closedEveryDaysWeek,
        openDays: cachedSettings.openDays,
    };
}

//************************************************
//******************* SVCTYPES *******************

export async function dbGetSvcTypesAsync(){
    return await dbGetDataAsync("/servicetypes")
        .then( data => {
            const svcTypes = data.serviceTypes
            // case-insensitive sort
            return  svcTypes.sort((a, b) => a.serviceName.localeCompare(b.serviceName, undefined, {sensitivity: 'base'}));
        }
    )
}

export function getSvcTypes(){
    return cachedSvcTypes
}

export async function dbSaveSvcTypeAsync(data) {
    return await dbPostDataAsync('/servicetypes/', data)
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
                return Promise.reject('User not found');
        }
    )
}

export async function dbGetAllUsersAsync() {
	return await dbGetDataAsync("/users").then( data => { return data.users });
}

export async function dbSaveUserAsync(data) { 
    return await dbPostDataAsync('/users/', data);
}

//******************** CLIENTS ********************
//*************************************************

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

export async function dbGetSingleClientAsync(clientId) {
    return await dbGetDataAsync("/clients/" + clientId)
        .then( data => {
            let result = data.clients
            if (result.length == 1)
                return result[0];
            else
                return null;
        })
}

export async function dbGetNewClientIDAsync(){
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
                        dbPostDataAsync("/clients/lastid", JSON.stringify(request))
                            .then()
                            .catch( msg => {
                                console.log("Last client ID not Saved - ", msg);
                            });
                        return newId
                    })
            }
        })
}

export async function dbGetClientActiveServiceHistoryAsync(clientId){
    return await dbGetDataAsync("/clients/services/" + clientId).then(data => {
        const svcs = data.services
        const activeSvcs = svcs.filter(item => item.serviceValid == "true")
            .sort((a, b) => moment.utc(b.servicedDateTime).diff(moment.utc(a.servicedDateTime))) 
        return activeSvcs
    })
}

export async function dbSaveClientAsync(data) {
	if (data.clientId === "0") {
        dbSetModifiedTime(data, true);
        dbGetNewClientIDAsync()
            .then( newClientId => {
                if (data.clientId === 'failed') { 
                    console.log('Unable to get new client ID')
                    return
                }
                data.clientId = newClientId
            }
        )
	} else {
        dbSetModifiedTime(data, false);
	}
    
    return await dbPostDataAsync("/clients/", data)
}

export async function dbSaveServiceRecordAsync(svc) {
	return await dbPostDataAsync("/clients/services", svc)
}

async function dbGetDaysSvcsAsync(dayDate){
    return await dbGetDataAsync("/clients/services/byday/" + dayDate).then(data => { return data.services })
}

export async function dbGetSvcsByIdAndYear(serviceTypeId, year) {
	return await dbGetDataAsync("/clients/services/byservicetype/" + serviceTypeId)
            .then( data => { 
                return data.services
                .filter(item => item.serviceValid == 'true')
                .filter(item => moment(item.servicedDateTime).year() == year)
            })					
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

export async function dbSaveLastServedAsync(client, serviceTypeId, serviceCategory, itemsServed, isUSDA){
	const serviceDateTime = moment().format('YYYY-MM-DDTHH:mm')
    const newClient = Object.assign({}, client)
	const newRecord = { serviceTypeId, serviceDateTime, serviceCategory, itemsServed, isUSDA }
	const newLastServed = []
	let notPushed = true
	if (newClient.lastServed) {
		newClient.lastServed.forEach((svcRecord) => {
            if (serviceTypeId == svcRecord.serviceTypeId) {
				notPushed = false
				newLastServed.push(newRecord)
			} else {
				newLastServed.push(svcRecord)
			}
        })
	}
	if (notPushed) newLastServed.push(newRecord)
	newClient.lastServed = newLastServed

console.log("SAVING CLIENT LASTSERVED")

    return await dbSaveClientAsync(newClient).then(() => {
        return newLastServed
    })
}

//******************* REPORTS *********************
//*************************************************

export async function dbGetEthnicGroupCountAsync(ethnicGroup){

    console.log("CACHED SESSION", cachedSession)

    return await dbGetDataAsync("/clients/ethnicgroup/" + ethnicGroup)
        .then( data => { return data.count})
}

// NOT CURRENTLY BEING CALLED
// async function  dbGetDaysServicesAsync(dayDate){
// 	dayDate = moment(dayDate).format("YYYYMMDD")
// 	return dbGetDataAsync("/clients/services/byday/" + dayDate ).then( data => { return data.services })
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

async function dbGetDataAsync(subUrl) { 
    return await fetch(dbUrl + subUrl, {
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