//************************************************
//***** CLIENTS SECTION JAVASCRIPT FUNCTIONS *****
//************************************************
import { isEmpty } from '../js/Utils.js';

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function getButtonData(buttonType) {

	console.log(buttonType)	

	if (isEmpty(client)) return
    let buttonData = {}
    buttonData.lastServed = getLastServedDays() // Returns number of days since for USDA, NonUSDA, lowest & BackToSchool
    buttonData.activeServiceTypes = getActiveServiceTypes() // reduces serviceTypes list for which today is NOT active date range
    const targetServices = getTargetServices(buttonData.activeServiceTypes); // list of target properties for each serviceType
    buttonData[buttonType] = getActiveServicesButtons(buttonType, buttonData.activeServiceTypes, targetServices, buttonData.lastServed);
    return buttonData
};

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
};

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
};

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
};

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
	
	console.log(buttons)
	
	btnPrimary = [];
	btnSecondary = [];
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
	console.log(buttons)
	if (buttons == "primary") return btnPrimary
	if (buttons == "secondary") return btnSecondary
};

