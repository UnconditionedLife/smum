//************************************************
//****** GLOBAL UTILITY JAVASCRIPT FUNCTIONS *****
//************************************************


//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function isEmpty(obj) {
    if (typeof obj === "undefined") return false
    return Object.keys(obj).length === 0;
}


//**** JAVASCRIPT FUNCTIONS FOR USE WITH EXPORTABLE FUNCTIONS ****