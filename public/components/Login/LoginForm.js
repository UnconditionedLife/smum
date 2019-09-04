import React, { useState } from "react";
import ReactDOM from "react-dom";
import Moment from "react-moment";

function useInput(initialValue) {
  let [value, setValue] = useState(initialValue);

  function handleValueChange(e) {
    setValue(e.target.value);
  }

  return {
    value,
    onChange: handleValueChange,
    setValue
  };
}

function LoginForm() {
  let [showPrimaryForm, setShowPrimaryForm] = useState(true);
  let [passwordDisplay, setPasswordDisplay] = useState(false);
  let [appState, setAppState] = useState("login");
  let [message, setMessage] = useState("");

  let usernameInput = useInput("");
  let passwordInput = useInput("");
  let validationCodeInput = useInput("");
  let newPasswordInput = useInput("");

  // callback function passed into cognito in app.js
  // takes json object and sets fields based on its attributes 
  function handleCogValue(json) {
    if (json.message) {
      setMessage(json.message);
    }
    if (json.appState) {
      setAppState(json.appState);
    }
    if (json.clearInputs) {
      usernameInput.setValue("");
      passwordInput.setValue("");
      validationCodeInput.setValue("");
      newPasswordInput.setValue("");
    }
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
              onClick={() =>
                window.cogResendValidationCode(
                  usernameInput.value,
                  handleCogValue
                )
              }
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
                  window.cogForgotPassword(usernameInput.value, handleCogValue);
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
                  window.cogLoginUser(
                    usernameInput.value,
                    passwordInput.value,
                    handleCogValue
                  );
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
              onClick={() =>
                window.cogUserConfirm(
                  validationCodeInput.value,
                  usernameInput.value,
                  handleCogValue
                )
              }
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
                window.cogUserConfirmPassword(
                  validationCodeInput.value,
                  newPasswordInput.value,
                  usernameInput.value,
                  handleCogValue
                );
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
                {...usernameInput}
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
                {...passwordInput}
                id="loginPassword"
                type={passwordDisplay ? "text" : "password"}
                className="inputBox loginForm"
                tabIndex="2"
                onKeyDown={event => {
                  if (event.key == "Enter")
                    window.cogLoginUser(
                      usernameInput.value,
                      passwordInput.value,
                      handleCogValue
                    );
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
                {...validationCodeInput}
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
                {...newPasswordInput}
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
