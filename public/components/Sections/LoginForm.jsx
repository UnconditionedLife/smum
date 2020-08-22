// LOOK AT CONVERTING TO THIS CODE: https://react.school/material-ui/templates

import React, { useState } from "react";
import ReactDOM from "react-dom";
import Moment from "react-moment";
import Button from '@material-ui/core/Button';
import { cogSetupUser, cogSetupAuthDetails } from '../js/Cognito.js';
import {useInput} from '../Utilities/UseInput.jsx';


function LoginForm(props) {
  let [showPrimaryForm, setShowPrimaryForm] = useState(true);
  let [passwordDisplay, setPasswordDisplay] = useState(false);
  let [appState, setAppState] = useState("login");
  let [message, setMessage] = useState("");

  let usernameInput = useInput("");
  let passwordInput = useInput("");
  let validationCodeInput = useInput("");
  let newPasswordInput = useInput("");

  function doLogin(username, password) {
    let cogUser = cogSetupUser(username);
    let authDetails = cogSetupAuthDetails(username, password);
    cogUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        let authorization = {};
        authorization.accessToken = result.getAccessToken().getJwtToken()
        authorization.idToken = result.idToken.jwtToken
        window.utilInitAuth(authorization)
        let user = window.utilGetCurrentUser(username)
        // logout if user is set to Inactive
        if (user == null || user.isActive == "Inactive") {
          cogUser.signOut();
          setMessage("Sorry, your account is INACTIVE.");
        } else {
          props.onLogin({user: user, auth: authorization, cogUser: cogUser});
          usernameInput.reset();
          passwordInput.reset();
          validationCodeInput.reset();
          newPasswordInput.reset();
          window.utilInitSession(user, cogUser);
        }
      },
      onFailure: (err) => {
        let message = undefined
        let appState = undefined

        if (err == 'Error: Incorrect username or password.') {
          message = "Incorrect username or password"
        } else if (err == 'UserNotFoundException: User does not exist.') {
          message = "Username does not exist."
        } else if (err == 'NotAuthorizedException: Incorrect username or password.') {
          message = "Incorrect username or password."
        } else if (err == 'UserNotConfirmedException: User is not confirmed.') {
          appState = "code"
          message = "Validation Code is required."
          // TODO change login flow to deal with confirmation
          // cogUserConfirm() //userName, verificationCode
        } else if (err == 'NotAuthorizedException: User cannot confirm because user status is not UNCONFIRMED.') {
          appState = "login"
          message = "No longer UNCONFIRMED"
        } else if (err == 'PasswordResetRequiredException: Password reset required for the user') {
          message = "New Password is required."
        } else if (err == 'InvalidParameterException: Missing required parameter USERNAME'){
          message = "Username is required."
        }
        setMessage(message);
        if (appState)
          setAppState(appState);
      }
    })
  }

  function showViewPasswordIcon() {
    return (
      <i
        className="fa fa-eye fa-lg"
        style={{ float: "right" }}
        aria-hidden="true"
        onClick={() => setPasswordDisplay(!passwordDisplay)}
      />
    );
  }

  function displaySubmitButtons() {
    const loginDivStyleFixedHeight = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "60px"
    };

    const loginDivStyle = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    };

    return (
      <React.Fragment>
        {appState == "code" ? (
          <div className="span4 codeDiv" style={loginDivStyleFixedHeight}>
            <span
              className="textLink"
              onClick={() => {
                let cogUser = cogSetupUser(usernameInput.value);
              	cogUser.resendConfirmationCode(function(err, result) {
              		if (err)
                    setMessage(err.toString());
              		else
                    setMessage("New code has been sent.");
              	});
              }}
            >
              Resend Validation Code
            </span>
          </div>
        ) : null}
        {appState == "login" ? (
          <React.Fragment>
            <div className="span4 loginDiv" style={loginDivStyle}>
              <span
                className="textLink"
                onClick={() => {
                  setPasswordDisplay(false);
                	if (usernameInput.value == "") {
                    setMessage("Username is required.");
                	}
                	let cogUser = cogSetupUser(usernameInput.value);
                	cogUser.forgotPassword({
                    onSuccess: function (result) {
                      setMessage("Validation Code sent to: " + result.CodeDeliveryDetails.Destination);
                      setAppState("newPassword");
                    },
                    onFailure: function(err) {
                			if (err == "LimitExceededException: Attempt limit exceeded, please try after some time.")
                        setMessage("Too many requests. Try again later!");
                			else
                        setMessage(err.toString());
                    }
                  });
                }}
                tabIndex="4"
              >
                Forgot Password
              </span>
            </div>
            <div className="span4 loginDiv" style={loginDivStyleFixedHeight}>
              <input
                className="solidButton"
                onClick={() => {
                  doLogin(usernameInput.value, passwordInput.value);
                }}
                type="button"
                value="Login"
                tabIndex="3"
              />
            </div>{" "}
          </React.Fragment>
        ) : null}
        {appState == "code" ? (
          <div className="span4 codeDiv" style={loginDivStyleFixedHeight}>
            <input
              className="solidButton"
              onClick={() => {
                let cogUser = cogSetupUser(usernameInput.value);
                cogUser.confirmRegistration(validationCodeInput.value, true,
                  function(err, result) {
                    if (err)
                      setMessage(err.toString());
                    else {
                      setMessage("You're confirmed! Please Login.");
                      setAppState("login");
                    }
                  })
              }}
              type="button"
              value="VALIDATE"
            />
          </div>
        ) : null}
        {appState == "newPassword" ? (
          <div
            className="span4 newPasswordDiv"
            style={loginDivStyleFixedHeight}
          >
            <input
              className="solidButton"
              onClick={() => {
                setPasswordDisplay(false);
                let cogUser = cogSetupUser(usernameInput.value);
              	cogUser.confirmPassword(validationCodeInput.value, newPasswordInput.value, {
                  onSuccess: function (result) {
                    setMessage("New Password set! Please Login.");
                    setAppState("login");
                    usernameInput.reset();
                    passwordInput.reset();
                    validationCodeInput.reset();
                    newPasswordInput.reset();
                  },
                  onFailure: function(err) {
              			if (err == "LimitExceededException: Attempt limit exceeded, please try after some time.") {
                      setMessage("Too many requests. Try again later!");
              			} else {
                      setMessage(err.toString());
              			}
                  }
              	});
              }}
              type="button"
              value="SET PASSWORD"
            />
          </div>
        ) : null}
      </React.Fragment>
    );
  }

  function displayLoginForms() {
    return (
      <React.Fragment>
        <div className="loginHeader span4">
          Login to Santa Maria Urban Ministry
        </div>
        <div className="span4" />
        <div />
        {appState == "login" ? (
          <React.Fragment>
            <div className="lableDiv loginDiv">Username</div>
            <div className="loginDiv">
              <input
                {...usernameInput.bind}
                id="loginUserName"
                type="email"
                className="inputBox loginForm"
                tabIndex="1"
              />
            </div>
            <div className="loginDiv" />
            <div className="loginDiv" />
            <div className="lableDiv loginDiv">Password</div>
            <div className="loginDiv">
              <input
                {...passwordInput.bind}
                id="loginPassword"
                type={passwordDisplay ? "text" : "password"}
                className="inputBox loginForm"
                tabIndex="2"
                onKeyDown={event => {
                  if (event.key == "Enter")
                    doLogin(usernameInput.value, passwordInput.value);
                }}
              />{" "}
              {showViewPasswordIcon()}
            </div>
          </React.Fragment>
        ) : null}
        {appState == "code" || appState == "newPassword" ? (
          <React.Fragment>
            <div className="lableDiv codeDiv newPasswordDiv">
              Validation Code
            </div>
            <div className="codeDiv newPasswordDiv">
              <input
                {...validationCodeInput.bind}
                id="loginCode"
                type="text"
                className="inputBox loginForm"
              />
            </div>
          </React.Fragment>
        ) : null}
        {appState == "newPassword" ? (
          <React.Fragment>
            <div className="newPasswordDiv" />
            <div className="newPasswordDiv" />
            <div className="lableDiv newPasswordDiv">New Password</div>
            <div className="newPasswordDiv">
              <input
                {...newPasswordInput.bind}
                id="loginNewPassword"
                type={passwordDisplay ? "text" : "password"}
                className="inputBox loginForm"
              />{" "}
              {showViewPasswordIcon()}
            </div>
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div className="loginFormDiv">
        {displayLoginForms()}
        {displaySubmitButtons()}
        <div id="loginError" className="modalError">
          {message}
        </div>
      </div>
    </React.Fragment>
  );
}

export default LoginForm;
