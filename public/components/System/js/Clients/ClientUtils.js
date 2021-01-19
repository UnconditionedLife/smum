//******************************************************************
//       ****** CLIENTS UTILITIES JAVASCRIPT FUNCTIONS ******
//******************************************************************
import moment from  'moment';
import { dbGetAppSettings } from '../Database.js';

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

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

export function calcClientDependentsAges(client){
    // age TODO Move this to other Function
    let deps = client.dependents
	if (deps === undefined) deps = []
	for (var i = 0; i < deps.length; i++) {
		deps[i] = utilCalcAge(deps[i])
	}
	return deps
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

export function utilCalcAgeGrouping(dependent){
	let age = dependent.age
	if (age >= 0 && age <= 1 ){
		return "0-1"
	}
	else if  (age >= 2 && age <= 3){
		return "2-3"
	}
	else if (age >= 4 && age <= 6){
		return "4-6"
	}
	else if (age >= 7 && age <= 8){
		return "7-8"
	}
	else if (age >= 9 && age <= 10){
		return "9-10"
	}
	else if (age >= 11 && age <= 12){
		return "11-12"
	}
	else if (age >= 13 && age <= 17){
		return "13-17"
	}
	else {
		return "Unable to Calculate Age Level"
	}
}

export function utilCalcGradeGrouping(dependent){
	let currentGrade = utilGradeToNumber(dependent.grade)
	if (currentGrade==0){
		return "K"
	}
	else if  (currentGrade>=1 && currentGrade<=2){
		return "1-2"
	}
	else if (currentGrade>=3&&currentGrade<=5){
		return "3-5"
	}
	else if (currentGrade>=6&&currentGrade<=8){
		return "6-8"
	}
	else if (currentGrade==9){
		return "9"
	}
	else if (currentGrade>=10 && currentGrade<=12){
		return "10-12"
	}
	else{
		return "Unable to Calculate Grade Level"
	}
}

export function utilCalcTargetServices(activeServiceTypes) {
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

export function utilGradeToNumber(grade){
	if (grade=="Pre-K") return -1
	if (grade == "K") return 0
	return parseInt(grade);
}

export function utilPadTrimString(str, length) {
	if (length > str.length) { // pad
		return str.padEnd(length)
	} else if (length < str.length) { // trim
		return str.substring(0, length)
	} else {
		return str
	}
}

export function utilSortDependentsByAge(dependents){
	return dependents.sort((a,b) => a.age-b.age)
}

export function utilSortDependentsByGrade(dependents){
    return dependents.sort((a,b) => utilGradeToNumber(a.grade) - utilGradeToNumber(b.grade))
}

export function utilCalcAge(person){
	const dob = person.dob
	if (dob !== null){
        person.age = moment().diff(dob, "years")
        return person
    } else {
        person.age = ""
    }
}


//******************************************************************
//**** JAVASCRIPT FUNCTIONS FOR USE WITHIN EXPORTABLE FUNCTIONS ****
//******************************************************************

