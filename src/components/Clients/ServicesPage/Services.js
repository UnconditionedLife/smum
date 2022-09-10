//******************************************************************
//****** CLIENTS ServiceInstance SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import moment from  'moment';
import { utilGradeToNumber, utilCalcTargetServices } from './ClientUtils'
import { dbGetClientActiveSvcHistoryAsync, dbSaveServiceRecordAsync, getSvcTypes, 
    getUserName } from '../Database';
import { calFindOpenDate } from '../Calendar.js';
import { prnPrintFoodReceipt, prnPrintClothesReceipt, prnPrintReminderReceipt,
            prnPrintVoucherReceipt, prnFlush } from './Receipts';
import cuid from 'cuid';

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export async function svcInterval( client, svcTypeId ){
    // const { client, svcTypeId, svcCat } = props

    console.log("client", client)
    console.log("svcTypeId", svcTypeId)

    const svcTypes = getSvcTypes()
	const svcType = getServiceTypeByID(svcTypes, svcTypeId)
    const svcCat = svcType.svcCat
	const svcId = "" // new service
    const svcValid = true
    const newClient = Object.assign({}, client) 
    
	// save service record
	const servedCounts = calcServiceFamilyCounts( svcTypes, client, svcTypeId)
    const svcRecord = utilBuildServiceRecord( svcType, svcId, servedCounts, svcValid, client )

    console.log("svcRecord", svcRecord)

	return await dbSaveServiceRecordAsync(svcRecord)
        .then((savedSvc) => {

            console.log("savedSVC", savedSvc)


            if (Object.keys(savedSvc).length === 0) {
                if (svcId === "") {
                    printSvcReceipt(client, svcTypes, svcType, svcTypeId, svcCat)                    
                    newClient.svcHistory.unshift(svcRecord)
                    return newClient
                } else {
                    return null
                }
            }
        })
}

// BUTTON RENDERING STARTS HERE
export function getButtonData( props ) {
    const { client, buttons, lastServedDays, activeServiceTypes, targetServices } = props
    const buttonData = { lastServedDays, activeServiceTypes }
    buttonData[buttons] = getActiveServicesButtons({ client, buttons, activeServiceTypes, targetServices, lastServedDays });
    // list of buttns that have been used today
    buttonData[buttons] = getUsedServicesButtons(client, buttons, buttonData)
    // sort the button in category and alpha order
    buttonData[buttons] = sortButtons(buttonData[buttons])
    return buttonData[buttons]
}

export function sortButtons(btns){
    if (btns.length < 1) return btns
    const cats = { food: [], clothes: [], admin: [], misc: [] }  
    if (btns[0].svcBtns === "Primary") {
        btns.forEach(svc => {
            if (svc.svcCat === "Food_Pantry") {
                cats.food.push(svc)
            } else if (svc.svcCat === "Clothes_Closet") {
                cats.clothes.push(svc)
            } else if (svc.svcCat === "Administration") {
                cats.admin.push(svc)
            } else {
                cats.misc.push(svc)
            }
        })
        return cats.food.concat(cats.clothes, cats.admin, cats.misc)
    } else {
        return btns.sort(function(a, b){
            if (a.svcName < b.svcName) return -1;
            if (a.svcName > b.svcName) return 1;
            return 0;
        })
    }
}

export function getFoodInterval(aSvcTypes){
    const svcTypes = aSvcTypes.length != 0 ? aSvcTypes : getSvcTypes()
    const usdaArray = [ 'NonUSDA', 'USDA', 'Emergency' ]
    const foodInt = {}
	svcTypes.forEach((t) => {
        usdaArray.forEach((svcUSDA) => {
            if ((t.svcBtns === "Primary") && (t.svcCat === "Food_Pantry") && (t.svcUSDA == svcUSDA)){
                foodInt[svcUSDA] = t.svcInterval
            }
        })
	})
    return foodInt
}

