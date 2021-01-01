//************************************************
//***** DATABASE SECTION JAVASCRIPT FUNCTIONS *****
//************************************************

import moment from 'moment';
import { utilStringToArray } from './GlobalUtils';

const dbBase = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/';
let dbUrl = '';

function dbFetchUrl(session, subUrl) {
    console.log(dbUrl + subUrl)
    if (dbUrl === '') dbSetUrl('dev')
    return window.dbGetData(dbUrl + subUrl);
}

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

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
    return temp;
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
    console.log(temp)
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



export function dbSaveServiceRecord(service){
	const URL = aws+"/clients/services"
	return dbPostData(URL, JSON.stringify(service))
}

export function dbGetService(serviceId){
	return dbGetData(aws+"/clients/services/byid/"+serviceId).services
}