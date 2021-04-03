import React, { useState } from 'react'
import PropTypes from 'prop-types';
import moment from 'moment';
import { Typography } from '../../System'
import { getFoodInterval } from '../../System/js/Clients/Services'
import { Box } from '@material-ui/core';

LastServed.propTypes = {
    client: PropTypes.object.isRequired,
}

export default function LastServed(props) {
    const client = props.client
    const [ lastVisit, setLastVisit ] = useState("FIRST SERVICE")
    const [ nextService, setNextService ] = useState("")

    function handleSetLastVisit(newValue){
        if (lastVisit !== newValue) setLastVisit(newValue)
    }

    function handleSetNextService(newValue){
        if (nextService !== newValue) setNextService(newValue)
    }

    console.log("CLIENT IN LAST SERVED")
    console.log(client)
 
    if (client.lastServed[0] !== undefined) {
        let lastServed = window.utilCalcLastServedDays()
        if (lastServed.lowestDays != 10000) {
            if (lastServed.lowestDays == 0) {
                handleSetLastVisit('LAST SERVED TODAY')
            } else {
                let servedDate = moment().subtract(lastServed.lowestDays, "days");
                let displayLastServed = moment(servedDate).fromNow()
                handleSetLastVisit('LAST SERVED ' + displayLastServed.toUpperCase())
                let nonUSDAServiceInterval = getFoodInterval("NonUSDA")
                if (lastServed.lowestDays < nonUSDAServiceInterval){
                    let nextServiceDays = (nonUSDAServiceInterval - lastServed.lowestDays)
                    if (nextServiceDays == 1) {
                        handleSetNextService("Next service is tomorrow!")
                    } else {
                        let nextServiceDate = moment().add(nextServiceDays, "days")
                        handleSetNextService("Next service " + moment(nextServiceDate).format("dddd, MMMM Do") + "!")
                    }
                }
            }
        }
    }

    return (
        <Box width='100%' display='flex' flexDirection='row'>
            <Box width='50%'>
                <Typography variant='button' color='secondary' noWrap>{ lastVisit }</Typography>
            </Box>
            <Box width='50%' justifyContent="flex-end">
                <Typography variant='button' color='secondary' noWrap>{ nextService }</Typography>
            </Box>
        </Box>
    )
}