import React, { Component } from 'react';

class LoginOverlay extends Component {
  render() {
    return (
      <div id="loginOverlay" className="popupOverlay">
        <div className="loginFormDiv">
          <div className="loginHeader span4">Login to Santa Maria Urban Ministry</div>
          <div className="span4" />
          <div />
          <div className="lableDiv loginDiv">Username</div>
          <div className="loginDiv"><input id="loginUserName" type="email" className="inputBox loginForm" tabIndex={1} /></div>
          <div className="loginDiv" />
          <div className="loginDiv" />
          <div className="lableDiv loginDiv">Password</div>
          <div className="loginDiv"><input id="loginPassword" type="password" className="inputBox loginForm" tabIndex={2} /> <i className="fa fa-eye fa-lg" style={{float: 'right'}} aria-hidden="true" onclick="uiShowHidePassword()" /></div>
          <div className="lableDiv codeDiv newPasswordDiv">Validation Code</div>
          <div className="codeDiv newPasswordDiv"><input id="loginCode" type="text" className="inputBox loginForm" /></div>
          <div className="newPasswordDiv" />
          <div className="newPasswordDiv" />
          <div className="lableDiv newPasswordDiv">New Password</div>
          <div className="newPasswordDiv"><input id="loginNewPassword" type="password" className="inputBox loginForm" /> <i className="fa fa-eye fa-lg" style={{float: 'right'}} aria-hidden="true" onclick="uiShowHidePassword()" /></div>
          <div />
          <div className="span4 codeDiv" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <span className="textLink" onclick="cogResendValidationCode()">Resend Validation Code</span>
          </div>
          <div className="span4 loginDiv" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <span className="textLink" onclick="cogForgotPassword()" tabIndex={4}>Forgot Password</span>
          </div>
          <div className="span4 loginDiv" style={{display: 'flex', justifyContent: 'center', height: '60px', alignItems: 'center'}}>
            <input className="solidButton" onclick="cogLoginUser()" type="button" defaultValue="Login" tabIndex={3} />
          </div>
          <div className="span4 codeDiv" style={{display: 'flex', justifyContent: 'center', height: '60px', alignItems: 'center'}}>
            <input className="solidButton" onclick="cogUserConfirm()" type="button" defaultValue="VALIDATE" />
          </div>
          <div className="span4 newPasswordDiv" style={{display: 'flex', justifyContent: 'center', height: '60px', alignItems: 'center'}}>
            <input className="solidButton" onclick="cogUserConfirmPassword()" type="button" defaultValue="SET PASSWORD" />
          </div>
          <div id="loginError" className="modalError" />
        </div>
      </div>
    );
  }
}
export default LoginOverlay;
