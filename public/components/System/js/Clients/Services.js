//******************************************************************
//****** CLIENTS ServiceInstance SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import { isEmpty } from '../GlobalUtils.js';
import moment from  'moment';
import { utilGradeToNumber, utilCalcTargetServices } from '../Clients/ClientUtils'
import { dbGetClientActiveServiceHistoryAsync, dbSaveServiceRecordAsync, getSvcTypes, 
    getSession, dbSaveLastServedAsync } from '../Database';
import { prnPrintFoodReceipt, prnPrintClothesReceipt, prnPrintReminderReceipt,
            prnPrintVoucherReceipt, prnFlush } from '../Clients/Receipts';
import cuid from 'cuid';

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function addService(props){
    const { client, serviceTypeId, serviceCategory, svcButtons, svcsRendered } = props
    const svcTypes = getSvcTypes()
	let serviceType = getServiceTypeByID(svcTypes, serviceTypeId)
	let serviceId = "" // new service
    let serviceValid = true
    
    console.log(svcsRendered)
    console.log(svcsRendered.indexOf(serviceTypeId))

	// save service record
	const servedCounts = calcServiceFamilyCounts( svcTypes, client, serviceTypeId)
    const serviceRecord = utilBuildServiceRecord( serviceType, serviceId, servedCounts, serviceValid, client )
    
console.log("SERVICE RECORD", serviceRecord)

    function callback(result, msg){
        console.log("dbSaveServiceAsync = " + result + " " + msg)
    }

	dbSaveServiceRecordAsync(serviceRecord, callback).then((result) => {
        if (serviceType.serviceButtons == "Primary" && result == "success"){
            dbSaveLastServedAsync(client, serviceTypeId, serviceType.serviceCategory, servedCounts.itemsServed, serviceType.isUSDA)
        }

        if (serviceId === "" && result === "success") {
            if (serviceCategory === 'Food_Pantry') {
                // TODO Use function here
                let service = svcTypes.filter(function( obj ) {
                        return obj.serviceTypeId === serviceTypeId
                    })[0]
                prnPrintFoodReceipt({ client: client, isUSDA: service.isUSDA })
                if (client.isActive === 'Client') {
                    prnPrintReminderReceipt( client )
                }
            } else if (serviceCategory == 'Clothes_Closet') {
                prnPrintClothesReceipt({ client: client, serviceType: serviceType })
            } else if (serviceCategory == 'Back_To_School' && serviceType.target.service == 'Unselected') { // ignore fulfillment
                const targetService = utilCalcTargetServices([serviceType])
                const dependents = calcValidAgeGrade({ client: client, gradeOrAge: "grade", targetService: targetService[0] })
                // TODO use function here
                let service = svcTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
                prnPrintVoucherReceipt({ client: client, serviceType: serviceType, dependents: dependents, gradeOrAge: 'grade' });
                prnPrintVoucherReceipt(serviceType, dependents, 'grade');
            } else if (serviceCategory == 'Thanksgiving' && serviceType.target.service == 'Unselected') { // ignore fulfillment
                const targetService = utilCalcTargetServices([serviceType])
                // TODO use function here
                let service = svcTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
                prnPrintVoucherReceipt({ service: service })
                prnPrintVoucherReceipt({ service: service })
            } else if (serviceCategory == 'Christmas' && serviceType.target.service == 'Unselected') { // ignore fulfillment
                const targetService = utilCalcTargetServices([serviceType])
                let service = svcTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
                if (targetService[0].family_totalChildren == "Greater Than 0") {
                    const dependents = calcValidAgeGrade({ client: client, gradeOrAge: "age", targetService: targetService[0] })
                    prnPrintVoucherReceipt(serviceType, dependents, 'age');
                    prnPrintVoucherReceipt(serviceType, dependents, 'age');
                } else {
                    prnPrintVoucherReceipt({ service: service });
                    prnPrintVoucherReceipt({ service: service });
                }
            }
            prnFlush();
            
            
            // if (undoneService === true) return 'undone'
            if (serviceId === "" && result == "success") return serviceRecord
        }
    })

	
}

export function getButtonData( at ) {
    const { client, buttons } = at
	if (isEmpty(client)) return
    let buttonData = {}
    buttonData.lastServed = getLastServedDays(client) // Returns number of days since for USDA, NonUSDA, lowest & BackToSchool
    buttonData.activeServiceTypes = getActiveSvcTypes() // reduces serviceTypes list for which today is NOT active date range
    const targetServices = getTargetServices(buttonData.activeServiceTypes); // list of target properties for each serviceType
    buttonData[buttons] = getActiveServicesButtons(
        { client: client, buttons: buttons, activeServiceTypes: buttonData.activeServiceTypes, 
            targetServices: targetServices, lastServed: buttonData.lastServed });
    return buttonData
}

