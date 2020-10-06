import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@material-ui/core';

import { isEmpty } from '../../System/js/Utils.js';

import { LastServed, PrimaryButtons, SecondaryButtons, ServiceNotes } from '../';

export default function ServicesPage(props) {
    const client = props.client;
    const handleClientChange = props.handleClientChange;
    const session = props.session;
    // const servicesPrimaryButtonsDiv = useRef(null);
    // const servicesSecondaryButtonsDiv = useRef(null);

    // useEffect(() => {
    //     if (!isEmpty(client)) {
    //         window.uiShowServicesButtons(servicesPrimaryButtonsDiv.current, 'primary')
    //     }
    // })

    // useEffect(() => {
    //     if (!isEmpty(client)) {
    //         window.uiShowServicesButtons(servicesSecondaryButtonsDiv.current, 'secondary')
    //     }
    // })

    if (isEmpty(client)) return null

    return (
        <Box display="flex" justifyContent="space-around" flexWrap="wrap">
            <Box maxWidth="840px" mt={ 5.5 } pt={ 0 }>
                <Box width={ 1 } mr={ 2 }>
                    <LastServed client={ client }/>
                </Box>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <PrimaryButtons />
                </Box>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <SecondaryButtons />
                </Box>
                {/* <div className="serviceButtonContainerREACT"> */}
                    {/* <div className="serviceDateTimeREACT">{ serviceDateTimeREACT }</div>
                    <div className="serviceLastVisitREACT">{ nextService }</div> */}
                    {/* <div className="servicePrimaryButtonsREACT"> <PrimaryButtons /> </div>
                    <div ref={ servicesPrimaryButtonsDiv } className="servicePrimaryButtonsREACT"></div> */}
                    {/* <div ref={ servicesSecondaryButtonsDiv } className="serviceSecondaryButtonsREACT"></div> */}
                {/* </div> */}
            </Box>
            <Box maxWidth="500px" mt={ 5 } justifyContent="center">
                <ServiceNotes 
                    client={ client }
                    handleClientChange = { handleClientChange }  
                    session = { session }
                />
            </Box>
        </Box>
    );
};