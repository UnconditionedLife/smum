import moment from 'moment';
// import { calcFamilyCounts, calcDependentsAges, utilCalcAge } from '../../System/js/Clients/ClientUtils.js';
import { dbGetClientActiveServiceHistoryAsync, dbSaveSvcAsync, dbMigrateSvcTypeAsync, dbGetOldSvcTypesAsync, getSvcTypes } from '../../System/js/Database.js';
import { beepError } from './GlobalUtils.js';



function getNewSvcId(svcOldTypeId){

    const svcTypes = getSvcTypes()

    let newSvcId
    svcTypes.forEach(svcType => {
        // console.log("SVCTYPE", svcType.serviceOldTypeId);
        // console.log("SERVICE", svcOldTypeId);
        if (svcType.serviceOldTypeId === svcOldTypeId) {
            newSvcId = svcType.svcTypeId
        }
    });
    // console.log("NEW", newSvcId);
    return newSvcId
}

// function transformSvcTypeRecord(old, index){

//     // getNewSvcId(old.serviceTypeId)

//     return {
//         available: old.available,
//         createdDT: old.createdDateTime,
//         fulfillment: old.fulfillment,
//         isActive: ( old.isActive === "Active" ) ? true : false,
//         svcUSDA: old.isUSDA,
//         itemsPer: old.itemsPer,
//         numberItems: old.numberItems,
//         svcBtns: old.serviceButtons,
//         svcCat: old.serviceCategory,
//         svcDesc: old.serviceDescription,
//         svcInterval: old.serviceInterval,
//         svcName: old.serviceName,
//         svcTypeId: index,
//         svcOldTypeId: old.serviceTypeId,
//         target: old.target,
//         updatedDT: old.updatedDateTime
//     }
// }

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
        // svcCatDTId: svc.serviceCategory + "|" + svc.servicedDateTime + "|" + svc.serviceId, *** assembled in the API ***
        svcDT: svc.servicedDateTime,
        // svcDTId: svc.servicedDateTime + "|" + svc.serviceId, *** assembled in the API ***
        svcFirst: ( svc.svcFirst === true ) ? true : false,
        svcId: svc.serviceId,
        svcItems: svc.itemsServed,
        // svcMonth: svc.servicedDateTime.substr( 0, 7 ), *** created in the API ***
        svcName: svc.serviceName,
        svcTypeId: getNewSvcId(svc.serviceTypeId),
        svcUpdatedDT: "",
        svcUSDA: svc.isUSDA,
        svcValid: ( svc.serviceValid === "false" ) ? false : true
        
    }
}

async function getClientSvcs(i) { // 3
    await sleep(2000);
    console.log("Insert Client:", i);
    dbGetClientActiveServiceHistoryAsync(i)
            .then(svcRecs => {

console.log("SVCS", svcRecs)

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
                    if (( svc.serviceOldTypeId === "c2e6fbfcd32adcfdyht56a14c166d0b304da3aa32") ||
                        ( svc.serviceOldTypeId === "cj86davnj00013k7zi3715rf4") ||
                        ( svc.serviceOldTypeId === "cjd3tc95v00003i8ex6gltfjl" )
                        )
                        {
                            if (svc.serviceValid === "true") {
                                svcRecs[index].svcFirst = true
                                foundFirstFood = true
                            }
                        }
                }
                const newSvc = transformSvcRecord(svc)
                // console.log(index+1)
                // console.log(JSON.stringify(newSvc))
                if (newSvc.svcDT !== "Invalid date") {

                    // console.log(moment(newSvc.svcDT).year(), 2022);

                    // if (moment(newSvc.svcDT).year() === 2020) {
                    if ( svc.serviceTypeId === "cjem7yi0z05183iacs4mjuev6") {
                        dbSaveSvcAsync(newSvc)
                            .then(() => {
                                console.log("SAVED " + newSvc.cId);
                            })
                            .catch(() => {
                                // use to break out of loop if error in dbSave *** BREAK IS NOT WORKING
                                console.log("*** SAVE ERROR ABORTING AT " + newSvc.cId + " ***")
                                state = false
                            }) 
                    }
                }
                return state;
            });
        })
}

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }


export async function MoveSvcsTableRecordsAsync(startId, endId) {

    for (let i = startId; i < endId+1; i++) {
        console.log("CLIENT:", i)
        // wait for the sleep period between client service
        await getClientSvcs(i)
    }    
}

// export function MoveSvcTypeTableRecords(){
    
//     console.log("IN MOVE SVCTYPES");
    
//     dbGetOldSvcTypesAsync()
//         .then((oldSvcTypes) => {
            
//             console.log("OLD SVCTYPES", oldSvcTypes)

//             oldSvcTypes.forEach((svcType, index) => {
//                 console.log("MOVing",svcType);
//                 const newSvcType = transformSvcTypeRecord(svcType, index)
//                 dbMigrateSvcTypeAsync(newSvcType)
//                     .then(() => {
//                         console.log("SAVED " + newSvcType.svcTypeId);
//                     })
                
//             });
//         })
// }

// MIGRATE OLD THANKSGIVING SERVICES
// Turkey service = "cjem7yi0z05183iacs4mjuev6"

// Move table variables:
// FROM: prod-smum-services-byservicetype-error { old table to be removed }
// TO: prod-smum-services { old table to be removed }