export function getSvcsRendered(svcHistory){
    let svcsRendered = []
    svcHistory.forEach((svc) => {
        if (moment().isSame(svc.svcDT, "day")) {
            svcsRendered.push(svc)
		}
    })
    return svcsRendered
}

// export function utilCalcLastServedDays(client) {
// 	// get Last Served Date from client & calculate number of days
// 	const lastServed = { daysUSDA:10000, daysNonUSDA:10000, lowestDays:10000, backToSchool:10000 }
// 	if (client.lastServed[0] === undefined) return lastServed
// 	const lastServedFood = client.lastServed.filter(obj => obj.serviceCategory == "Food_Pantry")
// 	lastServedFood.forEach((svcItem) => {
// 		if (svcItem !== "Emergency") {
// 			let lastServedDay = moment(svcItem.serviceDateTime).startOf('day')
// 			if (svcItem.isUSDA === "USDA") {
// 				lastServed.daysUSDA = moment().diff(lastServedDay, 'days')
// 			} else {
// 				lastServed.daysNonUSDA = moment().diff(lastServedDay, 'days')
// 			}
// 		}
// 	})
// 	lastServed.lowestDays = lastServed.daysUSDA
// 	if (lastServed.daysNonUSDA < lastServed.daysUSDA) lastServed.lowestDays = lastServed.daysNonUSDA
// 	let lastServedBackToSchool = client.lastServed.filter(obj => obj.serviceCategory == "Back_To_School")
// 	if (lastServedBackToSchool.length > 0) {
// 		lastServed.backToSchool = moment(lastServedBackToSchool[0].serviceDateTime).startOf('day')
// 	}
// 	return lastServed
// }

export function getLastServedDays(client) {
    // get calculate number of days
    let lsDays = { lastServedFoodDate: null, daysUSDA:10000, daysNonUSDA:10000, lowestDays:10000, backToSchool:10000 }
    let tempUSDADate = null
    let tempNonUSDADate = null
	let foodSvcs = []
	if (client?.svcHistory.length === 0) {
        return lsDays
    } else {
        foodSvcs = client.svcHistory.filter(( svc ) => {
            return svc.svcCat == "Food_Pantry"
        })
    }
		
	foodSvcs.forEach((foodSvc) => {
		if (foodSvc.svcUSDA != "Emergency") {
            let tempLastServedFoodDate = moment(foodSvc.svcDT)
            let tempLastServedFoodDateSTART = moment(foodSvc.svcDT).startOf('day')
			if (foodSvc.svcUSDA == "USDA") {
                let diffUSDA = moment().diff(tempLastServedFoodDateSTART, 'days')
                if ( diffUSDA < lsDays.daysUSDA) {
                    lsDays.daysUSDA = diffUSDA
                    tempUSDADate = tempLastServedFoodDate
                }
			} else {
                let diffNonUSDA = moment().diff(tempLastServedFoodDateSTART, 'days')
                if ( diffNonUSDA < lsDays.daysNonUSDA) {
                    lsDays.daysNonUSDA = diffNonUSDA
                    tempNonUSDADate = tempLastServedFoodDate
                }
			}
		}
	})
	lsDays.lowestDays = lsDays.daysUSDA
    lsDays.lastServedFoodDate = tempUSDADate
	if (lsDays.daysNonUSDA < lsDays.daysUSDA) {
        lsDays.lowestDays = lsDays.daysNonUSDA
        lsDays.lastServedFoodDate = tempNonUSDADate
    }
	let backToSchoolSvcs = client.lastServed.filter(obj => obj.svcCat == "Back_To_School")
	if (backToSchoolSvcs.length > 0) {
		lsDays.backToSchool = moment(backToSchoolSvcs[0].serviceDateTime).startOf('day')
    }
	return lsDays
}

