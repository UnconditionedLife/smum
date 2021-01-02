//******************************************************************
//     ****** CLIENTS HISTORY SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import moment from  'moment';
import cuid from 'cuid';
import { utilNow } from '../GlobalUtils';
import { dbGetClientActiveServiceHistory, dbGetService, dbSaveServiceRecord, getSvcTypes } from '../Database';

export function getServiceHistory(){
	let clientHistory = dbGetClientActiveServiceHistory()
	clientHistory = clientHistory
		.sort((a, b) => moment.utc(b.servicedDateTime).diff(moment.utc(a.servicedDateTime)))
	//uiShowHistoryData(reactDIV, clientHistory)
	return clientHistory
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
	return window.dbSaveCurrentClient(client) // TODO REMOVE FROM APP.JS
}

export function saveHistoryForm(editRecord, formValues, client, userName){
    const oldServiceId = editRecord.serviceId
    Object.assign(editRecord, formValues)
    const serviceType = getSvcTypes.filter(item => item.serviceName == editRecord.serviceName)[0]
    Object.assign(editRecord, {
        serviceTypeId: serviceType.serviceTypeId, serviceCategory: serviceType.serviceCategory, 
        isUSDA: serviceType.isUSDA })

    editRecord.servicedDay = moment(editRecord.servicedDateTime).format("YYYYMMDD")
    editRecord.servicedByUserName = userName
    editRecord.updatedDateTime = utilNow()
    editRecord.serviceId = cuid()
    
    const result = dbSaveServiceRecord(editRecord)

	if (result == "success") {
		// disable old service record
        const oldSvc = utilRemoveService(oldServiceId)
        if (oldSvc === "error") return null
		return editRecord
    }
    return null
}

function utilRemoveService(serviceId){
	let service = dbGetService(serviceId)[0]
	service.serviceValid = false
	const result = dbSaveServiceRecord(service)
    if (result !== "success") return "error"
    return null
}