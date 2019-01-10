import React, { Component } from 'react';
import Navbar from './Navbar/Navbar'
import Homepage from './Homepage/Homepage'
import LoginOverlay from './LoginOverlay/LoginOverlay'
import MessageOverlay from './MessageOverlay/MessageOverlay'
import ErrorOverlay from './ErrorOverlay/ErrorOverlay'
import PrintOverlay from './PrintOverlay/PrintOverlay'

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Navbar />
        <Homepage />
        <LoginOverlay />
        <MessageOverlay />
        <ErrorOverlay />
        <PrintOverlay />
      </React.Fragment>
    );
  }
}

export default App;
