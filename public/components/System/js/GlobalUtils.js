//**************************************************
//****** GLOBAL UTILITIES JAVASCRIPT FUNCTIONS *****
//**************************************************

//import { dbGetSvcTypes, dbGetSettings } from "./Database";
import moment from "moment";

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****


export function isEmpty(obj) {
    if (typeof obj === "undefined") return false
    return Object.keys(obj).length === 0;
}

export function utilNow() {
	return moment().format('YYYY-MM-DDTHH:mm')
}

export function utilStringToArray(str){
	let arr = []
	if (str !== "{}" && str !== "*EMPTY*") {
		str = str.replace(/=/g, '":"').replace(/\{/g, '{"').replace(/\}/g, '"}').replace(/, /g, '", "')
		// split the string if there are nested faux objects
		let stringArr = str.split(/\"\{|\}\"/g)
		let newStr = ""
		if (stringArr.length > 1) {
			for (var i = 0; i < stringArr.length; i++) {
				if (i == 0 || i == stringArr.length -1) {
					newStr = newStr + stringArr[i]
				} else {
					if (stringArr[i].indexOf(",") != 0) {
						let subArrObj = JSON.parse("{" + stringArr[i] + "}")
						let subArr = []
						for (let key in subArrObj) {
                            if (subArrObj.hasOwnProperty(key)) {
                            subArr.push(subArrObj[key])
                            }
						}
						arr.push(subArr)
					}
				}
			}
		} else {
			const obj = JSON.parse(str)
			for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                arr.push(obj[key])
                }
			}
		}
	}
	return arr
}

// Date/Schedule Functions

export function dateFindOpen(at) {
    const { targetDate, earliestDate, schedule } = at
	let proposed = moment(targetDate);
	// Start with target date and work backward to earliest
	while (proposed >= earliestDate) {
		if (dateIsClosed(schedule, proposed)) {
			proposed.subtract(1, 'days');
		} else {
			return proposed;
		}
	}
	// Select the first open date after target
	proposed = moment(targetDate).add(1, 'days');
	while (true) {
		if (dateIsClosed(schedule, proposed)) {
			proposed.add(1, 'days');
		} else {
			return proposed;
		}
	}
}

export function dateParse(dateString) {
	let momentDay = moment(dateString)
	let dayOfWeek = momentDay.day();
	let weekInMonth = momentDay.isoWeek() -
		momentDay.subtract(momentDay.date()-1, 'days').isoWeek() + 1;
	return {
		"dayOfWeek": dayOfWeek,
		"weekInMonth": weekInMonth,
		"formatted": dateString
	}
}

//**** JAVASCRIPT FUNCTIONS FOR USE WITH EXPORTABLE FUNCTIONS ****

// TODO should switch to an implementation that follows RFC 5545
function dateIsClosed(schedule, date) {
	let dateObj = dateParse(date.format('YYYY-MM-DD'));
	if (schedule.openDays.indexOf(dateObj.formatted) >= 0) {
		return false;
	}
	for (let i = 0; i < schedule.closedEveryDays.length; i++) {
		if (dateObj.dayOfWeek == schedule.closedEveryDays[i]) {
			return true;
		}
	}
	for (let i = 0; i < schedule.closedEveryDaysWeek.length; i++) {
		if (dateObj.weekInMonth == schedule.closedEveryDaysWeek[i][0] &&
			dateObj.dayOfWeek == schedule.closedEveryDaysWeek[i][1]) {
			return true;
		}
	}
	for (let i = 0; i < schedule.closedDays.length; i++) {
		if (dateObj.formatted == schedule.closedDays[i]) {
			return true;
		}
	}
	return false;
}

export function utilCleanUpDate(a) {
	a = a.replace("-", "/")
	a = a.replace(".", "/")
	let dateArr = []
	let temp = a
	// let year = ""
	for (var i = 0; i < 2; i++) {
		let slash = temp.indexOf("/")
		dateArr[i] = temp.slice(0, slash)
		if (dateArr[i].length == 1) dateArr[i] = "0" + dateArr[i]
		temp =  temp.slice(slash + 1)
	}
	const yearLength = temp.length
	if (yearLength == 1) {
		dateArr[2] = "200" + temp
	} else if (yearLength == 2) {
		if (temp <= moment().format("YY")) {
			dateArr[2] = "20" + temp
		} else {
			dateArr[2] = "19" + temp
		}
	} else {
		dateArr[2] = temp
	}
	const date = dateArr[0] +"/"+ dateArr[1] +"/"+ dateArr[2]
	return date
}

export function utilChangeWordCase(str){
	str = str.replace(/[^\s]+/g, function(word) {
	  return word.replace(/^./, function(first) {
	    return first.toUpperCase();
	  });
	});
	return str
}

export function utilRemoveDupClients(clients) {
	let ids=[], temp=[], undupClients = []
	for (let i = 0; i < clients.length; i++) ids.push(clients[i].clientId)
	for (let i = 0; i < ids.length; i++) {
		if (temp.indexOf(ids[i])<0) {
			undupClients.push(clients[i])
			temp.push(ids[i])
		}
	}
	return undupClients
}