export function getLastServedFood(client){
	// TODO too much duplicated code with getLastServedDays()
	let lastServedFood = null
    if (client?.svcHistory.length === 0) {
        return lastServedFood
    }
	let lastServedFoodSvcs = client.svcHistory.filter(( svc ) => {
		return svc.svcCat == "Food_Pantry"
	})
	lastServedFoodSvcs.forEach((svc) => {
		if (svc.svcUSDA !== "Emergency") {
			if (moment(svc.svcDT).isAfter(lastServedFood)){
				lastServedFood = svc.svcDT
			}
		}
	})

    console.log("LAST SERVED FOOD", lastServedFood);

	return lastServedFood
}

export function getActiveSvcTypes(){
	// ACTIVE AS IN AVAILABLE TODAY
    // build Active Service Types array of Service Types which cover today's date
    let activeSvcTypes = []
    const svcTypes = getSvcTypes()        
    svcTypes.forEach((svcType) => {
        if (svcType.isActive){
            // FROM
            let fromDateString = [
                moment().year(), 
                Number(svcType.available.dateFromMonth),  
                Number(svcType.available.dateFromDay)
            ]
            let fromDate = moment(fromDateString).startOf('day')
            // TO
            let toDateString = [
                moment().year(),
                Number(svcType.available.dateToMonth),
                Number(svcType.available.dateToDay)
            ]
            let toDate = moment(toDateString).endOf('day')
            // Adjust year dependent on months of TO and FROM
            if (moment(fromDate).isAfter(toDate)) toDate = moment(toDate).add(1, 'y');
            // Adjust year if FROM is after TODAY
            if (moment(fromDate).isAfter()) {
                fromDate = moment(fromDate).subtract(1, 'y');
                toDate = moment(toDate).subtract(1, 'y');
            }
            // IN date range = ACTIVE
            if (moment().isBetween(fromDate, toDate, null, '[]')) activeSvcTypes.push(svcType)
        }
    })
    return activeSvcTypes
}

export function getTargetServices(activeServiceTypes) {
	let targets = [];
	// build list of client target items for each Active Service Type
	activeServiceTypes.forEach((aSvcType, i) => {
		// make list of specific targets.... for each type.
		targets[i] = {}
		// target homeless
		if (aSvcType.target.homeless !== "Unselected") {
            targets[i].homeless = aSvcType.target.homeless
        }
		// target families with children, singles, couples
		if (aSvcType.target.family == "Single Individual") {
			targets[i].family_totalSize = 1;
		} else if (aSvcType.target.family == "Couple") {
			targets[i].family_totalSize = 2;
			targets[i].family_totalChildren = 0;
		} else if (aSvcType.target.family == "With Children") {
			targets[i].family_totalChildren = "0";
		}
		// target gender male/female
		if (aSvcType.target.gender !== "Unselected") targets[i].gender = aSvcType.target.gender;
		// target children
		if (aSvcType.target.child == "YES") {
			targets[i].family_totalChildren = "Greater Than 0"
			// target age
			if (aSvcType.target.childMaxAge > 0) {
				targets[i].dependents_ageMin = aSvcType.target.childMinAge
				targets[i].dependents_ageMax = aSvcType.target.childMaxAge
			}
			//target grade
			if (aSvcType.target.childMinGrade !== "Unselected") {
				targets[i].dependents_gradeMin = aSvcType.target.childMinGrade;
			}
			if (aSvcType.target.childMaxGrade !== "Unselected") {
				targets[i].dependents_gradeMax = aSvcType.target.childMaxGrade;
			}
		} else if (aSvcType.target.child == "NO"){
			targets[i].family_totalChildren = "0";
		}
		// target Voucher Service
		if (aSvcType.target.service !== "Unselected") {
			targets[i].service = aSvcType.target.service; //set target to Voucher service ID
		}
    })
	return targets;
}



//******************************************************************
//**** JAVASCRIPT FUNCTIONS FOR USE WITHIN EXPORTABLE FUNCTIONS ****
//******************************************************************



