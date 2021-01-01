import React, { useState } from 'react'
import { Typography } from '../../System'
import { isEmpty } from '../../System/js/GlobalUtils.js'
import { getFoodInterval } from '../../System/js/Clients/Services.js'

export default function LastServed(props) {
    const client = props.client
    const [ lastVisit, setLastVisit ] = useState("FIRST SERVICE")
    const [ nextService, setNextService ] = useState("")

    const handleSetLastVisit = (newValue) => {
        if (lastVisit !== newValue) setLastVisit(newValue)
    }

    const handleSetNextService = (newValue) => {
        if (nextService !== newValue) setNextService(newValue)
    }

    if (isEmpty(client)) {
        return null
    } else {
        //let visitHeader = "FIRST SERVICE"; // uppdate the last served info in upper right
        
        if (client.lastServed[0] !== undefined) {
            let lastServed = window.utilCalcLastServedDays()
            if (lastServed.lowestDays != 10000) {
                if (lastServed.lowestDays == 0) {
                    handleSetLastVisit('LAST SERVED TODAY')
                } else {
                    let servedDate = window.moment().subtract(lastServed.lowestDays, "days");
                    let displayLastServed = window.moment(servedDate).fromNow() //lastServedFood[0].serviceDateTime
                    handleSetLastVisit('LAST SERVED ' + displayLastServed.toUpperCase())
                    // visitHeader = 'LAST SERVED ' + displayLastServed.toUpperCase()
                    let nonUSDAServiceInterval = getFoodInterval(nextService,false)
                    if (lastServed.lowestDays < nonUSDAServiceInterval){
                        let nextServiceDays = (nonUSDAServiceInterval - lastServed.lowestDays)
                        if (nextServiceDays == 1) {
                            handleSetNextService("Next service is tomorrow!")
                        } else {
                            let nextServiceDate = window.moment().add(nextServiceDays, "days")
                            handleSetNextService(" | Next service " + window.moment(nextServiceDate).format("dddd, MMMM Do") + "!")
                            // nextService = "<br>" + "Next service " + window.moment(nextServiceDate).format("dddd, MMMM Do") + "!"
                        }
                    }
                }
            }
        }
    }

    return (
        <Typography variant='button' color='secondary' align='center' noWrap>{ lastVisit }{ nextService }</Typography>
    )
}