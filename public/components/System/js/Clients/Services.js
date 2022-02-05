//******************************************************************
//****** CLIENTS ServiceInstance SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import { isEmpty } from '../GlobalUtils.js';
import moment from  'moment';
import { utilGradeToNumber, utilCalcTargetServices } from './ClientUtils'
import { dbGetClientActiveServiceHistoryAsync, dbSaveServiceRecordAsync, getSvcTypes, 
    getSession, dbSaveLastServedAsync, dbGetSvcsByIdAndYear } from '../Database';
import { calFindOpenDate } from '../Calendar.js';
import { prnPrintFoodReceipt, prnPrintClothesReceipt, prnPrintReminderReceipt,
            prnPrintVoucherReceipt, prnFlush } from './Receipts';
import cuid from 'cuid';

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export async function addServiceAsync( client, serviceTypeId ){
    // const { client, serviceTypeId, serviceCategory } = props
    const svcTypes = getSvcTypes()
	const svcType = getServiceTypeByID(svcTypes, serviceTypeId)
    const serviceCategory = svcType.serviceCategory
	const serviceId = "" // new service
    const serviceValid = true
    const newClient = Object.assign({}, client) 
    
	// save service record
	const servedCounts = calcServiceFamilyCounts( svcTypes, client, serviceTypeId)
    const svcRecord = utilBuildServiceRecord( svcType, serviceId, servedCounts, serviceValid, client )

	return await dbSaveServiceRecordAsync(svcRecord)
        .then((savedSvc) => {
            if (Object.keys(savedSvc).length === 0) {
                if (svcType.serviceButtons === "Primary"){
                    dbSaveLastServedAsync(client, serviceTypeId, svcType.serviceCategory, servedCounts.itemsServed, svcType.isUSDA)
                        .then((newLastServed) => {
                            newClient.lastServed = newLastServed
                        })
                }
                if (serviceId === "") {
                    printSvcReceipt(client, svcTypes, svcType, serviceTypeId, serviceCategory)                    
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
    const { client, buttons } = props
	if (isEmpty(client)) return
    let buttonData = {}
    // Returns number of days since for USDA, NonUSDA, lowest & BackToSchool
    buttonData.lastServed = getLastServedDays(client)
    // reduces serviceTypes list if today is NOT active date range
    buttonData.activeServiceTypes = getActiveSvcTypes()
    // list of target properties for each serviceType
    const targetServices = getTargetServices(buttonData.activeServiceTypes); 
    buttonData[buttons] = getActiveServicesButtons(
        { client: client, buttons: buttons, activeServiceTypes: buttonData.activeServiceTypes, 
            targetServices: targetServices, lastServed: buttonData.lastServed });
    if (buttonData[buttons].length > 0 ) {
        // list of buttns that have been used today
        buttonData[buttons] = getUsedServicesButtons(client, buttons, buttonData)
        // sort the button in category and alpha order
        buttonData[buttons] = sortButtons(buttonData[buttons])
    }
    return buttonData[buttons]
}

export function sortButtons(btns){
    const cats = { food: [], clothes: [], admin: [], misc: [] }  
    if (btns[0].serviceButtons === "Primary") {
        btns.forEach(svc => {
            if (svc.serviceCategory === "Food_Pantry") {
                cats.food.push(svc)
            } else if (svc.serviceCategory === "Clothes_Closet") {
                cats.clothes.push(svc)
            } else if (svc.serviceCategory === "Administration") {
                cats.admin.push(svc)
            } else {
                cats.misc.push(svc)
            }
        })
        return cats.food.concat(cats.clothes, cats.admin, cats.misc)
    } else {
        return btns.sort(function(a, b){
            if (a.serviceName < b.serviceName) return -1;
            if (a.serviceName > b.serviceName) return 1;
            return 0;
        })
    }
}

export function getFoodInterval(aSvcTypes){
    const svcTypes = aSvcTypes ? aSvcTypes : getSvcTypes()
    const usdaArray = [ 'NonUSDA', 'USDA', 'Emergency' ]
    const foodInt = {}
	svcTypes.forEach((type) => {
        usdaArray.forEach((isUSDA) => {
            if ((type.serviceButtons == "Primary") && (type.serviceCategory == "Food_Pantry") && (type.isUSDA == isUSDA)){
                foodInt[isUSDA] = type.serviceInterval
            }
        })
	})
    return foodInt
}

export function getSvcsRendered(svcHistory){
    let svcsRendered = []
    svcHistory.forEach((svc) => {
        if (moment().isSame(svc.servicedDateTime, "day")) {
            svcsRendered.push(svc)
		}
    })
    return svcsRendered
}

export function utilCalcLastServedDays(client) {
	// get Last Served Date from client & calculate number of days
	const lastServed = { daysUSDA:10000, daysNonUSDA:10000, lowestDays:10000, backToSchool:10000 }
	if (client.lastServed[0] === undefined) return lastServed
	const lastServedFood = client.lastServed.filter(obj => obj.serviceCategory == "Food_Pantry")
	lastServedFood.forEach((svcItem) => {
		if (svcItem !== "Emergency") {
			let lastServedDay = moment(svcItem.serviceDateTime).startOf('day')
			if (svcItem.isUSDA === "USDA") {
				lastServed.daysUSDA = moment().diff(lastServedDay, 'days')
			} else {
				lastServed.daysNonUSDA = moment().diff(lastServedDay, 'days')
			}
		}
	})
	lastServed.lowestDays = lastServed.daysUSDA
	if (lastServed.daysNonUSDA < lastServed.daysUSDA) lastServed.lowestDays = lastServed.daysNonUSDA
	let lastServedBackToSchool = client.lastServed.filter(obj => obj.serviceCategory == "Back_To_School")
	if (lastServedBackToSchool.length > 0) {
		lastServed.backToSchool = moment(lastServedBackToSchool[0].serviceDateTime).startOf('day')
	}
	return lastServed
}

export function getLastServedFood(client){
	// TODO too much duplicated code with utilCalcLastServedDays()
	let lastServedFood = "1900-01-01"
    if (client.svcHistory[0] === undefined) {
        return "Never"
    }
	let lastServedFoodSvcs = client.svcHistory.filter(( svc ) => {
		return svc.serviceCategory == "Food_Pantry"
	})
	lastServedFoodSvcs.forEach((svc) => {
		if (svc.isUSDA !== "Emergency") {
			if (moment(svc.servicedDateTime).isAfter(lastServedFood)){
				lastServedFood = svc.servicedDateTime
			}
		}
	})
	return lastServedFood
}

//******************************************************************
//**** JAVASCRIPT FUNCTIONS FOR USE WITHIN EXPORTABLE FUNCTIONS ****
//******************************************************************

function getLastServedDays(client) {
	// get Last Served Date from client & calculate number of days
    let lsDays = { daysUSDA:10000, daysNonUSDA:10000, lowestDays:10000, backToSchool:10000 }
	if(client === undefined) { return null; }
	if (client.lastServed[0] == undefined) return lsDays;
	let lastServedFood = client.lastServed.filter(obj => obj.serviceCategory === "Food_Pantry")

	lastServedFood.forEach((foodSvc) => {
		if (foodSvc.isUSDA != "Emergency") {
			let lastServedDay = moment(foodSvc.serviceDateTime).startOf('day')
			if (foodSvc.isUSDA == "USDA") {
				lsDays.daysUSDA = moment().diff(lastServedDay, 'days')
			} else {
				lsDays.daysNonUSDA = moment().diff(lastServedDay, 'days')
			}
		}
	})
	lsDays.lowestDays = lsDays.daysUSDA
	if (lsDays.daysNonUSDA < lsDays.daysUSDA) lsDays.lowestDays = lsDays.daysNonUSDA
	let lastServedBackToSchool = client.lastServed.filter(obj => obj.serviceCategory == "Back_To_School")
	if (lastServedBackToSchool.length > 0) {
		lsDays.backToSchool = moment(lastServedBackToSchool[0].serviceDateTime).startOf('day')
    }
	return lsDays
}

function getActiveSvcTypes(){
	// build Active Service Types array of Service Types which cover today's date
    let activeSvcTypes = []
    const svcTypes = getSvcTypes()        
    svcTypes.forEach((svc) => {
        if (svc.isActive == "Active"){
            // FROM
            let fromDateString = []
            fromDateString.push(moment().year())
            fromDateString.push(Number(svc.available.dateFromMonth))
            fromDateString.push(Number(svc.available.dateFromDay))
            let fromDate = moment(fromDateString).startOf('day')
            // TO
            let toDateString = []
            toDateString.push(moment().year())
            toDateString.push(Number(svc.available.dateToMonth))
            toDateString.push(Number(svc.available.dateToDay))
            let toDate = moment(toDateString).endOf('day')
            // Adjust year dependent on months of TO and FROM
            if (moment(fromDate).isAfter(toDate)) toDate = moment(toDate).add(1, 'y');
            // Adjust year if FROM is after TODAY
            if (moment(fromDate).isAfter()) {
                fromDate = moment(fromDate).subtract(1, 'y');
                toDate = moment(toDate).subtract(1, 'y');
            }
            // IN date range = ACTIVE
            if (moment().isBetween(fromDate, toDate, null, '[]')) activeSvcTypes.push(svc)
        }
    })
    return activeSvcTypes
}

function getTargetServices(activeServiceTypes) {
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

function getActiveServicesButtons( props ) {	
    const { client, buttons, activeServiceTypes, targetServices, lastServed } = props
	let	btnPrimary = [];
	let btnSecondary = [];
    let validDependents = []
    const intervals = getFoodInterval(activeServiceTypes)

    // check for not a valid service based on interval between services  
	activeServiceTypes.forEach((svc, i) => {
		let display = true;
		if (!validateServiceInterval(
            { client: client, activeServiceType: svc, 
                lastServed: lastServed, intervals: intervals })) return;
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
				// let servicesVouchers = utilCalcVoucherServiceSignup(client, activeServiceTypes[i])
				// if (servicesVouchers.length !== 1) display = false
                utilCalcVoucherServiceSignupAsync(client, svc).then(
                    vouchers => {
                        if (vouchers.length !== 1) display = false
                    }
                )
			} else if (targetServices[i][prop] != client[prop]
					&& prop.includes("family")==false
					&& prop.includes("dependents")==false) display = false
		}
		if (display) {
            let btn = Object.assign({}, svc)
            // btnType is used to display "normal" button (grey outline), "highlight" button (red outline), 
            // or "used" button, (undo icon)
            btn.btnType = "normal"
            
            if (svc.serviceButtons == "Primary") {
                if ((btn.serviceCategory === "Administration") || (btn.isUSDA == "Emergency")) {
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
    const servedCount = svcHist ? svcHist.length : false

    let btn = null

    if (buttons == "primary") {
        if (servedCount) {
            svcHist.forEach((histItem) => {
                if (moment(histItem.servicedDateTime).isSame(new Date(), "day")) {
                    // if record is from today
                    if (histItem.serviceButtons == "Primary") {
                        let exists = false
                        buttonData.primary.forEach((btnSvc) => {
                            if (histItem.serviceTypeId === btnSvc.serviceTypeId) {
                                exists = true
                            }
                        })
                        if (!exists) {
                            btn = Object.assign({}, histItem)
                            btn.btnType = "used"
                            buttonData.primary.push(btn)
                        }
                    }
                }
            })
        }
    } else {
        if (servedCount) {
            svcHist.forEach((histItem) => {
                // const isToday = moment(histItem.servicedDateTime).isSame(new Date(), "day")
                if (moment(histItem.servicedDateTime).isSame(new Date(), "day")) {
                // if ((svc.serviceTypeId == histItem.serviceTypeId) && (isToday)) {
                    if (histItem.serviceButtons == "Secondary") {
                        buttonData[buttons].forEach((btnSvc, i) => {
                            if (histItem.serviceTypeId === btnSvc.serviceTypeId) {
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

function validateServiceInterval( props ){
    const { client, activeServiceType, lastServed, intervals } = props
	if (activeServiceType.serviceButtons == "Primary") {
		const serviceCategory = activeServiceType.serviceCategory
		if (serviceCategory == "Food_Pantry") {
            
            if (activeServiceType.isUSDA == "USDA") {
                // Default to USDA if it qualifies
                if (lastServed.daysUSDA >= intervals.USDA) {
                    console.log("USDA")
                    return true
                }
                return false
            }

            if (activeServiceType.isUSDA === "NonUSDA") {
                // NonUSDA only if USDA does not Qualify and NOT serviced today
                if ((lastServed.daysNonUSDA >= intervals.NonUSDA)
                    && (lastServed.lowestDays >= intervals.NonUSDA) 
                    && (lastServed.lowestDays < intervals.USDA) 
                    && (lastServed.daysUSDA !== 0)) {
                    console.log("NonUSDA")
                    return true
                }
                return false
            }
            
            if (activeServiceType.isUSDA === "Emergency") {
                // Emergency only if USA and NonUSDA do not Qualify
                if (lastServed.daysUSDA >= intervals.USDA) return false
                if (lastServed.lowestDays >= intervals.NonUSDA) return false
                if ((lastServed.lowestDays >= intervals.Emergency) && (lastServed.lowestDays !== 0)) return true
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
				voucherDays = moment().diff(voucherHistory[0].servicedDateTime, 'days')
			}
			if (activeServiceType.target.service == "Unselected") {
				if (voucherDays < activeServiceType.serviceInterval) return false
            } else {
				if (voucherDays == 10000) return false
			}
		}
		//TODO: this is a workaround due to last served not tracking id. Need last served to track by service id.
		if (activeServiceType.fulfillment.type == "Voucher"){
			let service = dbGetSvcsByIdAndYear(activeServiceType.serviceTypeId, moment().year())
                .then((svcs) => {
                    return svcs.filter(obj => obj.clientServedId == client.clientId)
                })
				
			if (service.length == 0){
				return true;
			}
			else {
				return false;
			}
		}
		let inLastServed = client.lastServed.filter(obj => obj.serviceCategory == serviceCategory)
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
		} else if (serviceCategory == "Administration") {
			inLastServed = client.familyIdCheckedDate
		} else {
			inLastServed = "2000-01-01"
		}
		const lastServedDate = moment(inLastServed).startOf('day')
		if (moment().startOf('day').diff(lastServedDate, 'days') < activeServiceType.serviceInterval) return false
	} else {
		// secondary buttons
        // Greater than 0 lowest day is used to provide same day buffer for secondary buttons
        if (lastServed.lowestDays > 0) {
            if (lastServed.lowestDays < activeServiceType.serviceInterval) return false
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
	return await dbGetClientActiveServiceHistoryAsync(client.id).then(
        clientHistory => {
            return clientHistory.filter(item => moment(item.servicedDateTime).year() == moment().year()) // current year service
                .filter(item => item.serviceTypeId == serviceType.target.service)
        }
    )
}

function utilGetVoucherTargetService(props){
    const { svcHistory, serviceType } = props
    return svcHistory
        .filter(item => moment(item.servicedDateTime).year() == moment().year())
        .filter(item => item.serviceTypeId == serviceType.target.service)
}

function getHistoryLastService( props ){
    const { svcHistory, serviceType } = props
	return svcHistory.filter(item => moment(item.servicedDateTime).year() == moment().year()) // current year service
	.filter(item => item.serviceTypeId == serviceType.serviceTypeId)
}

function calcServiceFamilyCounts(svcTypes, client, serviceTypeId){
	const svcType = getServiceTypeByID(svcTypes, serviceTypeId)
	let servedCounts = {
		adults: String(client.family.totalAdults),
		children: String(client.family.totalChildren),
		individuals: String(client.family.totalSize),
		seniors: String(client.family.totalSeniors),
		itemsServed: String(svcType.numberItems)
	}
	let targetService = utilCalcTargetServices([svcType])

	if (svcType.itemsPer == "Person") {
		servedCounts.itemsServed = String(servedCounts.itemsServed * client.family.totalSize)
		if (svcType.fulfillment.type =="Voucher"){
			if (svcType.target.service == "Unselected" && svcType.serviceCategory == "Back_To_School") {
				servedCounts = {
					adults: 0,
					children: 0,
					individuals: 0,
					seniors: 0,
					itemsServed: 0,
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
					itemsServed: svcType.numberItems * numChildren,
				}
			}
		}
	}
	return servedCounts
}

function getServiceTypeByID(svcTypes, serviceTypeId){
	let svcTypeArr = svcTypes.filter(function( obj ) {
		return obj.serviceTypeId == serviceTypeId
	})
	return svcTypeArr[0]
}

function utilBuildServiceRecord(serviceType, serviceId, servedCounts, serviceValid, client){
	// TODO add validation isActive(Client/NonClient) vs (Service Area Zipcodes)
	let emergencyFood = "NO",
			// servicedMonth = moment().format("YYYYMM"),
	servicedDay = moment().format("YYYYMMDD")
	if (serviceId == "") serviceId = cuid()
	if (serviceType.isUSDA == "Emergency") emergencyFood = "YES"
	// define fulfillment vars for non-vouchers
	let pending = false
    let fulfillmentDateTime = moment().format('YYYY-MM-DDTHH:mm')
	let byUserName = getSession().user.userName
	let itemCount = servedCounts.itemsServed
	if (serviceType.fulfillment.type == "Voucher") {
		pending = true
		fulfillmentDateTime = "pending"
		byUserName = "pending"
		itemCount = "pending"
	}
	let serviceRecord = {
		serviceId: serviceId,
		serviceValid: serviceValid,
		servicedDateTime: moment().format('YYYY-MM-DDTHH:mm'),
		servicedDay: servicedDay,
		clientServedId: client.clientId,
		clientStatus: client.isActive,
		clientGivenName: client.givenName,
		clientFamilyName: client.familyName,
		clientZipcode: client.zipcode,
		servicedByUserName: getSession().user.userName,
		serviceTypeId: serviceType.serviceTypeId,
		serviceName: serviceType.serviceName,
		serviceCategory: serviceType.serviceCategory,
		serviceButtons: serviceType.serviceButtons,
		isUSDA: serviceType.isUSDA,
		itemsServed: servedCounts.itemsServed,
		homeless: client.homeless,
		emergencyFood: emergencyFood,
		totalAdultsServed: servedCounts.adults,
		totalChildrenServed: servedCounts.children,
		totalSeniorsServed: servedCounts.seniors,
        totalIndividualsServed: servedCounts.individuals,
		fulfillment: {
			pending: pending,
			dateTime: fulfillmentDateTime,
			voucherNumber: "XXXXX",
			byUserName: byUserName,
			itemCount: itemCount
		}
	}
	// store for use during session
	// if (serviceValid) {
	// 	servicesRendered.push(serviceRecord)
	// } else {
	// 	const temp = servicesRendered.filter(item => item.serviceId !== serviceId)
	// 	servicesRendered = temp
	// }
	return serviceRecord
}

function printSvcReceipt(client, svcTypes, svcType, serviceTypeId, serviceCategory) {
    if (serviceCategory === 'Food_Pantry') {
        // TODO Use function here
        let service = svcTypes.filter(function( obj ) {
                return obj.serviceTypeId === serviceTypeId
            })[0]
        prnPrintFoodReceipt(client, service.isUSDA )
        if (client.isActive === 'Client') {
            // Determine next visit date
            let targetDate = moment().add(14, 'days');
            let earliestDate = moment().add(7, 'days');
            let nextVisit = calFindOpenDate(targetDate, earliestDate);
            prnPrintReminderReceipt(client, nextVisit);
        }
    } else if (serviceCategory == 'Clothes_Closet') {
        prnPrintClothesReceipt( client, svcType )
    } else if (serviceCategory == 'Back_To_School' && svcType.target.service == 'Unselected') { // ignore fulfillment
        const targetService = utilCalcTargetServices([svcType])
        const dependents = calcValidAgeGrade({ client: client, gradeOrAge: "grade", targetService: targetService[0] })
        // TODO use function here
        //let service = svcTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
        prnPrintVoucherReceipt( client, svcType, dependents, 'grade' );
        prnPrintVoucherReceipt( svcType, dependents, 'grade');
    } else if (serviceCategory == 'Thanksgiving' && svcType.target.service == 'Unselected') { // ignore fulfillment
        //const targetService = utilCalcTargetServices([svcType])
        // TODO use function here
        let service = svcTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
        prnPrintVoucherReceipt({ service: service })
        prnPrintVoucherReceipt({ service: service })
    } else if (serviceCategory == 'Christmas' && svcType.target.service == 'Unselected') { // ignore fulfillment
        const targetService = utilCalcTargetServices([svcType])
        let service = svcTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
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