function getActiveServicesButtons( props ) {	
    const { client, buttons, activeServiceTypes, targetServices, lastServedDays } = props
	let	btnPrimary = [];
	let btnSecondary = [];
    let validDependents = []
    const intervals = getFoodInterval(activeServiceTypes)

    // check for not a valid service based on interval between services  
	activeServiceTypes.forEach((svc, i) => {
		let display = true;
		if (!validateSvcInterval({ client, activeServiceType: svc, lastServedDays, intervals })) return;
		// loop through each property in each targetServices
		for (let prop in targetServices[i]) {
			if (prop=="family_totalChildren") {
				// TODO move to grade and age target detection to helper function
				if (targetServices[i]['dependents_gradeMin'] !== "Unselected" && targetServices[i]['dependents_gradeMax']!== "Unselected"){
					validDependents = calcValidAgeGrade({ client: client, gradeOrAge: "grade", targetService: targetServices[i] })
				}
				//TODO change service types to store non age entries as -1
				if (targetServices[i]['dependents_ageMax'] > 0){
					validDependents = calcValidAgeGrade({ client: client, gradeOrAge: "age", targetService: targetServices[i] })
				}
				if (validDependents.length == 0) display = false
			}
			if (prop == "service") { // targeting a voucher fulfill service
                // TODO CLEANUP AND REBUILD VOUCHERS
				// let servicesVouchers = utilCalcVoucherServiceSignup(client, activeServiceTypes[i])
				// if (servicesVouchers.length !== 1) display = false
                // utilCalcVoucherServiceSignupAsync(client, svc).then(
                //     vouchers => {
                //         if (vouchers.length !== 1) display = false
                //     }
                // )
			} else if (targetServices[i][prop] != client[prop]
					&& prop.includes("family")==false
					&& prop.includes("dependents")==false) display = false
		}
		if (display) {
            let btn = Object.assign({}, svc)
            // btnType is used to display "normal" button (grey outline), "highlight" button (red outline), 
            // or "used" button, (undo icon)
            btn.btnType = "normal"
            
            if (svc.svcBtns == "Primary") {
                if ((btn.svcCat === "Administration") || (btn.svcUSDA == "Emergency")) {
                    btn.btnType = "highlight"
                }      
                btnPrimary.push(btn)
            } else {
                btnSecondary.push(btn)
            }
		}

    })
    return (buttons == "primary") ? btnPrimary : btnSecondary
}

function getUsedServicesButtons( client, buttons, buttonData ) {
    const svcHist = client.svcHistory
    const servedCount = svcHist.length
    let btn = null

    if (servedCount > 0) {
        if (buttons == "primary") {
            svcHist.forEach((histItem) => {
                // if record is from today
                if ((moment(histItem.svcDT).isSame(moment(), "day")) && (histItem.svcBtns == "Primary")) {
                    let index = null
                    buttonData.primary.forEach((btnSvc, i) => {
                        if (histItem.svcTypeId === btnSvc.svcTypeId) index = i
                    })
                    btn = Object.assign({}, histItem)
                    btn.btnType = "used"
                    if (index !== null) {
                        buttonData.primary[index] = btn
                    } else {
                        buttonData.primary.push(btn)
                    }
                }
            })
        } else {
            // Secondary buttons
            svcHist.forEach((histItem) => {
                if (moment(histItem.svcDT).isSame(new Date(), "day")) {
                    if (histItem.svcBtns == "Secondary") {
                        buttonData[buttons].forEach((btnSvc, i) => {
                            if (histItem.svcTypeId === btnSvc.svcTypeId) {
                                btn = Object.assign({}, histItem)
                                btn.btnType = "used"
                                buttonData[buttons][i] = btn 
                            }
                        })
                    }
                }
            })
        } 
    }
    return buttonData[buttons]
}

