//**************************************************
//****** GLOBAL UTILITIES JAVASCRIPT FUNCTIONS *****
//**************************************************

import moment from 'moment';
import { SettingsSound } from './Database';

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****


export function isEmpty(obj) {
    if (typeof obj === "undefined") return false
    return Object.keys(obj).length === 0;
}

export function utilNow() {
	return moment().format('YYYY-MM-DDTHH:mm')
}

export function utilStringToArray(str){
	let arr = [];
    
    if (!str)
        return null;
	if (str !== "{}" && str !== "*EMPTY*") {
		str = str.replace(/=/g, '":"').replace(/\{/g, '{"').replace(/\}/g, '"}').replace(/, /g, '", "')
		// split the string if there are nested faux objects
		let stringArr = str.split(/"\{|\}"/g)
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

export function utilArrayToObject(arr) {
	return arr.reduce(function(acc, cur, i) {
		if (Array.isArray(cur)) {
			acc[i] = utilArrayToObject(cur)
		} else {
			acc[i] = cur
		}
		return acc
	}, {});
}

// Not used - An array value POSTed with the previous function is saved in
// the database with a format like the output of this function.
export function utilArrayToString(arr) {
	let i = 0;
    let withIndex = arr.map(elem => {
        if (Array.isArray(elem))
            elem = utilArrayToString(elem);
        return (i++).toString() + '=' + elem;
    });
    return '{' + withIndex.join(', ') + '}'
}

// Return the ordinal string for a number.
// Not sure who is the original author of this clever implementation, but 
// see https://leancrew.com/all-this/2020/06/ordinal-numerals-and-javascript/
// for an explanation of the special cases it handles and how it works.
export function utilOrdinal(n) {
    var s = ["th", "st", "nd", "rd"];
    var v = n % 100;
    return n + (s[(v-20)%10] || s[v] || s[0]);
}

export function isMobile(width) {
	return width  <= 820;
}

export function utilCleanUpDate(d) {
	d = d.replaceAll("-", "/")
	d = d.replaceAll(".", "/")
    const dateArr = d.split("/")
    const year = dateArr[2]
	const yearLength = year.length
	if (yearLength == 1) {
		dateArr[2] = "200" + year
	} else if (yearLength == 2) {
		if (year <= moment().format("YY")) {
			dateArr[2] = "20" + year
		} else {
			dateArr[2] = "19" + year
		}
	} else {
		dateArr[2] = year
	}
    if (dateArr[0].length == 1) dateArr[0] = "0" + dateArr[0]
    if (dateArr[1].length == 1) dateArr[1] = "0" + dateArr[1]
	return dateArr[2] +"-"+ dateArr[0] +"-"+ dateArr[1]
}

export function utilChangeWordCase(str) {
	str = str.replace(/[^\s]+/g, function(word) {
        return word.replace(/^./, function(first) {
            return first.toUpperCase();
        });
	});
	return str;
}

// Remove the prefix giving the broad error type before a specific error message.
// For example, "NotAuthorizedException: Incorrect username or password" becomes
// "Incorrect username or password".
export function removeErrorPrefix(str) {
    return String(str).replace(/^.*: /, '');
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

// Sound effects

export function beepError() {
    console.log("BEEP-ERROR")
    playSound("/sounds/beep.wav");
}

export function beepSuccess() {
	playSound("/sounds/bloop.wav")
}

//**** JAVASCRIPT FUNCTIONS FOR USE WITH EXPORTABLE FUNCTIONS ****

function playSound(soundFile) {
    if (SettingsSound()) {
		let sound  = new Audio(soundFile);
		sound.volume= 0.3;
		sound.loop = false;
		sound.play();
	}
}