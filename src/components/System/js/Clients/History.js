//******************************************************************
//     ****** CLIENTS HISTORY SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import dayjs from  'dayjs';
import cuid from 'cuid';
import { utilNow } from '../GlobalUtils';
import { dbGetClientActiveSvcHistoryAsync, dbSaveServiceRecordAsync, 
            getSvcTypes, dbSaveClientAsync, globalMsgFunc } from '../Database';

export async function getServiceHistoryAsync(clientId){
	return await dbGetClientActiveSvcHistoryAsync(clientId)
        .then(
            clientHistory => {
                return clientHistory.sort((a, b) => dayjs.utc(b.svcDT).diff(dayjs.utc(a.svcDT)))
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
	// const h = newClient.svcHistory.filter(item => item.svcBtns == "Primary")
	// newClient.lastServed = []
	// h.forEach((hSvc) => {
	// 	if (newClient.lastServed.findIndex(item => item.svcTypeId == hSvc.svcTypeId) < 0) {
	// 		newClient.lastServed.push( { svcTypeId: hSvc.svcTypeId, serviceDateTime: hSvc.svcDT, 
    //             svcCat: hSvc.svcCat, svcUSDA: hSvc.svcUSDA } )
	// 	}
    // })

    return newClient.lastServed
}

export async function saveHistoryFormAsync(editRecord, formValues, client, userName){
    const modRecord = Object.assign({}, editRecord)
    Object.assign(modRecord, formValues)
    const svcType = getSvcTypes().filter(item => item.svcName == editRecord.svcName)[0]
    Object.assign(modRecord, {
        svcTypeId: svcType.svcTypeId, svcCat: svcType.svcCategory, svcUSDA: svcType.svcUSDA })

    modRecord.servicedDay = dayjs(editRecord.svcDT).format("YYYYMMDD")
    modRecord.svcBy = userName
    modRecord.svcUpdatedDT = utilNow()
    modRecord.svcId = cuid()

    console.log("modRecord", modRecord)

    return await dbSaveServiceRecordAsync(modRecord)
        .then((savedSvc) => {
            if (Object.keys(savedSvc).length === 0)
                return modRecord
            else
                return null
        })
}

export async function removeSvcAsync(client, svc){
    svc.svcValid = false
    svc.svcUpdatedDT = utilNow()
    // incase it's from the new svc table TODO - remove after migration
    svc.servicedDay = dayjs(svc.svcDT).format("YYYYMMDD")

    return await dbSaveServiceRecordAsync(svc)
        .then((savedSvc) => {
            if (Object.keys(savedSvc).length === 0) {
                // remove the deleted record from history
                const newHistory = client.svcHistory.filter(function( obj ) {
                    return obj.svcId !== svc.svcId;
                });
                const tempClient = Object.assign({}, client)
                tempClient.svcHistory = newHistory
                // add the removed record to invalid list
                tempClient.invalidSvcs.unshift(svc)
                return tempClient
            } else {
                return null
            }
        })
}

export function checkSvcCounts(svc){
    const totalSvd = parseInt(svc.adults) + parseInt(svc.children) + parseInt(svc.seniors)
    return (totalSvd === parseInt(svc.individuals))
}

function buildAndSaveLastServed(newClient) {
	const h = newClient.svcHistory.filter(item => item.svcBtns == "Primary")
	newClient.lastServed = []
	h.forEach((hSvc) => {
		if (newClient.lastServed.findIndex(item => item.svcTypeId == hSvc.svcTypeId) < 0) {
			newClient.lastServed.push( { svcTypeId: hSvc.svcTypeId, svcDT: hSvc.svcDT, 
                svcCat: hSvc.svcCat, svcUSDA: hSvc.svcUSDA } )
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