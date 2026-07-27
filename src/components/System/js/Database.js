//************************************************
//***** DATABASE SECTION JAVASCRIPT FUNCTIONS *****
//************************************************

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import cuid from 'cuid';
import { utilArrayToObject, utilCleanDate, utilChangeWordCase, utilDecodeStrings, utilEncodeStrings, utilRemoveDupClients, utilStringToArray, isEmpty, utilNow } from './GlobalUtils';
import { calDecodeRules, calEncodeRules } from './Calendar';
// import { calcFamilyCounts, calcDependentsAges } from './Clients/ClientUtils';
// import { searchClients } from './Clients/Clients';
import jwt_decode from 'jwt-decode';

dayjs.extend(customParseFormat);

const dbBase = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/';

//**** CACHED VARIABLES ****

let dbUrl = '';
let cachedSession = null;
let cachedSettings = null;
let cachedSvcTypes = []
let cachedAppVersion = "";

export let globalMsgFunc = null;

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function showCache() {
    console.log('Cached session:', cachedSession);
    console.log('Settings:', cachedSettings);
    console.log('DB URL:', dbUrl);
    console.log('Service Types:', cachedSvcTypes);
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
    console.log('New Session:', cachedSession)
}

export function sessionTimeRemaining() {
    let decodedTkn = jwt_decode(cachedSession.auth.idToken);
    return decodedTkn.exp * 1000 - new Date().getTime();
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
        .then(settings => {
            cachedSettings = settings;
        });

    dbGetSvcTypesAsync()
        .then(svcTypes => {
            cachedSvcTypes = svcTypes;
        });
}