export function getFoodInterval(isUSDA){
    const svcTypes = getSvcTypes()
	for (var i = 0; i < svcTypes.length; i++) {
		if ((svcTypes[i].serviceButtons == "Primary") && (svcTypes[i].serviceCategory == "Food_Pantry") && (svcTypes[i].isUSDA == isUSDA)){
			return svcTypes[i].serviceInterval
		}
	}
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
	// get Last Served Date from client object & calculate number of days
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

//******************************************************************
//**** JAVASCRIPT FUNCTIONS FOR USE WITHIN EXPORTABLE FUNCTIONS ****
//******************************************************************

function getLastServedDays(client) {
	// get Last Served Date from client object & calculate number of days
    let lastServed = { daysUSDA:10000, daysNonUSDA:10000, lowestDays:10000, backToSchool:10000 }
// console.log(client.lastServed)

	if(client === undefined) { return null; }
	if (client.lastServed[0] == undefined) return lastServed;
	let lastServedFood = client.lastServed.filter(obj => obj.serviceCategory === "Food_Pantry")

	for (var i = 0; i < lastServedFood.length; i++) {
		if (lastServedFood[i].isUSDA != "Emergency") {
			let lastServedDay = moment(lastServedFood[i].serviceDateTime).startOf('day')
			if (lastServedFood[i].isUSDA == "USDA") {
				lastServed.daysUSDA = moment().diff(lastServedDay, 'days')
			} else {
				lastServed.daysNonUSDA = moment().diff(lastServedDay, 'days')
			}
		}
	}
	lastServed.lowestDays = lastServed.daysUSDA
	if (lastServed.daysNonUSDA < lastServed.daysUSDA) lastServed.lowestDays = lastServed.daysNonUSDA
	let lastServedBackToSchool = client.lastServed.filter(obj => obj.serviceCategory == "Back_To_School")
	if (lastServedBackToSchool.length > 0) {
		lastServed.backToSchool = moment(lastServedBackToSchool[0].serviceDateTime).startOf('day')
    }
    
console.log(lastServed)
    
	return lastServed
}

function getActiveSvcTypes(){
	// build Active Service Types array of Service Types which cover today's date
    let activeSvcTypes = []
    const svcTypes = getSvcTypes()        
    for (let i=0; i < svcTypes.length; i++){
        if (svcTypes[i].isActive == "Active"){
            // FROM
            let fromDateString = []
            fromDateString.push(moment().year())
            fromDateString.push(Number(svcTypes[i].available.dateFromMonth))
            fromDateString.push(Number(svcTypes[i].available.dateFromDay))
            let fromDate = moment(fromDateString).startOf('day')
            // TO
            let toDateString = []
            toDateString.push(moment().year())
            toDateString.push(Number(svcTypes[i].available.dateToMonth))
            toDateString.push(Number(svcTypes[i].available.dateToDay))
            let toDate = moment(toDateString).endOf('day')
            // Adjust year dependent on months of TO and FROM
            if (moment(fromDate).isAfter(toDate)) toDate = moment(toDate).add(1, 'y');
            // Adjust year if FROM is after TODAY
            if (moment(fromDate).isAfter()) {
                fromDate = moment(fromDate).subtract(1, 'y');
                toDate = moment(toDate).subtract(1, 'y');
            }
            // IN date range = ACTIVE
            if (moment().isBetween(fromDate, toDate, null, '[]')) activeSvcTypes.push(svcTypes[i])
        }
    }
    return activeSvcTypes
}

function getTargetServices(activeServiceTypes) {
	let targets = [];
	// build list of client target items for each Active Service Type
	for (let i = 0; i < activeServiceTypes.length; i++) {
		// make list of specific targets.... for each type.
		targets[i] = {}
		// target homeless
		if (activeServiceTypes[i].target.homeless !== "Unselected") {
            targets[i].homeless = activeServiceTypes[i].target.homeless
        }
		// target families with children, singles, couples
		if (activeServiceTypes[i].target.family == "Single Individual") {
			targets[i].family_totalSize = 1;
		} else if (activeServiceTypes[i].target.family == "Couple") {
			targets[i].family_totalSize = 2;
			targets[i].family_totalChildren = 0;
		} else if (activeServiceTypes[i].target.family == "With Children") {
			targets[i].family_totalChildren = "0";
		}
		// target gender male/female
		if (activeServiceTypes[i].target.gender !== "Unselected") targets[i].gender = activeServiceTypes[i].target.gender;
		// target children
		if (activeServiceTypes[i].target.child == "YES") {
			targets[i].family_totalChildren = "Greater Than 0"
			// target age
			if (activeServiceTypes[i].target.childMaxAge > 0) {
				targets[i].dependents_ageMin = activeServiceTypes[i].target.childMinAge
				targets[i].dependents_ageMax = activeServiceTypes[i].target.childMaxAge
			}
			//target grade
			if (activeServiceTypes[i].target.childMinGrade !== "Unselected") {
				targets[i].dependents_gradeMin = activeServiceTypes[i].target.childMinGrade;
			}
			if (activeServiceTypes[i].target.childMaxGrade !== "Unselected") {
				targets[i].dependents_gradeMax = activeServiceTypes[i].target.childMaxGrade;
			}
		} else if (activeServiceTypes[i].target.child == "NO"){
			targets[i].family_totalChildren = "0";
		}
		// target Voucher Service
		if (activeServiceTypes[i].target.service !== "Unselected") {
			targets[i].service = activeServiceTypes[i].target.service; //set target to Voucher service ID
		}
    }
	return targets;
}

function getActiveServicesButtons( at ) {	
    const { client, buttons, activeServiceTypes, targetServices, lastServed } = at
	let	btnPrimary = [];
	let btnSecondary = [];
    let validDependents = []
      
	for (let i = 0; i < activeServiceTypes.length; i++) {
		let display = true;
		// check for not a valid service based on interval between services
		if (!validateServiceInterval(
            { client: client, activeServiceType: activeServiceTypes[i], 
                activeServiceTypes: activeServiceTypes, lastServed: lastServed })) continue;
		// loop through each property in each targetServices
		for (let prop in targetServices[i]) {
			if (prop=="family_totalChildren") {
				// TODO move to grade and age target detection to helper function
				if (targetServices[i]['dependents_gradeMin'] != "Unselected" && targetServices[i]['dependents_gradeMax']!="Unselected"){
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
                utilCalcVoucherServiceSignupAsync(client, activeServiceTypes[i]).then(
                    vouchers => {
                        if (vouchers.length !== 1) display = false
                    }
                )
			} else if (targetServices[i][prop] != client[prop]
					&& prop.includes("family")==false
					&& prop.includes("dependents")==false) display = false
		}
		if (display) {
			if (activeServiceTypes[i].serviceButtons == "Primary") {
				if (activeServiceTypes[i].serviceCategory == "Food_Pantry") {
					btnPrimary.unshift(i)
				} else {
					btnPrimary.push(i)
				}
			} else {
				btnSecondary.push(i)
			}
		}
    }
	// used to prompt service if a dependent child's grade is not set
	if (client.dependents.length > 0) {
		for (var i = 0; i < client.dependents.length; i++) {
			if (client.dependents[i].age < 18 && (client.dependents[i].grade == undefined || client.dependents[i].grade == "")) {
				btnPrimary = "-1"
				btnSecondary = ""
			}
		}
    }
	if (buttons == "primary") return btnPrimary
	if (buttons == "secondary") return btnSecondary
}

function validateServiceInterval( at ){
    const { client, activeServiceType, activeServiceTypes, lastServed } = at
	if (activeServiceType.serviceButtons == "Primary") {
		const serviceCategory = activeServiceType.serviceCategory
		if (serviceCategory == "Food_Pantry") {
			let nonUSDAServiceInterval = utilCalcFoodInterval("NonUSDA", activeServiceTypes)
			let USDAServiceInterval = utilCalcFoodInterval("USDA", activeServiceTypes)
			if (lastServed.daysUSDA >= USDAServiceInterval) {
				if (activeServiceType.isUSDA == "USDA") return true
				return false
			}
			if (lastServed.lowestDays >= nonUSDAServiceInterval) {
				if (activeServiceType.isUSDA == "NonUSDA") return true
				return false
			}
			if (lastServed.lowestDays < nonUSDAServiceInterval) {
				if (activeServiceType.isUSDA == "Emergency") return true
				return false
			}
		}
		if (serviceCategory == "Clothes_Closet") {
			if (lastServed.lowestDays < activeServiceType.serviceInterval) return false
		}
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
			let service = dbGetServicesByIdAndYear(activeServiceType.serviceTypeId, moment().year())
				.filter(obj => obj.clientServedId == client.clientId)
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
		if (lastServed.lowestDays < activeServiceType.serviceInterval) return false
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

function utilCalcFoodInterval(isUSDA, activeServiceTypes) {
	let foodServiceInterval = ""
	for (var i = 0; i < activeServiceTypes.length; i++) {
		if (activeServiceTypes[i].serviceCategory == "Food_Pantry" && activeServiceTypes[i].serviceButtons == "Primary" && activeServiceTypes[i].isUSDA == isUSDA) {
			foodServiceInterval = activeServiceTypes[i].serviceInterval
		}
	}
	return foodServiceInterval
}

function utilGetVoucherTargetService(at){
    const { svcHistory, serviceType } = at
console.log(at)
console.log(svcHistory)

    return svcHistory
        .filter(item => moment(item.servicedDateTime).year() == moment().year())
        .filter(item => item.serviceTypeId == serviceType.target.service)
}

function getHistoryLastService( at ){
    const { svcHistory, serviceType } = at
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
	console.log(svcType)
	console.log(svcType.fulfillment);
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
	if (serviceValid) {
		servicesRendered.push(serviceRecord)
	} else {
		const temp = servicesRendered.filter(item => item.serviceId !== serviceId)
		servicesRendered = temp
	}
	return serviceRecord
}

