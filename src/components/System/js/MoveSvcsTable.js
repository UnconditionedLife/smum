import moment from 'moment';
// import { calcFamilyCounts, calcDependentsAges, utilCalcAge } from '../../System/js/Clients/ClientUtils.js';
import { dbGetClientActiveServiceHistoryAsync, dbSaveSvcAsync } from '../../System/js/Database.js';
import { beepError } from './GlobalUtils.js';

function transformSvcRecord(svc){

    // empty out non-voucher fields
    if (svc.fulfillment.dateTime === svc.servicedDateTime) { 
        svc.fulfillment.dateTime = ""
        svc.fulfillment.byUserName = ""
        svc.fulfillment.pending = ""
        svc.fulfillment.voucherNumber = ""
        svc.fulfillment.itemCount = ""
    } else {
        svc.fulfillment.pending = (svc.fulfillment.pending === "true" ) ? true : false
        if (svc.fulfillment.pending === true ) {
            svc.fulfillment.dateTime = ""
            svc.fulfillment.byUserName = ""
            svc.fulfillment.voucherNumber = ""
            svc.fulfillment.itemCount = ""
        }
    }

    return {
        adults: ( svc.totalAdultsServed === "*EMPTY*" ) ? "0" : svc.totalAdultsServed,
        children: ( svc.totalChildrenServed === "*EMPTY*" ) ? "0" : svc.totalChildrenServed,
        cFamName: svc.clientFamilyName,
        cGivName: svc.clientGivenName,
        cId: svc.clientServedId,
        cStatus: svc.clientStatus,
        cZip: svc.clientZipcode,
        fillBy: svc.fulfillment.byUserName,
        fillDT: svc.fulfillment.dateTime,
        fillItems: svc.fulfillment.itemCount,
        fillPending: svc.fulfillment.pending,
        fillVoucher: svc.fulfillment.voucherNumber,
        homeless: ( svc.homeless === "YES" ) ? true : false,
        individuals: svc.totalIndividualsServed,
        seniors: ( svc.totalSeniorsServed === "*EMPTY*" ) ? "0" : svc.totalSeniorsServed,
        svcBtns: svc.serviceButtons,
        svcBy: svc.servicedByUserName,
        svcCat: svc.serviceCategory,
        svcDT: svc.servicedDateTime,
        svcDTId: svc.servicedDateTime + "#" + svc.serviceId,
        svcDTTypeId: svc.servicedDateTime + "#" + svc.svcTypeId,
        svcFirst: ( svc.svcFirst === true ) ? true : false,
        svcId: svc.serviceId,
        svcItems: svc.itemsServed,
        svcMonth: svc.servicedDateTime.substr( 0, 7 ),
        svcName: svc.serviceName,
        svcTypeId: svc.serviceTypeId,
        svcUpdatedDT: "",
        svcUSDA: svc.isUSDA,
        svcValid: ( svc.serviceValid === "true" ) ? true : false
        
    }
}


export function MoveSvcsTableRecords(startId, endId) {

    for (let i = startId; i < endId+1; i++) {
        console.log(i)
        dbGetClientActiveServiceHistoryAsync(i)
            .then(svcRecs => {

console.log("C"+i, svcRecs)

            // check for duplicate svcId(s)
            const seen = []
            svcRecs.forEach((obj, x) => {
                if (seen.includes(obj.serviceId)) {
                    // Duplicate
                    const dups = svcRecs.filter(s => s.serviceId === obj.serviceId);
                    if (dups.length > 2) { beepError; console.log("***ERROR MORE THAN TWO DUPLICATES***") }
                    if (obj.serviceValid === "true") svcRecs[x].serviceId = obj.serviceId + "-new"
                    if (obj.serviceValid === "false") svcRecs[x].serviceId = obj.serviceId + "-old"

                    console.log("FOUND DUP", dups )

                } else {
                    seen.push(obj.serviceId)
                }
            });

            // Sort assending to check for first food service
            svcRecs = svcRecs.sort((a, b) => moment.utc(a.servicedDateTime).diff(moment.utc(b.servicedDateTime)))

            let foundFirstFood = false
            let state = true
        
            svcRecs.every(( svc, index ) => {
                if (foundFirstFood === false) {
                    // check to see if it's one of the food services
                    if (( svc.serviceTypeId === "c2e6fbfcd32adcfdyht56a14c166d0b304da3aa32") ||
                        ( svc.serviceTypeId === "cj86davnj00013k7zi3715rf4") ||
                        ( svc.serviceTypeId === "cjd3tc95v00003i8ex6gltfjl" ))
                        {
                            if (svc.serviceValid === "true") {
                                svcRecs[index].svcFirst = true
                                foundFirstFood = true
                            }
                        }
                }
                const newSvc = transformSvcRecord(svc)
                console.log(index+1)
                console.log(JSON.stringify(newSvc))

                dbSaveSvcAsync(newSvc)
                    .then(() => {
                        console.log("SAVED " + newSvc.cId);
                    })
                    .catch(() => {
                        // use to break out of loop if error in dbSave *** BREAK IS NOT WORKING
                        console.log("*** SAVE ERROR ABORTING AT " + newSvc.cId + " ***")
                        state = false
                    }) 
                return state;
            });
        })
    }
}