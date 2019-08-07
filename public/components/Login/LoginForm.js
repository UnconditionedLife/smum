import React, { useState } from "react";
import ReactDOM from "react-dom";
import Moment from "react-moment";

function ShowViewPasswordIcon() {
  return (
    <React.Fragment>
      <i
        className="fa fa-eye fa-lg"
        style={{ float: "right" }}
        aria-hidden="true"
        onClick={() => window.uiShowHidePassword()}
      />
    </React.Fragment>
  );
}

function HiddenLinks() {
  return (
    <React.Fragment>
      <div
        className="span4 codeDiv"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <span
          className="textLink"
          onClick={() => window.cogResendValidationCode()}
        >
          Resend Validation Code
        </span>
      </div>
      <div
        className="span4 loginDiv"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <span
          className="textLink"
          onClick={() => window.cogForgotPassword()}
          tabIndex="4"
        >
          Forgot Password
        </span>
      </div>
    </React.Fragment>
  );
}

function ForgotPasswordForm() {
  const loginDivStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60px"
  };

  return (
    <React.Fragment>
      <div className="lableDiv codeDiv newPasswordDiv">Validation Code</div>
      <div className="codeDiv newPasswordDiv">
        <input id="loginCode" type="text" className="inputBox loginForm" />
      </div>
      <div className="newPasswordDiv" />
      <div className="newPasswordDiv" />
      <div className="lableDiv newPasswordDiv">New Password</div>
      <div className="newPasswordDiv">
        <input
          id="loginNewPassword"
          type="password"
          className="inputBox loginForm"
        />{" "}
        <ShowViewPasswordIcon />
      </div>
      <div />
      <HiddenLinks />
      <div className="span4 loginDiv" style={loginDivStyle}>
        <input
          className="solidButton"
          onClick={() => window.cogLoginUser()}
          type="button"
          value="Login"
          tabIndex="3"
        />
      </div>
      <div className="span4 codeDiv" style={loginDivStyle}>
        <input
          className="solidButton"
          onClick={() => window.cogUserConfirm()}
          type="button"
          value="VALIDATE"
        />
      </div>
      <div className="span4 newPasswordDiv" style={loginDivStyle}>
        <input
          className="solidButton"
          onClick={() => window.cogUserConfirmPassword()}
          type="button"
          value="SET PASSWORD"
        />
      </div>
    </React.Fragment>
  );
}

function PrimaryLoginForm() {
  return (
    <React.Fragment>
      <div className="loginHeader span4">
        Login to Santa Maria Urban Ministry
      </div>
      <div className="span4" />
      <div />
      <div className="lableDiv loginDiv">Username</div>
      <div className="loginDiv">
        <input
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
          id="loginPassword"
          type="password"
          className="inputBox loginForm"
          tabIndex="2"
        />{" "}
        <ShowViewPasswordIcon />
      </div>
    </React.Fragment>
  );
}

function LoginForm() {
  let [data, setData] = useState(0);

  return (
    <React.Fragment>
      <div className="loginFormDiv">
        <PrimaryLoginForm />
        <ForgotPasswordForm />
        <div id="loginError" className="modalError" />
      </div>
    </React.Fragment>
  );
}

export default LoginForm;
