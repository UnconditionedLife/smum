import React, { Component } from 'react';

class MessageOverlay extends Component {
  render() {
    return (
      <div id="msgOverlay">
        <div id="clientMessageDiv">
          <div className="clientMessageHdr">IMPORTANT NOTE &nbsp; <i id="clientMessageClose" className="fa fa-times-circle" onclick="uiShowHideClientMessage('hide')" /></div>
          <div id="clientMessageBody" />
        </div>
      </div>
    );
  }
}
export default MessageOverlay;
