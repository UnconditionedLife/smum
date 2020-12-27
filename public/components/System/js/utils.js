//************************************************
//****** GLOBAL UTILITY JAVASCRIPT FUNCTIONS *****
//************************************************


//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function isEmpty(obj) {
    if (typeof obj === "undefined") return false
    return Object.keys(obj).length === 0;
}

export function utilStringToArray(str){
	let arr = []
	if (str != "{}" && str != "*EMPTY*") {
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
						for (var key in subArrObj) {
                            if (subArrObj.hasOwnProperty(key)) {
                            subArr.push(subArrObj[key])
                            }
						}
						arr.push(subArr)
					}
				}
			}
		} else {
			obj = JSON.parse(str)
			for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                arr.push(obj[key])
                }
			}
		}
	}
	return arr
}

//**** JAVASCRIPT FUNCTIONS FOR USE WITH EXPORTABLE FUNCTIONS ****