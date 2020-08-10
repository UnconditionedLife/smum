import React from 'react';
import { isEmpty } from '../js/Utils.js';
import { useEffect, useRef } from 'react';

export default function HistoryPage(props) {
    const client = props.client;
    const historyDivTop = useRef(null);
    const historyDivBottom = useRef(null);

    useEffect(() => {
        console.log("EFFECT")
        if (!isEmpty(client)) {
            window.uiBuildHistoryTop(historyDivTop.current)
        }
    })

    useEffect(() => {
        console.log("EFFECT")
        if (!isEmpty(client)) {
            window.client = client
            uiBuildHistoryBottom(historyDivBottom.current)
            // window.uiGenSelectHTMLTable(historyDivBottom.current,client.dependents,["givenName","familyName",'relationship','gender', "dob","age", "grade","isActive"],'dependentsTable')
        }
    })

    return (
        <div>
            <div ref={ historyDivTop }></div>
            <div><br/></div>
            <div ref={ historyDivBottom }></div>
        </div>
    );
};