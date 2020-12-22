//************************************************
//***** CLIENTS SECTION JAVASCRIPT FUNCTIONS *****
//************************************************
import { isEmpty } from './Utils.js';
import { saveRecord } from './database'

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function searchClients(str) {
    const regex = /[/.]/g
    const slashCount = (str.match(regex) || []).length
    let clientsFoundTemp = window.dbSearchClients(str, slashCount)
    
    if (clientsFoundTemp == undefined || clientsFoundTemp==null || clientsFoundTemp.length==0){
      clientsFoundTemp = []
      window.servicesRendered = [] // used temporarily to keep global vars in sync
      window.uiClearCurrentClient()
    }

    return clientsFoundTemp
}

export function arrayAddIds(array, id) {
	// Check if notes & dependents arrays already have ids
	if (typeof array[0] !== "undefined") {
		if (typeof array[0][id] === "undefined" ) {
			let newArray = []
			array.forEach((item) => {
				item[id] = window.cuid();
				newArray.push(item);
			})
			return newArray
		}
	} else {
		return array
	}
}

export function getButtonData(buttonType) {
	if (isEmpty(client)) return
    let buttonData = {}
    buttonData.lastServed = getLastServedDays() // Returns number of days since for USDA, NonUSDA, lowest & BackToSchool
    buttonData.activeServiceTypes = getActiveServiceTypes() // reduces serviceTypes list for which today is NOT active date range
    const targetServices = getTargetServices(buttonData.activeServiceTypes); // list of target properties for each serviceType
    buttonData[buttonType] = getActiveServicesButtons(buttonType, buttonData.activeServiceTypes, targetServices, buttonData.lastServed);
    return buttonData
}

export function getServiceHistory(){
	let clientHistory = window.dbGetClientActiveServiceHistory()
	clientHistory = clientHistory
		.sort((a, b) => moment.utc(b.servicedDateTime).diff(moment.utc(a.servicedDateTime)))
	//uiShowHistoryData(reactDIV, clientHistory)
	return clientHistory
}

export function calcClientDependentsAges(client){
	// age TODO Move this to other Function
	if (client.dependents == undefined) client.dependents = []
	for (var i = 0; i < client.dependents.length; i++) {
		utilCalcDependentAge(i)
	}
	return client.dependents
}

export function calcClientFamilyCounts(client){
	if (client.family == undefined) client.family = {}
	// dependents age & family counts
	let fam = {totalAdults:0, totalChildren:0, totalOtherDependents:0, totalSeniors:0, totalSize:0}
	// client individual --- clients must be 18 or older
	++fam.totalSize
	if (client.age >= settings.seniorAge) {
		++fam.totalSeniors
	} else {
		++fam.totalAdults
	}
	// client dependents
	for (let i = 0; i < client.dependents.length; i++) {
		client.dependents[i].age = moment().diff(client.dependents[i].dob, "years")
		if (client.dependents[i].isActive == "Active") {
			if (client.dependents[i].age >= settings.seniorAge) {
				++fam.totalSeniors
			} else if (client.dependents[i].age < 18) {
				++fam.totalChildren
			} else {
				++fam.totalAdults
			}
			if (client.dependents[i].relationship == "Other") {
				++fam.totalOtherDependents
			}
			++fam.totalSize
		}
	}
	client.family.totalAdults = fam.totalAdults
	client.family.totalChildren = fam.totalChildren
	client.family.totalOtherDependents = fam.totalOtherDependents
	client.family.totalSeniors = fam.totalSeniors
	client.family.totalSize = fam.totalSize
	// TODO REACT FamilyCounts
	//uiShowFamilyCounts(fam.totalAdults, fam.totalChildren, fam.totalOtherDependents, fam.totalSeniors, fam.totalSize)
	return client.family
}