function validateSvcInterval( props ){
    const { client, activeServiceType, lastServedDays, intervals } = props
    const lastSvcDate = moment().subtract(lastServedDays.lowestDays, 'days')
    const targetDate = moment(lastSvcDate).add(14, 'days').endOf('day'); // removes time of day so calculation is from end of service day
    const nextSvcDate = calFindOpenDate(targetDate, 7);
    const isSameOrAfter = moment().isSameOrAfter(nextSvcDate, 'day')
    
	if (activeServiceType.svcBtns == "Primary") {
		const svcCat = activeServiceType.svcCat
		if (svcCat == "Food_Pantry") {
            // CALCULATE THE NEXT VISIT DATE BASED ON OPEN DAYS
            if ( isSameOrAfter ) {
                if (activeServiceType.svcUSDA == "USDA") {
                    // Default to USDA if it qualifies
                    if (lastServedDays.daysUSDA >= intervals.USDA) return true
                    return false
                }
                if (activeServiceType.svcUSDA === "NonUSDA") {
                    // NonUSDA only if USDA does not Qualify and NOT serviced today
                    if (lastServedDays.daysUSDA < intervals.USDA) return true
                    return false
                }
                // No Emergency Food
                if (activeServiceType.svcUSDA === "Emergency") return false
        
            } else {
                // Emergency only if not day of service
                if (activeServiceType.svcUSDA === "Emergency") {
                    if (!lastSvcDate.isSame(moment(), 'day')) return true
                }
                return false
            }
		}
        // MAY NOT NEED TO CHECK CLOTHES INTERVAL OR CHECK LAST CLOTHES SERVICE ???
		// if (serviceCategory === "Clothes_Closet") {

        //     console.log("LOWEST DAY CLOTHES", lastServed.lowestDays)

		// 	if (lastServed.lowestDays === 0) return false
		// }
		// validate that a voucher was already registered for
		if (activeServiceType.fulfillment.type == "Voucher_Fulfill") {
			//serviceHistory = dbGetClientActiveServiceHistory(client)
			//const voucherHistory = utilCalcVoucherServiceSignup(activeServiceType)
			const voucherHistory = utilGetVoucherTargetService({ svcHistory: client.svcHistory, serviceType: activeServiceType })
			let voucherDays = 10000
			if (voucherHistory.length == 1) {
				voucherDays = moment().diff(voucherHistory[0].svcDT, 'days')
			}
			if (activeServiceType.target.service == "Unselected") {
				if (voucherDays < activeServiceType.svcInterval) return false
            } else {
				if (voucherDays == 10000) return false
			}
		}
		//TODO: this is a workaround due to last served not tracking id. Need last served to track by service id.
        
        // *****  Disabled during svc table update ******

		// if (activeServiceType.fulfillment.type == "Voucher"){
		// 	let service = dbGetSvcsBysvcTypeDateAsync(activeServiceType.svcTypeId, moment().year())
        //         .then((svcs) => {
        //             return svcs.filter(obj => obj.cId == client.clientId)
        //         })
				
		// 	if (service.length == 0){
		// 		return true;
		// 	}
		// 	else {
		// 		return false;
		// 	}
		// }
		let inLastServed = client.lastServed.filter(obj => obj.svcCat == svcCat)
		if (inLastServed.length > 0) {
			// if a voucher fulfill service then need to chech against Voucher service
			if (activeServiceType.fulfillment.type == "Voucher_Fulfill") {
				// get voucher service
				const voucherHistory = getHistoryLastService({ svcHistory: client.svcHistory, serviceType: activeServiceType })
				if (voucherHistory.length > 0) {
					return false;
				}
			} else {
				inLastServed = inLastServed[0].serviceDateTime
			}
		} else if (svcCat == "Administration") {
			inLastServed = client.familyIdCheckedDate
		} else {
			inLastServed = "2000-01-01"
		}
		const lastServedDate = moment(inLastServed).startOf('day')
		if (moment().startOf('day').diff(lastServedDate, 'days') < activeServiceType.svcInterval) return false
	} else {
		// secondary buttons
        // Greater than 0 lowest day is used to provide same day buffer for secondary buttons
        if ( (isSameOrAfter === false) && (moment().diff(lastSvcDate) > 1)) {
            // if (lastServed.lowestDays < activeServiceType.svcInterval) 
            return false
        }
	}
	// default: show button
	return true
}

