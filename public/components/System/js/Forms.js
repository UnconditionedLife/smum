//******************************************
//***** FORM DATA JAVASCRIPT FUNCTIONS *****
//******************************************

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function packZipcode(zipcode, zipSuffix) {
    let zip = zipcode;
    if (zipSuffix > 0)
        zip += "-" + zipSuffix;
    return zip;
}

export function unpackZipcode(zip) {
    let fields = zip.split('-');
    return {
        zipcode: fields[0], 
        zipSuffix: fields[1]
    };
}

export function validState(state) {
    const state_abbr = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL",
        "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", 
        "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", 
        "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC", "GU", "PR", "VI"];
    if (state_abbr.indexOf(state) >= 0)
        return true;
    else   
        return false;
}

export function validPhone(phone) {
    if (phone == '') {
        return true;
    } else {
        let digits = phone.replace(/[^+\d]/g, ''); // Leave only + and digits
        if (digits.match(/^(\+1)?[1-9]\d{9}$/)) // Optional +1 followed by 10 digits
            return true;
        else
            return false;
    }
}

export function formatPhone(phone) {
    let digits = phone.replace(/[^+\d]/g, '');
    if (digits) {
        if (digits.startsWith('+1'))
            digits = digits.substring(2);
        return '+1-' + digits.substr(0, 3) + '-' + digits.substr(3, 3) + '-' + digits.substr(6, 4);
    } else {
        return '';
    }
}