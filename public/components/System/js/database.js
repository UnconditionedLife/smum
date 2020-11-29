//************************************************
//***** DATABASE SECTION JAVASCRIPT FUNCTIONS *****
//************************************************

const dbBase = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/';
let dbUrl = '';

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function dbSetUrl(instance) {
    dbUrl = dbBase + instance;
}

export function dbGetAllUsers(session) {
	return window.dbGetData(dbUrl+"/users").users;
}

export function dbGetUser(session, userName) {
    const users = dbGetAllUsers(session);
    const userList = users.filter(obj => obj.userName == userName)
    if (userList.length == 1)
        return userList[0];
    else
        return null;
}

export function dbSetModifiedTime(obj, isNew) {
    const now = moment().format('YYYY-MM-DDTHH:mm');
    obj.updatedDateTime = now;
    if (isNew)
        obj.createdDateTime = now;
}

// export function saveRecord(object, table){
//     const data = JSON.stringify(object)
//     let apiUrl
//     switch (table){
//         case 'services':
//             apiUrl = dbUrl + "/clients/services"
//     }
//     const result = dbPostData(apiUrl, data)
//     return result
// }