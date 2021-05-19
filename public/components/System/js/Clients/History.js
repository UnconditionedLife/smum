//******************************************************************
//     ****** CLIENTS HISTORY SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import moment from  'moment';
import cuid from 'cuid';
import { utilNow } from '../GlobalUtils';
import { dbGetClientActiveServiceHistoryAsync, dbGetServiceAsync, dbSaveServiceRecordAsync, getSvcTypes, dbSaveClientAsync } from '../Database';

export function getServiceHistory(){
	dbGetClientActiveServiceHistoryAsync().then(
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
	// get the service history
	const h = client.svcHistory.filter(item => item.serviceButtons == "Primary")
	let topHist = []
	for (var a = 0; a < h.length; a++) {
		if (topHist.findIndex(item => item.serviceTypeId == h[a].serviceTypeId) < 0) {
			let lsItem = {serviceTypeId: h[a].serviceTypeId, serviceDateTime: h[a].servicedDateTime, serviceCategory: h[a].serviceCategory, isUSDA: h[a].isUSDA}
			topHist.push(lsItem)
		}
	}
	client.lastServed = topHist
	return dbSaveClientAsync(client)
        .then( () => {} )
        .catch( () => {} );
}

export function saveHistoryForm(editRecord, formValues, client, userName){
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
    
    dbSaveServiceRecordAsync(editRecord)
        .then( () => {
            console.log("saveHistoryForm = success!");
            utilRemoveService(oldServiceId);
        })
        .catch( message => {
            console.log("saveHistoryForm = error: " + message);
        });
}

export function utilRemoveService(serviceId){
	dbGetServiceAsync(serviceId)
        .then( serviceArray => {
            let service = serviceArray[0]
            service.serviceValid = false
            dbSaveServiceRecordAsync(service)
                .then( () => {
                    console.log("utilRemoveService = success!");
                })
                .catch( message => {
                    console.log("utilRemoveService = error: " + message);
                });
        });
}