function calcValidAgeGrade(at){ 
    const { client, gradeOrAge, targetService } = at
	let dependents = []
	for (let j = 0; j < client.dependents.length; j++) {
		if (at.gradeOrAge=="grade" &&
		!(client.dependents[j].grade == undefined || client.dependents[j].grade == "") && client.dependents[j].isActive=="Active"){
			let currentGrade = utilGradeToNumber(client.dependents[j].grade)
			if (currentGrade >= utilGradeToNumber(targetService['dependents_gradeMin'])
			&& currentGrade <= utilGradeToNumber(targetService['dependents_gradeMax'])){
				dependents.push(client.dependents[j])
			}
		}
		if (gradeOrAge == "age" && client.dependents[j].isActive == "Active"){
			let age = client.dependents[j].age
			if (age >= targetService['dependents_ageMin']
			&& age <= targetService['dependents_ageMax']){
				dependents.push(client.dependents[j])
			}
		}
  }
	return dependents
}

async function utilCalcVoucherServiceSignupAsync(client, serviceType){
	return await dbGetClientActiveSvcHistoryAsync(client.clientId).then(
        clientHistory => {
            return clientHistory.filter(item => moment(item.svcDT).year() == moment().year()) // current year service
                .filter(item => item.svcTypeId == serviceType.target.service)
        }
    )
}

function utilGetVoucherTargetService(props){
    const { svcHistory, serviceType } = props
    return svcHistory
        .filter(item => moment(item.svcDT).year() == moment().year())
        .filter(item => item.svcTypeId == serviceType.target.service)
}

function getHistoryLastService( props ){
    const { svcHistory, serviceType } = props
	return svcHistory.filter(item => moment(item.svcDT).year() == moment().year()) // current year service
	.filter(item => item.svcTypeId == serviceType.svcTypeId)
}

function calcServiceFamilyCounts(svcTypes, client, svcTypeId){
	const svcType = getServiceTypeByID(svcTypes, svcTypeId)
	let servedCounts = {
		adults: String(client.family.totalAdults),
		children: String(client.family.totalChildren),
		individuals: String(client.family.totalSize),
		seniors: String(client.family.totalSeniors),
		svcItems: String(svcType.numberItems)
	}
	let targetService = utilCalcTargetServices([svcType])

	if (svcType.itemsPer == "Person") {
		servedCounts.svcItems = String(servedCounts.svcItems * client.family.totalSize)
		if (svcType.fulfillment.type =="Voucher"){
			if (svcType.target.service == "Unselected" && svcType.svcCat == "Back_To_School") {
				servedCounts = {
					adults: 0,
					children: 0,
					individuals: 0,
					seniors: 0,
					svcItems: 0,
				}
			} else {
				let numChildren = 0;
				if (targetService[0].dependents_ageMax !== undefined){
					numChildren = calcValidAgeGrade("age", targetService[0]).length
				}
				if (targetService[0].dependents_gradeMax !== undefined){
					numChildren = Math.abs(numChildren - calcValidAgeGrade("grade", targetService[0]).length)
				}

				servedCounts = {
					adults: 0,
					children: numChildren,
					individuals: numChildren,
					seniors: 0,
					svcItems: svcType.numberItems * numChildren,
				}
			}
		}
	}
	return servedCounts
}

function getServiceTypeByID(svcTypes, svcTypeId){
	let svcTypeArr = svcTypes.filter(function( obj ) {
		return obj.svcTypeId == svcTypeId
	})
	return svcTypeArr[0]
}

