//**************************************************
//****** GLOBAL UTILITIES JAVASCRIPT FUNCTIONS *****
//**************************************************

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { SettingsSound } from './Database';

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

dayjs.extend(customParseFormat);

export function isEmpty(obj) {
    if (typeof obj === "undefined") return false
    return Object.keys(obj).length === 0;
}

export function utilNow() {
	return dayjs().format('YYYY-MM-DDTHH:mm')
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
	return width  <= 1000;
}

export function utilCleanDate(d) {
	d = d.replace(/[- .]/g, "/")                                            // make seperator the "/"
    const array = d.split("/")
    let nonZero = true
    array.forEach((value) => {
        if (value < 1) nonZero = false
    })
    if (!nonZero) return null                                               // exit if a value is 0
    const regex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/                             // checks format n/n/nn
    return regex.test(d) ? new Date(d).toISOString().split('T')[0] : null   // YYYY-MM-DD or null
}

export function utilChangeWordCase(str) {
	str = str.replace(/[^\s]+/g, function(word) {
        return word.replace(/^./, function(first) {
            return first.toUpperCase();
        });
	});
	return str;
}

export function utilEncodeStrings(data) {
    if (typeof data === 'object') {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (typeof data[key] === 'string') {
                    let encoded = encodeURIComponent(data[key]);
                    // Exception to URI encoding: Leave space (%20) unmodified
                    encoded = encoded.replace(/%(20)/g, (str, hex) =>
                        String.fromCharCode(parseInt(hex, 16)));
                    // if (encoded != data[key])
                    //     console.log('ENCODE', data[key], '->', encoded)
                    data[key] = encoded;
                }
                // If nested objects exist, encode recursively
                if (typeof data[key] === 'object') {
                    utilEncodeStrings(data[key]);
                }
            }
        }
    }
    return data;
}

export function utilDecodeStrings(data) {
    if (typeof data === 'object') {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (typeof data[key] === 'string') {
                    const decoded = decodeURIComponent(data[key]);
                    // if (data[key] != decoded)
                    //     console.log('DECODE', data[key], '->', decoded)
                    data[key] = decoded;
                }
                // If nested objects exist, decode recursively
                if (typeof data[key] === 'object') {
                    utilDecodeStrings(data[key]);
                }
            }
        }
    }
    return data;
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

// Replace control characters in JSON string fields.
// The commented-out code is useful for identifying where
// control characters are present in the data.
function escapeControlCharsInJson(jsonString) {
    let inString = false;
    let escaped = false;
    let result = '';
    let escapes = 0;
    for (let i = 0; i < jsonString.length; i++) {
        let char = jsonString[i];
        if (inString) {
            if (escaped) {
                result += char;
                escaped = false;
            } else if (char === '\\') {
                result += char;
                escaped = true;
            } else if (char === '"') {
                result += char;
                inString = false;
            } else {
                const code = char.charCodeAt(0);
                if (code < 32) {
                    // console.log("Ctrl Char POS", i, "CODE", code);
                    escapes++;

                    if (char === '\n') result += '\\n';
                    else if (char === '\r') result += '\\r';
                    else if (char === '\t') result += '\\t';
                    else {
                        const hex = code.toString(16).padStart(4, '0');
                        result += '\\u' + hex;
                    }
                } else {
                    result += char;
                }
            }
        } else {
            result += char;
            if (char === '"') {
                inString = true;
            }
        }
    }
    // if (escapes > 0)
    //     downloadFile(result, 'text/json;charset=utf-8;', 'escaped.json')
    return result;
}

export function downloadFile(content, fileType, fileName) {
    const blob = new Blob([content], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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