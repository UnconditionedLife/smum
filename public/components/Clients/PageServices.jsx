import React from 'react';
import PrimaryButtons from "./ServicesPrimaryButtons.jsx";
// import SecondaryButtons from "./ServicesSecondaryButtons.jsx";

export default function ServicesPage() {

    let serviceDateTimeREACT
    let nextService = ""
    
    if ( client != undefined) {

        console.log("IN THE IF")

        serviceDateTimeREACT = window.moment().format(longDate) //update date & time in upper left
        let visitHeader = "FIRST SERVICE VISIT"; // uppdate the last served info in upper right
        
        console.log("BEFORE CLIENT")

        console.log(client)

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
        console.log(nextService)
    };

    return (
        <div>
            <div><br/></div>
            <div>SERVICES PAGE</div>
            <div><br/></div>
            <div id="content2">
                <div id="serviceButtonContainerREACT">
                    <div id="serviceDateTimeREACT">{ serviceDateTimeREACT }</div>
                    <div id="serviceLastVisitREACT">{ nextService }</div>
                    {/* <div id="servicePrimaryButtonsREACT">{ <PrimaryButtons /> }</div> */}
                    {/* <div id="serviceSecondaryButtonsREACT">{ <SecondaryButtons /> }</div> */}
               </div>
             </div>
             <div><br/><br/></div>
        </div>
    );
};