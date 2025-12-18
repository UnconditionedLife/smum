//******************************************************************
//     ****** CLIENTS HISTORY SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import cuid from 'cuid';
import { utilNow } from '../GlobalUtils';
import {
    dbGetClientActiveSvcHistoryAsync, dbSaveServiceRecordAsync,
    getSvcTypes, dbSaveClientAsync, globalMsgFunc
} from '../Database';

dayjs.extend(utc);

export async function getServiceHistoryAsync(clientId) {
    return await dbGetClientActiveSvcHistoryAsync(clientId)
        .then(
            clientHistory => {
                return clientHistory.sort((a, b) => dayjs.utc(b.svcDT).diff(dayjs.utc(a.svcDT)))
            }
        )
}

export async function updateLastServed(client) {
    const newClient = Object.assign({}, client)
    // get the service history
    if (newClient?.svcHistory === undefined) {
        return await getServiceHistoryAsync(client.clientId)
            .then(async (svcHistory) => {
                newClient.svcHistory = svcHistory
                return await buildAndSaveLastServed(newClient)
            })
    } else {
        return await buildAndSaveLastServed(newClient)
    }
}

export async function saveHistoryFormAsync(editRecord, formValues, client, userName) {
    const modRecord = Object.assign({}, editRecord)
    Object.assign(modRecord, formValues)
    const svcType = getSvcTypes().filter(item => item.svcName == editRecord.svcName)[0]
    Object.assign(modRecord, {
        svcTypeId: svcType.svcTypeId, svcCat: svcType.svcCat, svcUSDA: svcType.svcUSDA, svcBtns: svcType.svcBtns
    })

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

export async function removeSvcAsync(client, svc) {
    svc.svcValid = false
    svc.svcUpdatedDT = utilNow()
    // incase it's from the new svc table TODO - remove after migration
    svc.servicedDay = dayjs(svc.svcDT).format("YYYYMMDD")

    // USED BECAUSE DB IS STILL INDEXING OLD ATTRIBUTE NAME
    svc.serviceTypeId = svc.svcTypeId

    return await dbSaveServiceRecordAsync(svc)
        .then((savedSvc) => {
            if (Object.keys(savedSvc).length === 0) {
                // remove the deleted record from history
                const newHistory = client.svcHistory.filter(function (obj) {
                    return obj.svcId !== svc.svcId;
                });
                const tempClient = Object.assign({}, client)
                tempClient.svcHistory = newHistory

                // add the removed record to invalid list
                if (tempClient.invalidSvcs == undefined) tempClient.invalidSvcs = []
                tempClient.invalidSvcs.unshift(svc)

                return updateLastServed(tempClient)
                    .then((updatedLastServed) => {
                        tempClient.lastServed = updatedLastServed
                        return tempClient
                    })
            } else {
                return null
            }
        })
}

export function checkSvcCounts(svc) {
    const totalSvd = parseInt(svc.adults) + parseInt(svc.children) + parseInt(svc.seniors)
    return (totalSvd === parseInt(svc.individuals))
}

async function buildAndSaveLastServed(newClient) {
    const h = newClient.svcHistory.filter(item => item.svcBtns == "Primary")
    newClient.lastServed = []
    h.forEach((hSvc) => {
        if (newClient.lastServed.findIndex(item => item.serviceTypeId == hSvc.svcTypeId) < 0) {
            // Safety check: if svcCat or svcBtns is missing, try to look it up from svcTypes
            let svcCat = hSvc.svcCat;
            let svcBtns = hSvc.svcBtns;
            if (!svcCat || !svcBtns) {
                const svcTypes = getSvcTypes();
                const svcType = svcTypes.find(t => t.svcTypeId == hSvc.svcTypeId);
                if (svcType) {
                    if (!svcCat) svcCat = svcType.svcCat;
                    if (!svcBtns) svcBtns = svcType.svcBtns;
                }
            }

            newClient.lastServed.push({
                serviceTypeId: hSvc.svcTypeId,
                serviceDateTime: hSvc.svcDT,
                serviceCategory: svcCat,
                isUSDA: hSvc.svcUSDA,
                // Standardized short names for consistency
                svcDT: hSvc.svcDT,
                svcCat: svcCat,
                svcBtns: svcBtns
            })
        }
    })

    if (h.length > 0) newClient.lastServed.sort((a, b) => dayjs.utc(b.serviceDateTime).diff(dayjs.utc(a.serviceDateTime)))

    dbSaveClientAsync(newClient)
        .then(() => {
            // globalMsgFunc('info', 'Last served updated')
        })
        .catch(() => {
            globalMsgFunc('error', 'FAILED to update client')
        });
}