import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Typography } from '@material-ui/core';
import { Badge, CardContent, Fade, Tooltip, } from '@material-ui/core';
import { House } from '@material-ui/icons';
import { isEmpty } from '../../System/js/Utils.js';
import { Card } from '../../System';
import { LastServed, PrimaryButtons, SecondaryButtons, ServiceNotes } from '../';
import { HeaderTitle } from '../../Clients';

ServicesPage.propTypes = {
    client: PropTypes.object.isRequired,
    handleClientChange: PropTypes.func.isRequired,
    session: PropTypes.object.isRequired,
}

export default function ServicesPage(props) {
    // const client = props.client;
    // const handleClientChange = props.handleClientChange;
    // const session = props.session;

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

    if (isEmpty(props.client)) return null

    return (
        <Box display="flex" justifyContent="space-around" flexWrap="wrap">
            <Box width='100%' maxWidth="800px" mt={ 5 } pt={ 0 }>
                <Card width='100%' height='80px'>
                    <Box width='100%' display='flex' p={ 2.5 } justifyContent='center' alignItems='center' flexDirection='column'>
                        <Typography variant='h6' color='textPrimary' align='center' noWrap>AVAILABLE SERVICES</Typography>
                        <LastServed client={ props.client }/>
                    </Box>
                </Card>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <PrimaryButtons client={ props.client }/>
                </Box>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <SecondaryButtons client={ props.client }/>
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
                <ServiceNotes { ...props } />
            </Box>
        </Box>
    )
}