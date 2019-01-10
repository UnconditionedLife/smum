import React, { Component } from 'react';

class ErrorOverlay extends Component {
  render() {
    return (
      <div id="errorOverlay" className="popupOverlay errorOverlay">
        <div className="errorMessageDiv">
          <div id="errorTitle" className="loginHeader span3" />
          <div className="span3" />
          <div />
          <div id="errorMessage" className="messageText" />
          <div />
          <div className="span3" style={{display: 'flex', justifyContent: 'center', height: '60px', alignItems: 'center'}}>
            <input className="solidButton" onclick="uiShowHideError('hide', ' ', ' ')" type="button" defaultValue="OK" />
          </div>
        </div>
      </div>
    );
  }
}
export default ErrorOverlay;
