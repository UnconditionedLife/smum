import React, { useState, useEffect, useRef } from 'react';

export default function FoundPage(props) {
    const clientData = props.clientData
    const counter = props.counter
    const columns = ["clientId","givenName","familyName","dob","street"]

    const DidMount = props => {
        const didMountRef = useRef(false)
        
        console.log("MOUNT")
        useEffect(() => {
            console.log("EFFECT")
            if (clientData !== null) {
                if (didMountRef.current) {
                    const columns = ["clientId","givenName","familyName","dob","street"]
                    window.uiGenSelectHTMLTable("FoundClientsContainer", clientData, columns,'clientTable')
                } else didMountRef.current = true
            }
        })
    };

    // I TRIED THIS AS WELL AND IT DID NOT WORK EITHER
    // useEffect(() => {
    //     return () => {
    //         console.log("EFFECT")
    //         console.log(clientData)
    //         if (clientData !== null) {
    //             console.log("IN SHOW TABLE")
    //             const columns = ["clientId","givenName","familyName","dob","street"]
    //             window.uiGenSelectHTMLTable("FoundClientsContainer", clientData, columns,'clientTable')
    //         }
    //     }
    // })

    DidMount()
    
    return (
        <div>
            <div><br/><br/></div>
    <div>FOUND PAGE { counter} </div>
                <div id ="FoundClientsContainer"></div>
            <div><br/><br/></div>
        </div>
    );
};