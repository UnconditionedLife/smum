//******************************************************************
//     ****** CLIENTS HISTORY SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import moment from  'moment';
import cuid from 'cuid';
import { utilNow } from '../GlobalUtils';
import { dbGetClientActiveServiceHistoryAsync, dbGetServiceAsync, dbSaveServiceRecordAsync, 
            getSvcTypes, dbSaveClientAsync, globalMsgFunc } from '../Database';

export async function getServiceHistoryAsync(clientId){
	return await dbGetClientActiveServiceHistoryAsync(clientId).then(
        clientHistory => {
           return clientHistory
           .sort((a, b) => moment.utc(b.servicedDateTime).diff(moment.utc(a.servicedDateTime)))
        }
    )
	// clientHistory = clientHistory
	// 	.sort((a, b) => moment.utc(b.servicedDateTime).diff(moment.utc(a.servicedDateTime)))
	// //uiShowHistoryData(reactDIV, clientHistory)
	// return clientHistory
}

export function updateLastServed(client){

console.log("UPDATE LAST SERVED", client)

	// get the service history
	const h = client.svcHistory.filter(item => item.serviceButtons == "Primary")
	let topHist = []
	for (var a = 0; a < h.length; a++) {
		if (topHist.findIndex(item => item.serviceTypeId == h[a].serviceTypeId) < 0) {
			let lsItem = {serviceTypeId: h[a].serviceTypeId, serviceDateTime: h[a].servicedDateTime, 
                serviceCategory: h[a].serviceCategory, isUSDA: h[a].isUSDA}
			topHist.push(lsItem)
		}
	}

	client.lastServed = topHist

console.log("AFTER UPDATE", client)

	return dbSaveClientAsync(client)
        .then( () => {
            globalMsgFunc('info', 'Last served updated')
        } )
        .catch( () => {
            globalMsgFunc('error', 'ERROR: Client not updated')
        } );
}

export async function saveHistoryFormAsync(editRecord, formValues, client, userName){
    const oldServiceId = editRecord.serviceId
    Object.assign(editRecord, formValues)
    const serviceType = getSvcTypes().filter(item => item.serviceName == editRecord.serviceName)[0]
    Object.assign(editRecord, {
        serviceTypeId: serviceType.serviceTypeId, serviceCategory: serviceType.serviceCategory, 
        isUSDA: serviceType.isUSDA })

    editRecord.servicedDay = moment(editRecord.servicedDateTime).format("YYYYMMDD")
    editRecord.servicedByUserName = userName
    editRecord.updatedDateTime = utilNow()
    editRecord.serviceId = cuid()
    
    return await dbSaveServiceRecordAsync(editRecord)
}

export async function utilRemoveServiceAsync(svcId){
	return await dbGetServiceAsync(svcId)
        .then( async (svcArray) => {
            let svc = svcArray[0]
            svc.serviceValid = false
            return await dbSaveServiceRecordAsync(svc)
                .then((saved) => {
                    if (Object.keys(saved).length === 0) {
                        return svc
                    } else {
                        return null
                    }
                })
        })
}