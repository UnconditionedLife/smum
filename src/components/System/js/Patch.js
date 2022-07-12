// PATCHES TO DATA

// SENIOR COUNT
// Used to Fix Senior count in service data for a given day
// Service data was created with wrong senior counts
// Updates service record with new senior count
// UI for patch is in ReportsPage.jsx "Patch Senior Count" button

import moment from 'moment';
import { calcFamilyCounts, calcDependentsAges, utilCalcAge } from '../../System/js/Clients/ClientUtils.js';
import { dbGetDaysSvcsAsync, dbGetSingleClientAsync, utilEmptyPlaceholders , dbSaveServiceRecordAsync } from '../../System/js/Database.js';

export function PatchSeniorCountInServiceDay(day) {
    dbGetDaysSvcsAsync(day) //YYYYMMDD
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

                        console.log("ID", svc.clientServedId)
                        console.log("SERVICE", svc.totalSeniorsServed)
                        console.log("CLIENT", tempClient.family.totalSeniors)
                        

                        if (svc.totalSeniorsServed != tempClient.family.totalSeniors) {
                            tempSvc.totalSeniorsServed = tempClient.family.totalSeniors.toString()
                            console.log("PATCH")
                            // Save the Patched service

                            console.log(tempSvc)

                            dbSaveServiceRecordAsync(tempSvc)


                        } else {
                            console.log("OK")
                        }
                        console.log("****")
                    })
                
            });
        })
}