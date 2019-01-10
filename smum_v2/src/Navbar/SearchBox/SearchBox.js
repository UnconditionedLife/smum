import React, { Component } from 'react';
import './SearchBox.css';
import $ from 'jquery';
import Request from 'superagent'
import Clients from '../../Clients/Clients'
class SearchBox extends Component {
  constructor(props){
    super(props)
  }

  render() {
    return (
        <div className="searchDiv">
          <input id="searchField" className="search" type="text" placeholder="Search clients" />
          <i onClick={()=>Clients.search($('#searchField').val())} className="fa fa-search-plus fa-lg searchIcon" aria-hidden="true" />
            {/* <img class="searchImage" src="images/search.png" onclick="clientSearchResults()"> */}
        </div>
    );
  }
}
export default SearchBox;