export function addService(serviceTypeId, serviceCategory, serviceButtons, servicesRendered){
	let serviceType = utilGetServiceTypeByID(serviceTypeId)
	let serviceId = "" // new service
    let serviceValid = true
    let undoneService = false
    // check if service has already been rendered

    console.log(servicesRendered)
    console.log(servicesRendered.indexOf(serviceTypeId))

	if (servicesRendered.indexOf(serviceTypeId) !== -1) {
		const serviceItem = servicesRendered.filter(obj => obj.serviceTypeId == serviceTypeId)
		serviceValid = false
        serviceId = serviceItem[0].serviceId
        undoneService = true
	}
	// save service record
	const servedCounts = utilCalcServiceFamilyCounts(serviceTypeId)
    const serviceRecord = utilBuildServiceRecord(serviceType, serviceId, servedCounts, serviceValid)
    
console.log(serviceRecord)


	const result = dbSaveServiceRecord(serviceRecord)
	if (serviceType.serviceButtons == "Primary" && result == "success"){
		dbSaveLastServed(serviceTypeId, serviceType.serviceCategory, servedCounts.itemsServed, serviceType.isUSDA)
	}
	if (serviceId != "" && result == "success") {
		// ungrayout button
		uiToggleButtonColor("unGray", serviceTypeId, serviceButtons)
		if (serviceButtons == "Primary") {
			$("#image-"+serviceTypeId).removeClass("imageGrayOut")
		}
	} else if (serviceId == "" && result == "success") {
		if (serviceCategory == 'Food_Pantry') {
			// TODO Use function here
			let service = serviceTypes.filter(function( obj ) {
					return obj.serviceTypeId == serviceTypeId
				})[0]
			prnPrintFoodReceipt(service.isUSDA)
			if (client.isActive == 'Client') {
				prnPrintReminderReceipt()
			}
		} else if (serviceCategory == 'Clothes_Closet') {
			prnPrintClothesReceipt(serviceType)
		} else if (serviceCategory == 'Back_To_School' && serviceType.target.service == 'Unselected') { // ignore fulfillment
			const targetService = utilCalcTargetServices([serviceType])
			const dependents = utilCalcValidAgeGrade("grade",targetService[0])
			// TODO use function here
			let service = serviceTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
			prnPrintVoucherReceipt(serviceType, dependents, 'grade');
			prnPrintVoucherReceipt(serviceType, dependents, 'grade');
		} else if (serviceCategory == 'Thanksgiving' && serviceType.target.service == 'Unselected') { // ignore fulfillment
			const targetService = utilCalcTargetServices([serviceType])
			// TODO use function here
			let service = serviceTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
			prnPrintVoucherReceipt(service)
			prnPrintVoucherReceipt(service)
		} else if (serviceCategory == 'Christmas' && serviceType.target.service == 'Unselected') { // ignore fulfillment
			const targetService = utilCalcTargetServices([serviceType])
			let service = serviceTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
			if (targetService[0].family_totalChildren == "Greater Than 0") {
				const dependents = utilCalcValidAgeGrade("age", targetService[0])
				prnPrintVoucherReceipt(serviceType, dependents, 'age');
				prnPrintVoucherReceipt(serviceType, dependents, 'age');
			} else {
				prnPrintVoucherReceipt(service);
				prnPrintVoucherReceipt(service);
			}
		}
		prnFlush();
		// uiShowLastServed() *** Moved to REACT ***
        uiToggleButtonColor("gray", serviceTypeId, serviceButtons)
        
        if (undoneService === true) return 'undone'
        if (serviceId == "" && result == "success") return serviceRecord
	}
}


//**** JAVASCRIPT FUNCTIONS FOR USE WITHIN EXPORTABLE FUNCTIONS ****

function getLastServedDays() {
	// get Last Served Date from client object & calculate number of days
	let lastServed = {daysUSDA:10000, daysNonUSDA:10000, lowestDays:10000, backToSchool:10000}
	if (client.lastServed[0] == undefined) return lastServed
	let lastServedFood = client.lastServed.filter(obj => obj.serviceCategory == "Food_Pantry")

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
	return lastServed
}

