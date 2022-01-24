import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import moment from 'moment';
import { Typography } from '../../System'
import { getFoodInterval, utilCalcLastServedDays } from '../../System/js/Clients/Services'
import { Box } from '@material-ui/core';

LastServed.propTypes = {
    client: PropTypes.object.isRequired,
}

export default function LastServed(props) {
    const client = props.client
    const [ lastVisit, setLastVisit ] = useState("FIRST SERVICE")
    const [ nextService, setNextService ] = useState("")
    const [ svcHistory, setSvcHistory ] = useState({})
    const [ svcInterval, setSvcInterval ] = useState({})

    useEffect(() => {
        if (JSON.stringify(client.svcHistory) !== svcHistory) {
            setSvcHistory(JSON.stringify(client.svcHistory))
            setSvcInterval(getFoodInterval())
        }
        if (client.lastServed[0] !== undefined) {
            let lastServed = utilCalcLastServedDays(client)
            if (lastServed.lowestDays != 10000) {
                if (lastServed.lowestDays == 0) {
                    handleSetLastVisit('LAST SERVED TODAY')
                } else {
                    let servedDate = moment().subtract(lastServed.lowestDays, "days");
                    let displayLastServed = moment(servedDate).fromNow()
                    handleSetLastVisit('LAST SERVED ' + displayLastServed.toUpperCase())
                    // let svcInterval = getFoodInterval()
                    if (lastServed.lowestDays < svcInterval.nonUSDA){
                        let nextServiceDays = (svcInterval.nonUSDA - lastServed.lowestDays)
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
    },[ JSON.stringify(client.svcHistory) ])

    function handleSetLastVisit(newValue){
        if (lastVisit !== newValue) setLastVisit(newValue)
    }

    function handleSetNextService(newValue){
        if (nextService !== newValue) setNextService(newValue)
    }
 
    return (
        <Box mt={ .75 } display='flex' flexDirection='column' key={ svcHistory }>
            <Box display='flex' justifyContent='center'>
                <Typography variant='button' color='secondary' noWrap>{ lastVisit }</Typography>
            </Box>
            <Box display='flex' justifyContent='center'>
                <Typography variant='button' color='secondary' noWrap>{ nextService }</Typography>
            </Box>
        </Box>
    )
}