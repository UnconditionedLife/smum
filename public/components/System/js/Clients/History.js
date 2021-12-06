//******************************************************************
//     ****** CLIENTS HISTORY SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import moment from  'moment';
import cuid from 'cuid';
import { utilNow } from '../GlobalUtils';
import { dbGetClientActiveServiceHistoryAsync, dbSaveServiceRecordAsync, 
            getSvcTypes, dbSaveClientAsync, globalMsgFunc } from '../Database';

export async function getServiceHistoryAsync(clientId){
	return await dbGetClientActiveServiceHistoryAsync(clientId)
        .then(
            clientHistory => {
                return clientHistory.sort((a, b) => moment.utc(b.servicedDateTime).diff(moment.utc(a.servicedDateTime)))
        }
    )
}

export function updateLastServed(client){
	// get the service history
	const h = client.svcHistory.filter(item => item.serviceButtons == "Primary")
	let topHist = []
	h.forEach((hSvc) => {
		if (topHist.findIndex(item => item.serviceTypeId == hSvc.serviceTypeId) < 0) {
			let lsItem = {serviceTypeId: hSvc.serviceTypeId, serviceDateTime: hSvc.servicedDateTime, 
                serviceCategory: hSvc.serviceCategory, isUSDA: hSvc.isUSDA}
			topHist.push(lsItem)
		}
    })

	dbSaveClientAsync(client)
        .then( () => {
            // globalMsgFunc('info', 'Last served updated')
        } )
        .catch( () => {
            globalMsgFunc('error', 'FAILED to update client')
        } );

    return topHist
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
            console.log("SAVED SERVICE:", savedSvc )

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
                if (svc.serviceButtons === 'Primary') updateLastServed(client)
                const tempClient = Object.assign({}, client)
                tempClient.svcHistory = newHistory
                return tempClient
            } else {
                return null
            }
        })
}