import React, { Component } from 'react';
import './Clients.css';
import $ from 'jquery';
import Request from 'superagent'
import Utility from '../Utility/Utility'
const aws = "https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/prod"

class Clients extends Component {
  constructor(props){
    super(props)
    this.state = {
      clients : []
    }
  }
  static search(str){
    const regex = /[/.]/g
  	const slashCount = (str.match(regex) || []).length
    if (slashCount == 2){
  		{/**str = utilCleanUpDate(str)
  		str = moment(str, uiDate).format(date)
  		clientData = dbGetData(aws+"/clients/dob/"+str).clients*/}
  	} else if (!isNaN(str)&&str.length<MAX_ID_DIGITS){
  		clientData = dbGetData(aws+"/clients/"+str).clients
  	} else if (str.includes(" ")){
  		str = Utility.changeWordCase(str)
  		let split = str.split(" ")
  //*** TODO deal with more than two words ***
  		let d1 = Request.get(aws+"/clients/givenname/"+split[0]).clients
  		let d2 = dbGetData(aws+"/clients/familyname/"+split[0]).clients
  		let d3 = dbGetData(aws+"/clients/givenname/"+split[1]).clients
  		let d4 = dbGetData(aws+"/clients/familyname/"+split[1]).clients
  		clientData = utilRemoveDupClients(d1.concat(d2).concat(d3).concat(d4))
  	} else if (clientData==null||clientData.length==0){
  		str = utilChangeWordCase(str)
  		let d2 = dbGetData(aws+"/clients/givenname/"+str).clients
  		let d1 = dbGetData(aws+"/clients/familyname/"+str).clients
  		if (d1.length>0&&d2.length<1){
  			clientData = utilRemoveDupClients(d1.concat(d2))
  		}	else if (d2.length>0){
  			clientData = utilRemoveDupClients(d2.concat(d1))
  		}
  	}
  }
  render() {
    return (
      <div>
      </div>
    );
  }
}
export default Clients;
