import React, { Component } from 'react';

class PrintOverlay extends Component {
  render() {
    return (
      <div id="printOverlay" className="popupOverlay" onclick="uiShowHideReport('hide')">
        <div id="reportBodyDiv" />
      </div>
    );
  }
}
export default PrintOverlay;
