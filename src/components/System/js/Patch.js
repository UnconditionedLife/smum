// PATCHES TO DATA

// SENIOR COUNT
// Used to Fix Senior count in service data for a given day
// Service data was created with wrong senior counts
// Updates service record with new senior count
// UI for patch is in ReportsPage.jsx "Patch Senior Count" button

import moment from 'moment';
import { calcFamilyCounts, calcDependentsAges, utilCalcAge } from '../../System/js/Clients/ClientUtils.js';
import { dbGetValidSvcsByDateAsync, dbGetSingleClientAsync, utilEmptyPlaceholders , dbSaveServicePatchAsync } from '../../System/js/Database.js';

export function PatchSeniorCountInServiceDay(day) {
    dbGetValidSvcsByDateAsync(day) //YYYYMMDD
        .then(svcs => {
            const servicesFood = svcs
                .filter(item => item.serviceValid == 'true')
                .sort((a, b) => moment.utc(a.servicedDateTime).diff(moment.utc(b.servicedDateTime)))

            console.log("SERVICES", servicesFood)

            servicesFood.forEach(svc => {
                dbGetSingleClientAsync(svc.clientServedId)
                    .then(patchClient => {
                        let tempSvc = Object.assign({}, svc)
                        let tempClient = utilEmptyPlaceholders(patchClient, "remove")
                        tempClient = utilCalcAge(tempClient)
                        tempClient.dependents = calcDependentsAges(tempClient)
                        tempClient.family = calcFamilyCounts(tempClient)
                        let updated = false

                        if (svc.totalSeniorsServed != tempClient.family.totalSeniors) {
                            // console.log("SERVICE", svc.totalSeniorsServed)
                            // console.log("CLIENT", tempClient.family.totalSeniors)
                            tempSvc.totalSeniorsServed = tempClient.family.totalSeniors.toString()
                            console.log("PATCH Seniors")
                            updated = true

                        } 
                        
                        if (svc.totalIndividualsServed != tempClient.family.totalSize) {
                            // console.log ("SVC", svc.individuals)
                            // console.log ("CLT", tempClient.family.totalSize)
                            tempSvc.totalIndividualsServed = tempClient.family.totalSize.toString()
                            console.log("PATCH Total")
                            updated = true
                        } 
                        
                        if (svc.totalAdultsServed != tempClient.family.totalAdults) {
                            // console.log ("SVC ADULTS", svc.totalAdultsServed)
                            // console.log ("CLT ADULTS", tempClient.family.totalAdults)
                            tempSvc.totalAdultsServed = tempClient.family.totalAdults.toString()
                            console.log("PATCH Adults")
                            updated = true
                        } 
                        
                        if (svc.totalChildrenServed != tempClient.family.totalChildren) {
                            // console.log ("SVC CHLD", svc.totalChildrenServed)
                            // console.log ("CLT ADULTS", tempClient.family.totalChildren)
                            tempSvc.totalChildrenServed = tempClient.family.totalChildren.toString()
                            console.log("PATCH CHLD")
                            updated = true
                        } 

                        if (updated === true ) {
                            console.log(svc.clientServedId, "PATCHED")
                            // Save the Patched service
                            dbSaveServicePatchAsync(tempSvc)
                        } else {
                            console.log(svc.clientServedId, "OK")
                        }
                    })
                
            });
        })
}