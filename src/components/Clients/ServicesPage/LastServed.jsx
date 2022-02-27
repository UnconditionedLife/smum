import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import moment from 'moment';
import { Typography } from '../../System';
import { getLastServedFood } from '../../System/js/Clients/Services';
import { calFindOpenDate } from '../../System/js/Calendar';
import { Box } from '@material-ui/core';

LastServed.propTypes = {
    client: PropTypes.object.isRequired,
}

export default function LastServed(props) {
    const { client } = props
    const [ lastVisit, setLastVisit ] = useState("FIRST SERVICE")
    const [ nextService, setNextService ] = useState("")
    const [ svcHistory, setSvcHistory ] = useState({})
    // const [ svcInterval, setSvcInterval ] = useState({})

    useEffect(() => {
        if (JSON.stringify(client.svcHistory) !== svcHistory) {
            setSvcHistory(JSON.stringify(client.svcHistory))
        }

        // GET LAST FOOD SERVICE DATE
        const lastSvcDateTime = getLastServedFood(client)
        const lastSvcDate = moment(lastSvcDateTime).endOf('day'); // removes time of day so calculation is from end of service day

        if (lastSvcDate !== null) {
            updateLastVisit(moment(lastSvcDate).fromNow().toUpperCase())
            const targetDate = moment(lastSvcDate).add(14, 'days').endOf('day'); // removes time of day so calculation is from end of service day
            const earliestDate = moment(lastSvcDate).add(7, 'days').endOf('day'); // removes time of day so calculation is from end of service day
            const nextSvcDate = calFindOpenDate(targetDate, earliestDate);
            const daysFromNow = moment().diff(nextSvcDate, 'days')
            const isAfter = moment().isAfter(nextSvcDate, 'day')

console.log("NEXT SVC", nextSvcDate)            
console.log("ISAFTER", isAfter)
console.log("DAYS FROM", daysFromNow)

            if ( isAfter ) {
                if (daysFromNow === 0) updateNextService("TODAY")
                if (daysFromNow === 1) updateNextService(daysFromNow + " DAY OVERDUE")
                if (daysFromNow > 1) updateNextService(daysFromNow + " DAYS OVERDUE")
            } else {
                updateNextService(moment(nextSvcDate).format("MMMM Do").toUpperCase())
            }
        }
    },[ JSON.stringify(client.svcHistory) ])

    function updateLastVisit(newValue){
        if (lastVisit !== newValue) setLastVisit(newValue)
    }

    function updateNextService(newValue){
        if (nextService !== newValue) setNextService(newValue)
    }
 
    return (
        <Box mt={ .75 } display='flex' flexDirection='column' key={ svcHistory }>
            <Box display='flex' justifyContent='right'>
                <Typography variant='subtitle1' color='secondary' style={{ lineHeight:"24px" }} noWrap>
                    <span style={{ color:"#ccc" }}>LAST SERVED:&nbsp;</span>{ lastVisit }
                </Typography>
            </Box>
            <Box display='flex' justifyContent='right'>
                <Typography variant='subtitle1' color='secondary' style={{ lineHeight:"24px" }} noWrap>
                    <span style={{ color:"#ccc" }}>NEXT SERVICE:&nbsp;</span>{ nextService }
                </Typography>
            </Box>
        </Box>
    )
}