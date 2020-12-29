//************************************************
//***** DATABASE SECTION JAVASCRIPT FUNCTIONS *****
//************************************************

import moment from 'moment';
import { utilStringToArray } from './GlobalUtils';

const dbBase = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/';
let dbUrl = '';
let cached_settings = null;

function dbFetchUrl(session, subUrl) {
    return window.dbGetData(dbUrl + subUrl);
}

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

// Utility Functions

export function dbSetUrl(instance) {
    dbUrl = dbBase + instance;
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
    cached_settings = temp;
    return temp;
}

export function SettingsSound() {
    return (cached_settings.sounds == 'YES');
}

export function SettingsPrinter() {
    return (cached_settings.printerIP);
}

export function SettingsSeniorAge() {
    return (parseInt(cached_settings.seniorAge, 10));
}

export function SettingsServiceCats() {
    return (cached_settings.serviceCat);
}

export function SettingsZipcodes() {
    return (cached_settings.serviceZip);
}

export function SettingsSchedule() {
    return {
        closedDays: cached_settings.closedDays,
        closedEveryDays: cached_settings.closedEveryDays,
        closedEveryDaysWeek: cached_settings.closedEveryDaysWeek,
        openDays: cached_settings.openDays,
    };
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

export function dbGetAppSettings(){
	let temp = dbGetData(aws+"/settings")
	let fields = ["serviceZip", "serviceCat", "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"]
	for (var i = 0; i < fields.length; i++) {
		let x = fields[i]
		if (temp[x] == "*EMPTY*") {
			temp[x] = []
		} else {
			temp[x] = utilStringToArray(temp[x])
		}
	}
	return temp
}

export function dbGetSvcTypes(){
	return dbGetData(aws+"/servicetypes").serviceTypes
		.sort(function(a, b){
			let nameA= a.serviceName.toLowerCase()
			let nameB= b.serviceName.toLowerCase()
			if (nameA < nameB) return -1
			if (nameA > nameB) return 1
		return 0; //default return value (no sorting)
	})
}

export function dbSaveServiceRecord(service){
	const URL = aws+"/clients/services"
	return dbPostData(URL, JSON.stringify(service))
}

export function dbGetService(serviceId){
	return dbGetData(aws+"/clients/services/byid/"+serviceId).services
}