export function clearCache() {
    cachedSession = null;
    cachedSettings = null;
    cachedSvcTypes = [];
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

// Settings data bypasses the step of encoding/decoding strings

export async function dbGetSettingsAsync() {
    return await dbGetDataPageAsync("/settings")
        .then(settings => {
            if (settings !== null) {
                const fields = ["serviceZip", "serviceCat", "calClosed",
                    "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"];
                fields.forEach(x => {
                    settings[x] = utilStringToArray(settings[x]);
                });
                Object.assign(settings, calDecodeRules(settings));

                cachedSettings = settings;
                return settings;
            }
        });
}

export async function dbSaveSettingsAsync(settings) {
    let data = { ...settings };
    data.calClosed = calEncodeRules(data.calClosed);
    const fields = ["serviceZip", "serviceCat", "calClosed",
        "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"];
    fields.forEach(x => {
        data[x] = utilArrayToObject(data[x]);
    });

    return await dbPostDataRawAsync('/settings/', data)
        .then(() => {
            cachedSettings = settings;
        });
}

export function SettingsSound() {
    return (cachedSettings.sounds == 'YES');
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

//****************** RECEIPTS ********************
//************************************************

export async function dbSendReceipt(rcpt) {
    // The structure representing the receipt (as a JSON-encoded string) is sent
    // as a single blob in the 'content' field of the strucutre below. That 
    // structure will also be JSON-encoded as part of the POST request to the
    // print queue. Therefore, we have to be careful about backslash escapes
    // within the inner JSON string. The line below substitutes URL encoding
    // for these special characters, which are later decoded when the receipt
    // is printed.
    // URL encode double quote and tab characters.
    const rcpt_str = JSON.stringify(rcpt).replaceAll('"', "%34").replaceAll("\\t", "%09");
    let data = { "receiptID": cuid(), "content": rcpt_str };

    // return await dbPostDataAsync('/receipts', data);
    return await dbPostDataRawAsync('/receipts', data);

}

//****************** ERROR LOGGING ********************
//************************************************

export async function dbLogError(message) {
    return await dbLog('ERROR', message);
}

export async function dbLogTrace(message) {
    return await dbLog('TRACE', message);
}

async function dbLog(category, message) {
    const isoString = new Date().toISOString();
    message = message.replaceAll('"', "'"); // change double quotes to single quotes for JSON payload
    let data = { "logID": cuid(), "logTimestamp": isoString, "message": message, "category": category };

    console.error(message);
    return await dbPostDataAsync('/logs', data, 'POST', false)
        .catch(err => {
            console.error('Failed write to error log', err);
        });
}

export async function dbFetchErrorLogs(startDate, endDate, category = "ERROR") {
    return await dbGetDataAsync("", "/logs", { "start": startDate, "end": endDate, "category": category })
        .catch(err => {
            console.error("failed to read logs, ", err);
        })
}

//******************* SVCTYPES *******************
//************************************************

export async function dbGetSvcTypesAsync() {
    return await dbGetDataAsync("serviceTypes", "/svctypes")
        .then(serviceTypes => {
            // case-insensitive sort
            cachedSvcTypes = serviceTypes.sort((a, b) => a.svcName.localeCompare(b.svcName, undefined, { sensitivity: 'base' }));
            return cachedSvcTypes;
        }
        )
}

export function getSvcTypes() {
    return cachedSvcTypes
}

export async function dbSaveSvcTypeAsync(data) {
    return await dbPostDataAsync('/svctypes/', data)
}

//******************** USERS *********************
//************************************************

export async function dbGetUserAsync(userName) {
    return await dbGetDataAsync("users", "/users/" + userName)
        .then(users => {
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
    return await dbGetClientsAsync(searchTerm).then(
        clients => {
            if (clients == undefined || clients == null || clients.length == 0) {
                clients = []
            }
            return clients
        }
    )
}

async function dbGetClientsAsync(searchTerm) {
    const isNum = /^[0-9]+$/.test(searchTerm);
    const idTerm = (isNum) ? searchTerm : false

    const isAlpha = /^[a-zA-Z ]+$/.test(searchTerm);
    const nameTerm = (isAlpha) ? utilChangeWordCase(searchTerm) : false

    const isAlphaNum = /^[0-9/.-]+$/.test(searchTerm);
    const dateTerm = (isAlphaNum) ? utilCleanDate(searchTerm) : false
    const isDate = dayjs(dateTerm, 'YYYY-MM-DD', true).isValid()

    if (isDate) {
        return await dbGetDataAsync("clients", "/clients/dob/" + dateTerm)    // expected date

    } else if (idTerm) {
        return await dbGetDataAsync("clients", "/clients/" + idTerm)        // expected Client ID

    } else if (nameTerm) {
        const split = nameTerm.split(" ")
        let d3 = [], d4 = [], d5 = [], d6 = []
        const d1 = await dbGetDataAsync("clients", "/clients/givenname/" + split[0])
        const d2 = await dbGetDataAsync("clients", "/clients/familyname/" + split[0])
        if (split.length > 1) {
            d3 = await dbGetDataAsync("clients", "/clients/givenname/" + split[1])
            d4 = await dbGetDataAsync("clients", "/clients/familyname/" + split[1])
        }
        if (split.length > 2) {
            d5 = await dbGetDataAsync("clients", "/clients/givenname/" + split[2])
            d6 = await dbGetDataAsync("clients", "/clients/familyname/" + split[2])
        }
        return utilRemoveDupClients(d1.concat(d2).concat(d3).concat(d4).concat(d5).concat(d6))

    } else {
        return null
    }
}

export async function dbGetAllClientsAsync() {
    return await dbGetDataAsync("clients", "/clients/")
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

export async function dbGetNewClientIDAsync() {
    // TODO: clientsIncrement to get id from API
    return await dbPostDataAsync("/clients/lastidinc", {}).then(data => { return data.lastId })
}

// ***************************************************************
// *********************** SVCS TABLE *************************

export async function dbGetClientActiveSvcHistoryAsync(clientId) {
    const paramObj = { cid: clientId }
    return await dbGetDataAsync("svcs", "/clients/svcs/bycid/", paramObj)
        .then(svcs => {
            return svcs.filter(item => item.svcValid === true);
        })
}

export async function dbGetAllClientSvcsAsync(clientId) {
    const paramObj = { cid: clientId }
    return await dbGetDataAsync("svcs", "/clients/svcs/bycid/", paramObj)
}

// *********************** SVCS TABLE *************************
// ***************************************************************



export async function dbSaveClientAsync(data) {
    if (data.clientId === "0") {
        dbSetModifiedTime(data, true);
        return await dbGetNewClientIDAsync()
            .then(async newClientId => {
                if (newClientId) {
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
                    globalMsgFunc("error", "New Client ID failure")
                    return Promise.reject("Failed to get Client ID, please retry")
                }
            })
    } else {
        dbSetModifiedTime(data, false);
        return await dbPostDataAsync("/clients/", data)
    }
}

// ***************************************************************
// *********************** NEW SVCS TABLE ************************

export async function dbSaveServicePatchAsync(svc) {
    // return await dbPostDataAsync("/clients/svcs", makeNewSvc(svc))
    return await dbPostDataAsync("/clients/svcs", svc)
}

export async function dbSaveServiceRecordAsync(svc) {

    // Set Update time
    svc.svcUpdatedDT = utilNow()

    return await dbPostDataAsync("/clients/svcs", svc)
        .then(async (r) => {
            // if (Object.keys(r).length === 0) {
            //     const svcTypes = getSvcTypes()
            //     const svcArray = []
            //     svcArray.push(svc)
            //     const oldSvc = makeOldServices(svcArray)
            //     svcTypes.forEach(s => {
            //         if (s.svcTypeId === oldSvc.svcTypeId) 
            //             oldSvc.svcTypeId = s.serviceOldTypeId
            //     });
            //     return await dbPostDataAsync("/clients/services", oldSvc[0])
            // } else
            return r
        })
}

export async function dbSaveSvcAsync(svc) {
    return await dbPostDataAsync("/clients/svcs", svc)
}


// *********************** NEW SVCS TABLE *************************
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

// formerly utilGetServicesInMonth in app.js
export async function dbGetSvcsInMonthAsync(monthYear) {
    const currentMonth = dayjs().format("YYYYMM")
    let daysInMonth = dayjs(monthYear, "YYYYMM").daysInMonth()
    if (monthYear == currentMonth) daysInMonth = dayjs().format("D")
    let monthOfSvcs = []
    daysInMonth = parseInt(daysInMonth) + 1
    // Loop through days of month
    for (var i = 1; i < daysInMonth; i++) {
        const day = String(i).padStart(2, '0')
        const dayDate = monthYear + day
        monthOfSvcs = monthOfSvcs.concat(await dbGetValidSvcsByDateAsync(dayDate).then(svcs => { return svcs }))
    }
    return monthOfSvcs
}

// ***** NOT USED *****
export async function dbGetServiceAsync(svcId) {
    return await dbGetDataAsync("services", "/clients/services/byid/" + svcId)
}

//******************* REPORTS *********************
//*************************************************

export async function dbGetEthnicGroupCountAsync(ethnicGroup) {
    return await dbGetDataAsync("", "/clients/ethnicgroup/" + ethnicGroup)
        .then(data => { return data.count })
}

//******************* UTILITIES *******************
//*************************************************

export function dbSetUrl(instance) {
    dbUrl = dbBase + instance;
    console.log('DB URL set to ' + dbUrl);
    initCache();
}

export function dbSetModifiedTime(obj, isNew) {
    const now = dayjs().format('YYYY-MM-DDTHH:mm');
    obj.updatedDateTime = now;
    if (isNew)
        obj.createdDateTime = now;
}

export function utilEmptyPlaceholders(obj, action) { // action = "add" or "remove"
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
    { code: 200, msg: 'Success' },
    { code: 400, msg: 'Bad Request Exception' },
    { code: 401, msg: 'Authentication Failed' },
    { code: 403, msg: 'Access Denied Exception' },
    { code: 404, msg: 'Not Found Exception' },
    { code: 409, msg: 'Conflict Exception' },
    { code: 413, msg: 'Request Too Large' },
    { code: 429, msg: 'API Configuration Error/Throttled' },
    { code: 500, msg: 'Internal Server Error' },
    { code: 502, msg: 'Bad Gateway Exception' },
    { code: 503, msg: 'Service Unavailable Exception' },
    { code: 504, msg: 'Endpoint Request Timed-out Exception' },
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


async function dbPostDataAsync(subUrl, data, method = 'POST', logErrors = true) {
    const copiedData = JSON.parse(JSON.stringify(data))
    const sanitizedData = utilEncodeStrings(copiedData);
    return dbPostDataRawAsync(subUrl, sanitizedData, method, logErrors);
}

async function dbPutDataAsync(subUrl, data, logErrors = true) {
    const copiedData = JSON.parse(JSON.stringify(data))
    const sanitizedData = utilEncodeStrings(copiedData);
    return dbPutDataRawAsync(subUrl, sanitizedData, logErrors);
}

async function dbPutDataRawAsync(subUrl, data, logErrors = true) {
    // For public endpoints (volunteers, shiftAction), auth is optional
    const headers = {
        'Content-Type': 'application/json'
    };

    // Add auth header if session exists
    if (cachedSession && cachedSession.auth && cachedSession.auth.idToken) {
        headers.Authorization = cachedSession.auth.idToken;
    }

    return fetch(dbUrl + subUrl, {
        method: 'PUT',
        headers: headers,
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
            if (json.message) {
                // Check if the message indicates success
                const successMessages = ['Volunteer created.', 'Volunteer updated.', 'Shift action recorded.'];
                if (successMessages.includes(json.message)) {
                    return Promise.resolve(json);
                } else {
                    return Promise.reject(json.message);
                }
            } else {
                return Promise.resolve(json);
            }
        })
        .catch((error) => {
            if (logErrors) {
                const msg = 'dbPutData Error: ' + JSON.stringify(error) +
                    ' URL: ' + subUrl + ' User: ' + getUserName() + " " + JSON.stringify(data);
                dbLogError(msg);
                globalMsgFunc('error', 'Database Failure');
            }
            return Promise.reject(error);
        });
}

export async function dbPostDataRawAsync(subUrl, data, method = 'POST', logErrors = true) {
    if (!['POST', 'PATCH', 'DELETE'].includes(method)) {
        return Promise.reject(`Unsupported method: ${method}`);
    }

    return fetch(dbUrl + subUrl, {
        method: method,
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
            if (json.message) {
                return Promise.reject(json.message);
            } else {
                return Promise.resolve(json);
            }
        })
        .catch((error) => {
            if (logErrors) {
                const msg = 'dbPostData Error: ' + JSON.stringify(error) +
                    ' URL: ' + subUrl + ' User: ' + getUserName() + " " + JSON.stringify(data);
                dbLogError(msg);
                globalMsgFunc('error', 'Database Failure');
            }
            return Promise.reject(error);
        })
}

async function dbGetDataAsync(arrayName, subUrl, paramObj = null) {
    let lastKey = null;
    let allData = [];
    do {
        const queryParams = (lastKey) ? { ...paramObj, lastkey: lastKey } : paramObj;
        const dataPage = await dbGetDataPageAsync(subUrl, queryParams)
            .then(data => {
                if (data !== null) {
                    lastKey = data.LastEvaluatedKey ? stringToMap(data.LastEvaluatedKey) : null;
                    if (arrayName)
                        return utilDecodeStrings(data[arrayName]);
                    else
                        return utilDecodeStrings(data);
                } else {
                    return null
                }
            })
        if (dataPage !== null) {
            allData = allData.concat(dataPage);
        }
    } while (lastKey != null);
    return allData;
}

async function dbGetDataPageAsync(subUrl, paramObj) {

    if (cachedSession === null) return null

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
            const msg = 'dbGetData Error: ' + JSON.stringify(error) +
                ' URL: ' + subUrl + ' User: ' + getUserName();
            dbLogError(msg);
            globalMsgFunc('error', 'Error while loading - try again!!')
            return Promise.reject(error);
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

function makeOldServices(svcs) {
    const svcTypes = getSvcTypes()

    const services = []
    svcs.forEach(svc => {
        const svcType = svcTypes.filter(svcType => svcType.svcTypeId === svc.svcTypeId)
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
                homeless: (svc.homeless === true) ? "YES" : "NO",
                totalIndividualsServed: svc.individuals,
                totalSeniorsServed: svc.seniors,
                serviceButtons: svc.svcBtns,
                servicedByUserName: svc.svcBy,
                serviceCategory: svc.svcCat,
                servicedDateTime: svc.svcDT,
                servicedDay: dayjs(svc.svcDT).format("YYYYMMDD"),
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

//******************** VOLUNTEERS ********************
//*************************************************

export async function dbGetAllVolunteersAsync() {
    // GET /prod/volunteers (auth required)
    const response = await dbGetDataPageAsync("/volunteers");
    let data = response;
    // If the response has a 'body' property, parse it
    if (data && typeof data.body === 'string') {
        try {
            data = JSON.parse(data.body);
        } catch (e) {
            data = {};
        }
    }
    // Get volunteers array from various possible response formats
    let volunteers = Array.isArray(data.volunteers) ? data.volunteers :
        Array.isArray(data) ? data : [];

    // Normalize field names and decode strings
    return volunteers.map(vol => {
        const decoded = utilDecodeStrings(vol);

        // Fix corrupted phone numbers (21XXXXXXXXXX should be +1XXXXXXXXXX)
        let phone = decoded.telephone || '';
        if (phone && phone.startsWith('21') && phone.length === 12) {
            phone = '+1' + phone.substring(2);
        }

        return {
            VolunteerId: decoded.VolunteerId,
            FirstName: decoded.firstName,
            LastName: decoded.lastName,
            Email: decoded.email,
            Telephone: phone,
            ProgramId: decoded.ProgramId || '0',
            RegComplete: decoded.RegComplete || false,
            Time: decoded.time,
            isDeleted: decoded.isDeleted || false
        };
    });
}

export async function dbGetSingleVolunteerAsync(volunteerId) {
    // GET /prod/volunteers/{id} (auth required)

    console.log("Get Volunteer:", volunteerId)

    const response = await dbGetDataPageAsync(`/volunteers/${volunteerId}`);
    console.log("RAW API RESPONSE:", response)
    let data = response;
    if (data && typeof data.body === 'string') {
        try {
            data = JSON.parse(data.body);
            console.log("PARSED RESPONSE:", data)
        } catch (e) {
            data = {};
        }
    }
    let volunteer = null;
    // If the API returns an array, return the first item
    if (Array.isArray(data.volunteers) && data.volunteers.length > 0) {
        volunteer = data.volunteers[0];
        console.log("Got volunteer from data.volunteers[0]:", volunteer);
    }
    // If wrapped in volunteer property, return that
    else if (data.volunteer) {
        volunteer = data.volunteer;
        console.log("Got volunteer from data.volunteer:", volunteer);
    }
    // If the data itself is a volunteer object
    else if (data && (data.VolunteerId || data.volunteerId || data.id || data.firstName || data.lastName)) {
        volunteer = data;
        console.log("Got volunteer from data itself:", volunteer);
    }

    if (volunteer) {
        const decoded = utilDecodeStrings(volunteer);

        // Fix corrupted phone numbers (21XXXXXXXXXX should be +1XXXXXXXXXX)
        let phone = decoded.telephone || '';
        if (phone && phone.startsWith('21') && phone.length === 12) {
            phone = '+1' + phone.substring(2);
        }

        return {
            VolunteerId: decoded.VolunteerId,
            FirstName: decoded.firstName,
            LastName: decoded.lastName,
            Email: decoded.email,
            Telephone: phone,
            ProgramId: decoded.programId || '0',
            RegComplete: decoded.regComplete || false,
            Time: decoded.time
        };
    }
    return null;
}

export async function dbSaveVolunteerAsync(data) {
    // PUT /prod/volunteers (private endpoint with auth)
    const apiData = {
        firstName: data.FirstName,
        lastName: data.LastName,
        telephone: data.Telephone,
        email: data.Email,
        programId: data.ProgramId || '0',
        RegComplete: data.RegComplete || true
    };

    const response = await dbPutDataAsync('/volunteers', apiData);

    // API doesn't return all fields, so merge with sent data
    if (response) {
        return {
            VolunteerId: response.VolunteerId,
            FirstName: data.FirstName,
            LastName: data.LastName,
            Telephone: data.Telephone,
            Email: data.Email,
            ProgramId: data.ProgramId || '0',
            RegComplete: response.RegComplete || true,
            Time: new Date().toISOString()
        };
    }
    return response;
}

export async function dbUpdateVolunteerAsync(volunteerId, data) {
    // UPDATE /prod/volunteers/{id} (private endpoint with auth)
    // Map internal format to API format
    const apiData = {
        firstName: data.FirstName,
        lastName: data.LastName,
        telephone: data.Telephone,
        email: data.Email,
        programId: data.ProgramId || '0',
        RegComplete: data.RegComplete !== undefined ? data.RegComplete : true
    };

    console.log("Updating volunteer with apiData:", apiData);

    console.log("VID", volunteerId)

    // Only include fields that are being updated
    if (data.FirstName !== undefined || data.firstName !== undefined)
        apiData.firstName = data.FirstName || data.firstName;
    if (data.LastName !== undefined || data.lastName !== undefined)
        apiData.lastName = data.LastName || data.lastName;
    if (data.Telephone !== undefined || data.telephone !== undefined)
        apiData.telephone = data.Telephone || data.telephone;
    if (data.Email !== undefined || data.email !== undefined)
        apiData.email = data.Email || data.email;
    if (data.ProgramId !== undefined || data.programId !== undefined)
        apiData.ProgramId = data.ProgramId || data.programId || '0';
    if (data.RegComplete !== undefined)
        apiData.RegComplete = data.RegComplete;
    if (data.isDeleted !== undefined)
        apiData.isDeleted = data.isDeleted;
    if (data.RedirectTo !== undefined)
        apiData.RedirectTo = data.RedirectTo;

    // Use POST method for updates (API doesn't support PATCH or PUT for updates)
    const response = await dbPostDataAsync(`/volunteers/${volunteerId}`, apiData, 'PATCH');

    console.log("Update volunteer response:", response);

    // Map response back to internal format
    // API response format: {VolunteerId, ProgramId, firstName, lastName, telephone, email, RegComplete}
    if (response) {
        const decoded = utilDecodeStrings(response);

        // Fix corrupted phone numbers
        let phone = decoded.telephone || '';
        if (phone && phone.startsWith('21') && phone.length === 12) {
            phone = '+1' + phone.substring(2);
        }

        return {
            VolunteerId: decoded.VolunteerId,
            FirstName: decoded.firstName,
            LastName: decoded.lastName,
            Telephone: phone,
            Email: decoded.email,
            ProgramId: decoded.ProgramId || '0',
            RegComplete: decoded.RegComplete || false,
            Time: decoded.time
        };
    }
    return response;
}

//******************** PROGRAMS & ACTIVITIES ********************
//*************************************************

export async function dbGetAllProgramsAsync() {
    // GET /prod/programs (auth NOT required)
    const response = await dbGetDataPageAsync("/programs");
    let data = response;
    // If the response has a 'body' property, parse it
    if (data && typeof data.body === 'string') {
        try {
            data = JSON.parse(data.body);
        } catch (e) {
            data = {};
        }
    }
    // Get programs array from various possible response formats
    return Array.isArray(data.programs) ? data.programs :
        Array.isArray(data.items) ? data.items :
            Array.isArray(data) ? data : [];
}

export async function dbGetAllActivitiesAsync() {
    // GET /prod/activities (auth required)
    const response = await dbGetDataPageAsync("/activities");
    let data = response;
    // If the response has a 'body' property, parse it
    if (data && typeof data.body === 'string') {
        try {
            data = JSON.parse(data.body);
        } catch (e) {
            data = {};
        }
    }
    // Get activities array from various possible response formats
    return Array.isArray(data.activities) ? data.activities :
        Array.isArray(data.items) ? data.items :
            Array.isArray(data) ? data : [];
}

//******************** SHIFTS ********************
//*************************************************

export async function dbGetAllShiftsByDateAsync(date) {
    // GET /prod/shiftsByDate?date=YYYY-MM-DD (auth required)
    const response = await dbGetDataPageAsync(`/shiftsByDate?date=${encodeURIComponent(date)}`);
    let data = response;
    // If the response has a 'body' property, parse it
    if (data && typeof data.body === 'string') {
        try {
            data = JSON.parse(data.body);
        } catch (e) {
            data = {};
        }
    }
    // Handle both 'shifts' and 'items' array names
    return Array.isArray(data.shifts) ? data.shifts :
        Array.isArray(data.items) ? data.items :
            Array.isArray(data) ? data : [];
}

export async function dbGetShiftsByDateRangeAsync(startDate, endDate) {
    // GET /prod/shiftsByDateRange?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD (auth required)
    const response = await dbGetDataPageAsync(`/shiftsByDateRange?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
    let data = response;
    // If the response has a 'body' property, parse it
    if (data && typeof data.body === 'string') {
        try {
            data = JSON.parse(data.body);
        } catch (e) {
            data = {};
        }
    }
    if (!data) return [];
    // Handle both 'shifts' and 'items' array names
    return Array.isArray(data.shifts) ? data.shifts :
        Array.isArray(data.items) ? data.items :
            Array.isArray(data) ? data : [];
}

export async function dbGetShiftsByVolunteerAsync(volunteerId, startDate = null, endDate = null) {
    // GET /prod/shiftByVolunteer?volunteerId=...&startDate=...&endDate=... (auth required)
    let url = `/shiftByVolunteer?volunteerId=${encodeURIComponent(volunteerId)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    const response = await dbGetDataPageAsync(url);
    let data = response;
    if (data && typeof data.body === 'string') {
        try {
            data = JSON.parse(data.body);
        } catch (e) {
            data = {};
        }
    }
    // Handle both 'shifts' and 'items' array names
    return Array.isArray(data.shifts) ? data.shifts :
        Array.isArray(data.items) ? data.items :
            Array.isArray(data) ? data : [];
}

export async function dbGetShiftsByProgramOrActivityAsync(programId, activityId, date = null) {
    // GET /prod/shiftsByProgramOrActivity (auth required)
    // Supports filtering by program, activity, and optional date (defaults to today)
    const params = [];
    if (programId) params.push(`programId=${encodeURIComponent(programId)}`);
    if (activityId) params.push(`activityId=${encodeURIComponent(activityId)}`);

    // Default to today's date if not provided
    const queryDate = date || dayjs().format('YYYY-MM-DD');
    params.push(`date=${encodeURIComponent(queryDate)}`);

    const url = '/shiftsByProgramOrActivity' + (params.length > 0 ? '?' + params.join('&') : '');

    const response = await dbGetDataPageAsync(url);
    let data = response;
    if (data && typeof data.body === 'string') {
        try {
            data = JSON.parse(data.body);
        } catch (e) {
            data = {};
        }
    }
    // Handle both 'shifts' and 'items' array names
    return Array.isArray(data.shifts) ? data.shifts :
        Array.isArray(data.items) ? data.items :
            Array.isArray(data) ? data : [];
}

export async function dbSaveShiftActionAsync(data) {
    // PUT /prod/shiftAction (auth required)
    // Map field names to match API expectations (lowercase)
    const apiData = {
        volunteerId: data.volunteerId,
        action: data.action, // "check-in" or "check-out"
        // Use local time for timestamp
        timestamp: data.timestamp ? data.timestamp : new Date().toLocaleString(),
        activityId: data.activityId,
        programId: data.programId
    };

    // Remove optional fields if undefined
    if (!apiData.activityId) delete apiData.activityId;
    if (!apiData.programId) delete apiData.programId;

    // Use PUT method as specified in the API
    return await dbPutDataAsync('/shiftAction', apiData);
}

export async function dbUpdateShiftAsync(shiftData) {
    // PATCH /prod/shiftAction/{id} (auth required)
    // Extract the shift ID
    const shiftId = shiftData.ShiftId || shiftData.shiftId || shiftData.Id || shiftData.id;
    if (!shiftId) {
        return Promise.reject('Shift ID is required for update');
    }

    // Prepare update data - remove ID from the payload
    const updateData = {};

    // Only include fields that are being updated
    if (shiftData.Action !== undefined) updateData.Action = shiftData.Action;
    if (shiftData.ActivityId !== undefined) updateData.ActivityId = shiftData.ActivityId;
    if (shiftData.Date !== undefined) updateData.Date = shiftData.Date;
    if (shiftData.ProgramId !== undefined) updateData.ProgramId = shiftData.ProgramId;
    if (shiftData.VolunteerId !== undefined) updateData.VolunteerId = shiftData.VolunteerId;
    if (shiftData.isDeleted !== undefined) updateData.isDeleted = shiftData.isDeleted;

    // Format timestamps properly for the API
    if (shiftData.TimestampIn !== undefined) {
        if (shiftData.TimestampIn === null) {
            updateData.TimestampIn = null; // Explicit null to remove
        } else {
            updateData.TimestampIn = typeof shiftData.TimestampIn === 'string'
                ? shiftData.TimestampIn
                : shiftData.TimestampIn.format('YYYY-MM-DD HH:mm:ss');
        }
    }
    if (shiftData.TimestampOut !== undefined) {
        if (shiftData.TimestampOut === null) {
            updateData.TimestampOut = null; // Explicit null to remove
        } else {
            updateData.TimestampOut = typeof shiftData.TimestampOut === 'string'
                ? shiftData.TimestampOut
                : shiftData.TimestampOut.format('YYYY-MM-DD HH:mm:ss');
        }
    }

    // Use PATCH method to update the shift
    return await dbPostDataRawAsync(`/shiftAction/${shiftId}`, updateData, 'PATCH');
}

export async function dbDeleteVolunteerAsync(volunteerId, redirectToId = null) {
    // Soft Delete: Update the volunteer record to set isDeleted = true
    const payload = { isDeleted: true };
    if (redirectToId) payload.RedirectTo = redirectToId;
    return await dbUpdateVolunteerAsync(volunteerId, payload);
}

export async function dbMergeVolunteersAsync(primaryId, duplicateId) {
    console.log(`Merging volunteer ${duplicateId} into ${primaryId}`);

    // 1. Get all shifts for the duplicate volunteer
    const shifts = await dbGetShiftsByVolunteerAsync(duplicateId);
    console.log(`Found ${shifts.length} shifts to reassign.`);

    // 2. Reassign each shift to the primary volunteer
    // We'll do this sequentially to avoid overwhelming the API, or parallel if robust
    const updatePromises = shifts.map(shift => {
        // Construct update object
        const updateData = {
            ShiftId: shift.ShiftId || shift.shiftId || shift.Id || shift.id,
            VolunteerId: primaryId,
            // Keep other fields as is, but dbUpdateShiftAsync only needs what changes
        };
        return dbUpdateShiftAsync(updateData);
    });

    await Promise.all(updatePromises);
    console.log("All shifts reassigned.");

    // 3. Soft Delete the duplicate volunteer
    await dbDeleteVolunteerAsync(duplicateId, primaryId);
    console.log("Duplicate volunteer soft deleted.");

    return { success: true, reassignedShifts: shifts.length };
}