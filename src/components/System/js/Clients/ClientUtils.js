//******************************************************************
//       ****** CLIENTS UTILITIES JAVASCRIPT FUNCTIONS ******
//******************************************************************
import dayjs from 'dayjs';
import { SettingsSeniorAge } from '../Database.js';
import cuid from 'cuid';

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function arrayAddIds(array, id) {
	// Check if notes & dependents arrays already have ids
	if (typeof array[0] !== "undefined") {
		if (typeof array[0][id] === "undefined" ) {
			let newArray = []
			array.forEach((item) => {
				item[id] = cuid();
				newArray.push(item);
			})
			return newArray
		}
	} else {
		return array
	}
}

export function calcDependentsAges(client){
    let deps = client.dependents
	for (var i = 0; i < deps.length; i++) {
		deps[i] = utilCalcAge(deps[i])
	}
	return deps
}

export function calcFamilyCounts(client){
    const seniorAge = SettingsSeniorAge()
	if (client.family == undefined) client.family = {}
	// dependents age & family counts
	let fam = { totalAdults:0, totalChildren:0, totalOtherDependents:0, totalSeniors:0, totalSize:0 }
	// client individual --- clients must be 18 or older
	++fam.totalSize // add client to total
	if (client.age >= seniorAge) {
		++fam.totalSeniors //add client as senior
	} else {
		++fam.totalAdults  //add client as adult
	}
	// client dependents
	for (let i = 0; i < client.dependents.length; i++) {
		client.dependents[i].age = dayjs().diff(client.dependents[i].dob, "years")
		if (client.dependents[i].isActive == "Active") {
			if (client.dependents[i].age >= seniorAge) {
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

    // console.log("FAMILY COUNTS", client.family)

	return client.family
}

export function utilCalcAgeGroupingAllDeps(dependents){
    const results = [ 0, 0, 0, 0, 0, 0, 0 ]
    const ranges = { "0-1": 0, "2-3": 1, "4-6": 2, "7-8": 3, "9-10": 4, "11-12": 5, "13-17": 6}
    dependents.forEach((dep) => {
        const index = ranges[utilCalcAgeGrouping(dep)]
        if (index >= 0 && index <= 6)
            results[index] = results[index] + 1
    })
    return results
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

export function utilCalcTargetServices(activeSvcTypes) {
	let targets = [];
	// build list of client target items for each Active Service Type
	
    activeSvcTypes.forEach((aSvcType, i) => {
    // for (let i = 0; i < activeServiceTypes.length; i++) {
		// make list of specific targets.... for each type.
		targets[i] = {}

		// TARGET HOMELESS 
        if (aSvcType.target.homeless == "YES") targets[i].homeless = "YES"
        if (aSvcType.target.homeless == "NO") targets[i].homeless = "NO"

		// TARGET FAMILY SIZE: with children, no-children, singles, couples
		if (aSvcType.target.family == "Single_Individual") {
            targets[i].forFamily = "YES"
			targets[i].family_totalSize = "1"

		} else if (aSvcType.target.family == "Couple") {
            targets[i].forFamily = "YES"
			targets[i].family_totalAdults = "2";

		} else if (aSvcType.target.family == "Family_with_Children") {
            targets[i].forFamily = "YES"
            targets[i].family_totalChildren = "1+";

		} else if (aSvcType.target.family == "Family_No_Children") {
            targets[i].forFamily = "YES"
			targets[i].family_totalChildren = "0";
		}

		// TARGET GENDER male/female
		if (aSvcType.target.gender !== "Unselected") targets[i].gender = aSvcType.target.gender;
		
        // TARGET CHILDREN YES/NO
		if (aSvcType.target.child == "YES") {
			targets[i].forChildren = "YES"

			// TARGET CHILD AGE
			if (aSvcType.target.childMaxAge > 0) {
				targets[i].dependents_ageMin = aSvcType.target.childMinAge
				targets[i].dependents_ageMax = aSvcType.target.childMaxAge
			}
			// TARGET CHILD GRADE
			if (aSvcType.target.childMinGrade !== "Unselected") {
				targets[i].dependents_gradeMin = aSvcType.target.childMinGrade;
			}
			if (aSvcType.target.childMaxGrade !== "Unselected") {
				targets[i].dependents_gradeMax = aSvcType.target.childMaxGrade;
			}
		} else if (aSvcType.target.child == "NO") {
			targets[i].family_totalChildren = "0";
		}

		// TARGET VOUCHER SERVICE
		if (aSvcType.target.service !== "Unselected") {
			targets[i].service = aSvcType.target.service; //set target to Voucher service ID
		}
	})

    // console.log("Target Client TARGETS", targets)

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
    person.age = (person.dob) ? dayjs().diff(person.dob, "years") : ""
    return person
}


//******************************************************************
//**** JAVASCRIPT FUNCTIONS FOR USE WITHIN EXPORTABLE FUNCTIONS ****
//******************************************************************

