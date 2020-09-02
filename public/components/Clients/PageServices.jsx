import React from 'react';
// import PrimaryButtons from "./ServicesPrimaryButtons.jsx";
// import SecondaryButtons from "./ServicesSecondaryButtons.jsx";
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { isEmpty } from '../js/Utils.js';
import { useEffect, useRef, useState } from 'react';
import ServiceNotes from './ServiceNotes.jsx';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        minWidth: '100%',
        alignContent: 'stretch',
    },
    serviceContainer: {
        minWidth: '',
        flex: 1,
    },
  });

export default function ServicesPage(props) {
    const client = props.client;
    const handleClientChange = props.handleClientChange;
    const servicesPrimaryButtonsDiv = useRef(null);
    const servicesSecondaryButtonsDiv = useRef(null);
    const classes = useStyles();

    let serviceDateTimeREACT
    let nextService = ""

    if (!isEmpty(client)) {
        serviceDateTimeREACT = window.moment().format(longDate) //update date & time in upper left
        let visitHeader = "FIRST SERVICE VISIT"; // uppdate the last served info in upper right
        
        if (client.lastServed[0] != undefined) {
            let lastServed = window.utilCalcLastServedDays()
            if (lastServed.lowestDays != 10000) {
                if (lastServed.lowestDays == 0) {
                    visitHeader = 'LAST SERVED TODAY'
                } else {
                    let servedDate = window.moment().subtract(lastServed.lowestDays, "days");
                    let displayLastServed = window.moment(servedDate).fromNow() //lastServedFood[0].serviceDateTime
                    visitHeader = 'LAST SERVED ' + displayLastServed.toUpperCase()
                    let nonUSDAServiceInterval = window.utilGetFoodInterval("NonUSDA")
                    if (lastServed.lowestDays < nonUSDAServiceInterval){
                        let nextServiceDays = (nonUSDAServiceInterval - lastServed.lowestDays)
                        if (nextServiceDays == 1) {
                            nextService = "<br>" + "Next service is tomorrow!"
                        } else {
                            let nextServiceDate = window.moment().add(nextServiceDays, "days")
                            nextService = "<br>" + "Next service " + window.moment(nextServiceDate).format("dddd, MMMM Do") + "!"
                        }
                    }
                }
            }
        }
        nextService = visitHeader + nextService
    };

    useEffect(() => {
        if (!isEmpty(client)) {
            window.uiShowServicesButtons(servicesPrimaryButtonsDiv.current, 'primary')
        }
    })

    useEffect(() => {
        if (!isEmpty(client)) {
            window.uiShowServicesButtons(servicesSecondaryButtonsDiv.current, 'secondary')
        }
    })

    if (isEmpty(client)) return null

    return (
        <div className={ classes.container }>
            <div className={ classes.serviceContainer }>
                <div className="serviceButtonContainerREACT">
                    <div className="serviceDateTimeREACT">{ serviceDateTimeREACT }</div>
                    <div className="serviceLastVisitREACT">{ nextService }</div>
                    <div ref={ servicesPrimaryButtonsDiv } className="servicePrimaryButtonsREACT"></div>
                    <div ref={ servicesSecondaryButtonsDiv } className="serviceSecondaryButtonsREACT"></div>
                </div>
            </div>
            <div className={ classes.noteContainer }>
                <ServiceNotes 
                    client={ client }
                    handleClientChange = { handleClientChange }  
                />
            </div>
        </div>
    );
};


// code below is work in progress for migrating service buttons to REACT
export function XServicesPage(props) {
    const client = props.client


    return (
        <div>
            <div><br/></div>
            <div>SERVICES PAGE</div>
            <div><br/></div>
            <div id="content2">
                <div id="serviceButtonContainerREACT">
                    <div id="serviceDateTimeREACT">{ serviceDateTimeREACT }</div>
                    <div id="serviceLastVisitREACT">{ nextService }</div>
                    <div id="servicePrimaryButtonsREACT">{ <PrimaryButtons /> }</div>
                    {/* <div id="serviceSecondaryButtonsREACT">{ <SecondaryButtons /> }</div> */}
               </div>
             </div>
             <div><br/><br/></div>
        </div>
    );
};