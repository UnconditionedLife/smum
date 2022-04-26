//********************************************
//***** AWS COGNITO JAVASCRIPT FUNCTIONS *****
//********************************************

import { removeErrorPrefix } from './GlobalUtils';

let poolData = {
		UserPoolId : 'us-west-2_AufYE4o3x', // Your user pool id here
		ClientId : '7j3jhm5a3pkc67m52bf7tv10au' // Your client id here
};
let userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function cogSetupUser(username) {
  let userData = {
     Username: username,
     Pool: userPool
  };
  return new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
}

export function cogGetRefreshToken(token) {
  return new AWSCognito.CognitoIdentityServiceProvider.CognitoRefreshToken({ RefreshToken: token })
}

export function cogSetupSession(auth) {
  let cogAuth = {"IdToken": auth.idToken, "AccessToken": auth.accessToken}
  return new AWSCognito.CognitoIdentityServiceProvider.CognitoUserSession(cogAuth);
}

export function cogSetupAuthDetails(username, password) {
  let authData = {
        Username: username,
        Password: password
      };
  return new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authData);
}

export async function cogChangePasswordAsync(cogUser, oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
        cogUser.changePassword(oldPassword, newPassword, (err, data) => {
        if (err) 
            return reject(removeErrorPrefix(String(err)));
        else 
            resolve();
        });
    });
}

//**** JAVASCRIPT FUNCTIONS FOR USE WITHIN EXPORTABLE FUNCTIONS ****