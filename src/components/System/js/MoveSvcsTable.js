import moment from 'moment';
// import { calcFamilyCounts, calcDependentsAges, utilCalcAge } from '../../System/js/Clients/ClientUtils.js';
import { dbGetClientActiveServiceHistoryAsync, dbSaveSvcAsync, dbSaveSvcTypeAsync, dbGetSvcTypesAsync } from '../../System/js/Database.js';
import { beepError } from './GlobalUtils.js';

function getNewSvcId(oldSvcTypeId){
    const svcTypeIds = [
        { oldId: "cjcrx959700013i8dkeubh2pf", newId: "11", serviceName: "Child Diapers ABCDE" },
        { oldId: "cjof17n5p00013gdbnzjybw2g", newId: "18", serviceName: "Christmas Gift Card 3" },
        { oldId: "cjof342bb00003gdb79uc4xdj", newId: "19", serviceName: "Christmas Gift Card Pickup" },
        { oldId: "cjof100mq00003gdbryxbmi9p", newId: "20", serviceName: "Christmas Toy" },
        { oldId: "cjof38w5700013gdbn0pta2xd", newId: "21", serviceName: "Christmas Toy Pickup" }, 
        { oldId: "c5cf41b232afc23a6564f8278dc9982ce16a9148", newId: "4", serviceName: "Clothes" },
        { oldId: "ck31v683l00063aedpccjuy8v", newId: "5", serviceName: "Clothes - homeless" },
        { oldId: "cjd3tc95v00003i8ex6gltfjl", newId: "3", serviceName: "Emergency Early" },
        { oldId: "cj7v6jrg400013k7paa8m81p2", newId: "7", serviceName: "Female Hygiene Kit" },
        { oldId: "cjhf5lvps00003iccv6kmntei", newId: "16", serviceName: "First Step" },
        { oldId: "cjj4ieeo200013gcthq3kojls", newId: "17", serviceName: "First Step Pickup" },
        { oldId: "c2e6fbfcd32adcfdyht56a14c166d0b304da3aa32", newId: "2", serviceName: "Food NonUSDA" },
        { oldId: "cj86davnj00013k7zi3715rf4", newId: "1", serviceName: "Food USDA" },
        { oldId: "cjcrwt1q700003i86eiceqjnv", newId: "6", serviceName: "Household Item" },
        { oldId: "cjcryvin100003i8dv6e72m6j", newId: "15", serviceName: "ID-POA Check" },
        { oldId: "54e2d65d73ee69062294d631bc7942db58524616", newId: "14", serviceName: "Jacket" },
        { oldId: "a14a6d3e55dd070911f6917f8ec42a225117ba44", newId: "8", serviceName: "Male Hygiene Kit" },
        { oldId: "cjeopwkc900003i9ujcg391gl", newId: "12", serviceName: "Poncho" },
        { oldId: "cjdfdjqse00003i8v5757q4q4", newId: "13", serviceName: "Sleeping Bag" },
        { oldId: "c2e6fbfcd32adcf82730a14c166d0b304da3aa32", newId: "9", serviceName: "Socks" },
        { oldId: "cjndyf25c00003hd22tct3ry9", newId: "22", serviceName: "Thanksgiving Gift Card" },
        { oldId: "cjndyk07z00003hd1kuhpzqvx", newId: "23", serviceName: "Thanksgiving Gift Card Pickup" },
        { oldId: "cjem7yi0z05183iacs4mjuev6", newId: "24", serviceName: "Thanksgiving Turkey" },
        { oldId: "7d2d8e12f846a868055e6f4b569ed5a4fbe0eda9", newId: "25", serviceName: "Thanksgiving Turkey Pickup" },
        { oldId: "cjcrx7ku800003i8ded0mzuty", newId: "10", serviceName: "Underwear" },
    ]

    const svcType = svcTypeIds.filter((svcType) => { oldSvcTypeId === svcType.oldId })
    return svcType[0].newId
}

function transformSvcTypeRecord(old){

    getNewSvcId(old.serviceTypeId)

    return {
        available: old.available,
        createdDT: old.createdDateTime,
        fulfillment: old.fulfillment,
        isActive: ( old.isActive === "Active" ) ? true : false,
        svcUSDA: old.isUSDA,
        itemsPer: old.itemsPer,
        numberItems: old.numberItems,
        svcBtns: old.serviceButtons,
        svcCat: old.serviceCategory,
        svcDesc: old.serviceDescription,
        svcInterval: old.serviceInterval,
        svcName: old.serviceName,
        svcTypeId: old.serviceTypeId,
        target: old.target,
        updatedDT: old.updatedDateTime
    }
}

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
        svcTypeId: svc.serviceTypeId,
        svcUpdatedDT: "",
        svcUSDA: svc.isUSDA,
        svcValid: ( svc.serviceValid === "false" ) ? false : true
        
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
                        ( svc.serviceTypeId === "cjd3tc95v00003i8ex6gltfjl" )
                        )
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

export function MoveSvcTypeTableRecords(){
    
    console.log("IN MOVE SVCTYPES");
    
    dbGetSvcTypesAsync()
        .then((oldSvcTypes) => {
            
            console.log("OLD SVCTYPES", oldSvcTypes)

            oldSvcTypes.forEach(svcType => {
                console.log("MOVing",svcType);
                const newSvcType = transformSvcTypeRecord(svcType)
                dbSaveSvcTypeAsync(newSvcType)
                    .then(() => {
                        console.log("SAVED " + newSvcType.svcTypeId);
                    })
                
            });
        })
}