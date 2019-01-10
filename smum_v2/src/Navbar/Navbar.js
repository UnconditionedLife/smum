import React, { Component } from 'react';
import './Navbar.css';

class Navbar extends Component {
  constructor(props){
    super(props);
    this.state = {
      version: "1.03"
    }
  }
  render() {
    return (
        <nav className="navbar">
          <div className="logo">
            <img src="images/smumLogo.png" width="31" height="42" alt="SMUM" />
            <span>&nbsp;&nbsp;Santa Maria Urban Ministry</span>
          </div>
          <div className="searchDiv">
            <input id="searchField" className="search" type="text" placeholder="Search clients" />
            <i className="fa fa-search-plus fa-lg searchIcon" aria-hidden="true" />
            {/* <img class="searchImage" src="images/search.png" onclick="clientSearchResults()"> */}
          </div>
          {/* <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
      <a class="navbar-brand" onClick="refreshHome()">
      <img src="images/smumLogo.png" width="31" height="42" alt="">
      </a> */}
          {/* <ul class="navbar-nav mr-auto">
      <form class="form-inline my-2 my-lg-0 text-nowrap">
      <input class="form-control mr-sm searchHeader" type="text" placeholder="Search">
      <a href="#" onclick="searchResults('.main-div')"><img class="imgMargin" src="images/search.png" /></a></form>
      </ul> */}
          <div className="navButtons">
            <ul className="navbar-nav">
              <li id="nav1" className="navItem navActive">Clients</li>
              {/* <li id="nav2" class="navItem" onClick="navSwitch('programs')">Programs</li> */}
              <li id="nav3" className="navItem">Admin</li>
              <li id="nav4" className="navItem" />
              <li id="nav5" className="navItem logInOut">Login</li>
            </ul>
            <span id="versionNum">{this.state.version}</span>
          </div>
        </nav>
    );
  }
}
export default Navbar;