function utilBuildServiceRecord(serviceType, svcId, servedCounts, svcValid, client){
	// TODO add validation isActive(Client/NonClient) vs (Service Area Zipcodes)
	// let emergencyFood = "NO",
			// servicedMonth = moment().format("YYYYMM"),
	// servicedDay = moment().format("YYYYMMDD")
	if (svcId == "") svcId = cuid()
	// if (serviceType.svcUSDA == "Emergency") emergencyFood = "YES"
	// define fulfillment vars for non-vouchers
	let pending = false
    let fulfillmentDateTime = moment().format('YYYY-MM-DDTHH:mm')
	let byUserName = getUserName()
	let itemCount = servedCounts.svcItems
	if (serviceType.fulfillment.type == "Voucher") {
		pending = true
		fulfillmentDateTime = ""
		byUserName = ""
		itemCount = ""
	}
	let serviceRecord = {
		svcId: svcId,
		svcValid: svcValid,
		svcDT: moment().format('YYYY-MM-DDTHH:mm'),
		// servicedDay: servicedDay,
		cId: client.clientId,
		cStatus: client.isActive,
		cGivName: client.givenName,
		cFamName: client.familyName,
		cZip: client.zipcode,
		svcBy: getUserName(),
		svcTypeId: serviceType.svcTypeId,
		svcName: serviceType.svcName,
		svcCat: serviceType.svcCat,
		svcBtns: serviceType.svcBtns,
		svcUSDA: serviceType.svcUSDA,
		svcItems: servedCounts.svcItems,
		homeless: client.homeless,
		// emergencyFood: emergencyFood,
		adults: servedCounts.adults,
		children: servedCounts.children,
		seniors: servedCounts.seniors,
        individuals: servedCounts.individuals,
		fillPending: pending,
        fillDT: fulfillmentDateTime,
		fillVoucher: "",
        fillBy: byUserName,
        fillItems: itemCount
	}

	return serviceRecord
}

function printSvcReceipt(client, svcTypes, svcType, svcTypeId, svcCat) {
    if (svcCat === 'Food_Pantry') {
        // TODO Use function here
        let service = svcTypes.filter(function( obj ) {
                return obj.svcTypeId === svcTypeId
            })[0]
        prnPrintFoodReceipt(client, service.svcUSDA )
        if (client.isActive === 'Client') {
            // Determine next visit date
            let targetDate = moment().add(14, 'days');
            let nextVisit = calFindOpenDate(targetDate, 7);
            prnPrintReminderReceipt(client, nextVisit);
        }
    } else if (svcCat == 'Clothes_Closet') {
        prnPrintClothesReceipt( client, svcType )
    } else if (svcCat == 'Back_To_School' && svcType.target.service == 'Unselected') { // ignore fulfillment
        const targetService = utilCalcTargetServices([svcType])
        const dependents = calcValidAgeGrade({ client: client, gradeOrAge: "grade", targetService: targetService[0] })
        // TODO use function here
        //let service = svcTypes.filter(obj => obj.svcTypeId == svcTypeId)[0]
        prnPrintVoucherReceipt( client, svcType, dependents, 'grade' );
        prnPrintVoucherReceipt( svcType, dependents, 'grade');
    } else if (svcCat == 'Thanksgiving' && svcType.target.service == 'Unselected') { // ignore fulfillment
        //const targetService = utilCalcTargetServices([svcType])
        // TODO use function here
        let service = svcTypes.filter(obj => obj.svcTypeId == svcTypeId)[0]
        prnPrintVoucherReceipt({ service: service })
        prnPrintVoucherReceipt({ service: service })
    } else if (svcCat == 'Christmas' && svcType.target.service == 'Unselected') { // ignore fulfillment
        const targetService = utilCalcTargetServices([svcType])
        let service = svcTypes.filter(obj => obj.svcTypeId == svcTypeId)[0]
        if (targetService[0].family_totalChildren == "Greater Than 0") {
            const dependents = calcValidAgeGrade({ client: client, gradeOrAge: "age", targetService: targetService[0] })
            prnPrintVoucherReceipt(svcType, dependents, 'age');
            prnPrintVoucherReceipt(svcType, dependents, 'age');
        } else {
            prnPrintVoucherReceipt({ service: service });
            prnPrintVoucherReceipt({ service: service });
        }
    }
    prnFlush();
}