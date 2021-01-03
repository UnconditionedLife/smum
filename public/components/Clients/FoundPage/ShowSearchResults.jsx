import React, { useState } from 'react';


// NOT USED - WAS USED DURRING MIGRATION TO REACT
export default function ShowSearchResults(props) {
    
    const clientData = props.clientData
    const divID = props.divID
    const columns = ["clientId","givenName","familyName","dob","street"]
    window.uiGenSelectHTMLTable(divID, clientData, columns,'clientTable')

    return (
        <div></div>
     );
};