function getActiveServiceTypes(){
	// build Active Service Types array of Service Types which cover today's date
    let activeServiceTypes = []
    let serviceTypes = window.serviceTypes // USED DURING TRANSITION TO REACT
	for (let i=0; i<serviceTypes.length; i++){
		if (serviceTypes[i].isActive == "Active"){
			// FROM
			let fromDateString = []
			fromDateString.push(moment().year())
			fromDateString.push(Number(serviceTypes[i].available.dateFromMonth))
			fromDateString.push(Number(serviceTypes[i].available.dateFromDay))
			let fromDate = moment(fromDateString).startOf('day')
			// TO
			let toDateString = []
			toDateString.push(moment().year())
			toDateString.push(Number(serviceTypes[i].available.dateToMonth))
			toDateString.push(Number(serviceTypes[i].available.dateToDay))
			let toDate = moment(toDateString).endOf('day')
			// Adjust year dependent on months of TO and FROM
			if (moment(fromDate).isAfter(toDate)) toDate = moment(toDate).add(1, 'y');
			// Adjust year if FROM is after TODAY
			if (moment(fromDate).isAfter()) {
				fromDate = moment(fromDate).subtract(1, 'y');
				toDate = moment(toDate).subtract(1, 'y');
			}
			// IN date range = ACTIVE
			if (moment().isBetween(fromDate, toDate, null, '[]')) {
				activeServiceTypes.push(serviceTypes[i])
			}
		}
	}
	return activeServiceTypes
}

function getTargetServices(activeServiceTypes) {
	let targets = [];
	// build list of client target items for each Active Service Type
	for (let i = 0; i < activeServiceTypes.length; i++) {
		// make list of specific targets.... for each type.
		targets[i] = {}
		// target homeless
		if (activeServiceTypes[i].target.homeless !== "Unselected") targets[i].homeless = activeServiceTypes[i].target.homeless;
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

function getActiveServicesButtons(buttons, activeServiceTypes, targetServices, lastServed) {	
	let	btnPrimary = [];
	let btnSecondary = [];
    let validDependents = []
      
	for (let i = 0; i < activeServiceTypes.length; i++) {
		let display = true;
		// check for not a valid service based on interval between services
		if (!utilValidateServiceInterval(activeServiceTypes[i], activeServiceTypes, lastServed)) continue;
		// loop through each property in each targetServices
		for (let prop in targetServices[i]) {
			if (prop=="family_totalChildren") {
				// TODO move to grade and age target detection to helper function
				if (targetServices[i]['dependents_gradeMin'] != "Unselected" && targetServices[i]['dependents_gradeMax']!="Unselected"){
					validDependents = utilCalcValidAgeGrade("grade",targetServices[i])
				}
				//TODO change service types to store non age entries as -1
				if (targetServices[i]['dependents_ageMax'] > 0){
					validDependents = utilCalcValidAgeGrade("age",targetServices[i])
				}
				if (validDependents.length == 0){
					display = false
				}
			}
			if (prop == "service") { // targeting a voucher fulfill service
				let servicesVouchers = utilCalcVoucherServiceSignup(activeServiceTypes[i])
				if (servicesVouchers.length !== 1) {
					display = false
				}
			} else if (targetServices[i][prop] != client[prop]
					&& prop.includes("family")==false
					&& prop.includes("dependents")==false) {
				display = false
			}
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

export function saveHistoryForm(editRecord, formValues, client, userName){
    const oldServiceId = editRecord.serviceId
    Object.assign(editRecord, formValues)
    // TODO serviceTypes will need to either be retrived each time or be available in session
    const serviceType = serviceTypes.filter(item => item.serviceName == editRecord.serviceName)[0]
    Object.assign(editRecord, {serviceTypeId: serviceType.serviceTypeId, serviceCategory: serviceType.serviceCategory, isUSDA: serviceType.isUSDA })

    editRecord.servicedDay = moment(editRecord.servicedDateTime).format("YYYYMMDD")
    editRecord.servicedByUserName = userName
    editRecord.updatedDateTime = window.utilNow()
    editRecord.serviceId = cuid()
    
    const data = JSON.stringify(editRecord)
	const URL = aws+"/clients/services"
    const result = dbPostData(URL,data)
    
    // const result = saveRecord(editRecord, 'service')
	if (result == "success") {
		// disable old service record
		window.utilRemoveService(oldServiceId)
		return editRecord
	}
}