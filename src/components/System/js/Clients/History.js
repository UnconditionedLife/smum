//******************************************************************
//     ****** CLIENTS HISTORY SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import moment from  'moment';
import cuid from 'cuid';
import { utilNow } from '../GlobalUtils';
import { dbGetClientActiveSvcHistoryAsync, dbSaveServiceRecordAsync, 
            getSvcTypes, dbSaveClientAsync, globalMsgFunc } from '../Database';

export async function getServiceHistoryAsync(clientId){
	return await dbGetClientActiveSvcHistoryAsync(clientId)
        .then(
            clientHistory => {
                return clientHistory.sort((a, b) => moment.utc(b.servicedDateTime).diff(moment.utc(a.servicedDateTime)))
        }
    )
}

export function updateLastServed(client){
	const newClient = Object.assign({}, client)
    // get the service history
    if (newClient?.svcHistory === undefined) {
        getServiceHistoryAsync( client.clientId )
            .then( svcHistory => { 
                newClient.svcHistory = svcHistory
// console.log("GOT SVC HIST")
            return buildAndSaveLastServed(newClient)

                 
        })
    } else {
        return buildAndSaveLastServed(newClient)
    }
	// const h = newClient.svcHistory.filter(item => item.serviceButtons == "Primary")
	// newClient.lastServed = []
	// h.forEach((hSvc) => {
	// 	if (newClient.lastServed.findIndex(item => item.serviceTypeId == hSvc.serviceTypeId) < 0) {
	// 		newClient.lastServed.push( { serviceTypeId: hSvc.serviceTypeId, serviceDateTime: hSvc.servicedDateTime, 
    //             serviceCategory: hSvc.serviceCategory, isUSDA: hSvc.isUSDA } )
	// 	}
    // })

    return newClient.lastServed
}

export async function saveHistoryFormAsync(editRecord, formValues, client, userName){
    const modRecord = Object.assign({}, editRecord)
    Object.assign(modRecord, formValues)
    const serviceType = getSvcTypes().filter(item => item.serviceName == editRecord.serviceName)[0]
    Object.assign(modRecord, {
        serviceTypeId: serviceType.serviceTypeId, serviceCategory: serviceType.serviceCategory, 
        isUSDA: serviceType.isUSDA })

    modRecord.servicedDay = moment(editRecord.servicedDateTime).format("YYYYMMDD")
    modRecord.servicedByUserName = userName
    modRecord.updatedDateTime = utilNow()
    modRecord.serviceId = cuid()

    return await dbSaveServiceRecordAsync(modRecord)
        .then((savedSvc) => {
            if (Object.keys(savedSvc).length === 0) {
                return modRecord
            } else {
                return null
            }
        })
}

export async function removeSvcAsync(client, svc){
    svc.serviceValid = false
    return await dbSaveServiceRecordAsync(svc)
        .then((savedSvc) => {
            if (Object.keys(savedSvc).length === 0) {
                const newHistory = client.svcHistory.filter(function( obj ) {
                    return obj.serviceId !== svc.serviceId;
                });
                const tempClient = Object.assign({}, client)
                tempClient.svcHistory = newHistory
                if (svc.serviceButtons === 'Primary') {
                    // tempClient.lastServed = updateLastServed(tempClient)
                }
                return tempClient
            } else {
                return null
            }
        })
}

function buildAndSaveLastServed(newClient) {
	const h = newClient.svcHistory.filter(item => item.serviceButtons == "Primary")
	newClient.lastServed = []
	h.forEach((hSvc) => {
		if (newClient.lastServed.findIndex(item => item.serviceTypeId == hSvc.serviceTypeId) < 0) {
			newClient.lastServed.push( { serviceTypeId: hSvc.serviceTypeId, serviceDateTime: hSvc.servicedDateTime, 
                serviceCategory: hSvc.serviceCategory, isUSDA: hSvc.isUSDA } )
		}
    })

    dbSaveClientAsync(newClient)
    .then( () => {
        // globalMsgFunc('info', 'Last served updated')
    } )
    .catch( () => {
        globalMsgFunc('error', 'FAILED to update client')
    } );
}