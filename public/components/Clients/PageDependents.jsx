import React from 'react';
import { isEmpty } from '../js/Utils.js';
import { useEffect, useRef } from 'react';

export default function DependentsPage(props) {
    const client = props.client;
    const dependentsDiv = useRef(null);

    useEffect(() => {
        console.log("EFFECT")
        if (!isEmpty(client)) {
            window.uiGenSelectHTMLTable(dependentsDiv.current,client.dependents,["givenName","familyName",'relationship','gender', "dob","age", "grade","isActive"],'dependentsTable')
        }
    })

    return (
        <div>
            <div ref={ dependentsDiv }></div>
        </div>
    );
};