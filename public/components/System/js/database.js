//************************************************
//***** CLIENTS SECTION JAVASCRIPT FUNCTIONS *****
//************************************************

const aws = 'https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/prod';

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****
export function dbGetAllUsers(session) {
	return window.dbGetData(aws+"/users").users;
}

export function dbGetUser(session, userName) {
    const users = dbGetAllUsers(session);
    const userList = users.filter(obj => obj.userName == userName)
    if (userList.length == 1)
        return userList[0];
    else
        return null;
}