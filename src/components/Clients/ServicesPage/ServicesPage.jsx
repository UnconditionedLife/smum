import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { Box, Typography } from '@mui/material';
import { addServiceAsync, getLastServedDays, getActiveSvcTypes, getTargetServices } from '../../System/js/Clients/Services'
import { PrimaryButtons, SecondaryButtons, ServiceNotes } from '..';
import { removeSvcAsync } from '../../System/js/Clients/History';
import { globalMsgFunc } from '../../System/js/Database';
import { HeaderTitle } from '..';
import { calFindOpenDate } from '../../System/js/Calendar';

ServicesPage.propTypes = {
    client: PropTypes.object.isRequired, 
    updateClient: PropTypes.func.isRequired,
    svcsRendered: PropTypes.object,
    updateSvcsRendered: PropTypes.func,
    clientsFound: PropTypes.array,
    selectedTab: PropTypes.string,
    showAlert: PropTypes.func.isRequired,
    lastServedDays: PropTypes.object,
    lastServedFoodDate: PropTypes.object,
    clientInactive: PropTypes.bool.isRequired,
}

export default function ServicesPage(props) {
    const { client, updateClient, clientsFound, selectedTab, lastServedDays, lastServedFoodDate, clientInactive } = props
    // const [ svcHistory, setSvcHistory ] = useState(null)
    // const [ lastServedDays, setLastServedDays ] = useState(null)
    // const [ lastServedFoodDate, setLastServedFoodDate ] = useState(null)
    const [ lastServedText, setLastServedText ] = useState(null)
    // const [ nextServiceDate, setNextServiceDate ] = useState(null)
    const [ nextServiceText, setNextServiceText ] = useState(null)
    const [ activeServiceTypes, setActiveServiceTypes ] = useState(null)
    const [ targetServices, setTargetServices ] = useState(null)
    const [ svcHistory, setSvcHistory ] = useState(null)

    useEffect(() => {
        if (!isEmpty(client)) {
            if (JSON.stringify(client.svcHistory) !== svcHistory) {
                setSvcHistory(JSON.stringify(client.svcHistory))
            }
        }
    },[ client ])

    useEffect(() => {
        if (lastServedFoodDate === null) {
            if (lastServedText !== "Never") setLastServedText("Never")
            if (nextServiceText !== "Today") setNextServiceText("Today")
        } else {
            const lastSvcDate = moment(lastServedFoodDate).endOf('day'); // removes time of day so calculation is from end of service day
            // if (lastServedFoodDate !== lastSvcDate) setLastServedFoodDate(lastSvcDate)
            updateLastServedText(moment(lastServedFoodDate).fromNow().toUpperCase()) // used date/time to display FROM NOW
            const targetDate = moment(lastSvcDate).add(14, 'days')
            const nextSvcDate = calFindOpenDate(targetDate, 7);
            const daysFromNow = moment().diff(nextSvcDate, 'days')
            const isAfter = moment().isAfter(nextSvcDate, 'day')
            if ( isAfter ) {
                if (daysFromNow === 0) updateNextServiceText("TODAY")
                if (daysFromNow === 1) updateNextServiceText(daysFromNow + " DAY OVERDUE")
                if (daysFromNow > 1) updateNextServiceText(daysFromNow + " DAYS OVERDUE")
            } else {
                updateNextServiceText(moment(nextSvcDate).format("MMMM Do").toUpperCase())
            }
        }

        function updateLastServedText(newValue){
            if (lastServedText !== newValue) setLastServedText(newValue)
        }

        function updateNextServiceText(newValue){
            if (nextServiceText !== newValue) setNextServiceText(newValue)
        }
    },[ lastServedDays, lastServedFoodDate ])

    useEffect(() => {
        // List of all Active Service Types
        const tempAST = getActiveSvcTypes()
        if (activeServiceTypes === null) {
            setActiveServiceTypes(tempAST)
        }
        // List of services available today
        const tempTS = getTargetServices(tempAST)
        if (targetServices === null) {
            setTargetServices(tempTS)
        }
    },[ client ])

    function handleAddSvc(svcTypeId){
        addServiceAsync( client, svcTypeId )
            .then((updatedClient) => {
                if (updatedClient !== null){
                    // updates svcHistory
                    updateClient(updatedClient)
                } else {   
                    globalMsgFunc('error', "FAILED to add service")
                }
            })
    }

    function handleUndoSvc(svc){ 
        removeSvcAsync( client, svc )
            .then((updatedClient) => {                
                if (updatedClient !== null){
                    // updates svcHistory
                    updateClient(updatedClient)
                } else {   
                    globalMsgFunc('error', "FAILED to remove service")
                }
            })
    }

    // prevent rendering before activeServiceTypes are loaded
    if (activeServiceTypes === null) return null

    if (clientInactive) return (
        <Box key={ svcHistory } display="flex" justifyContent="space-around" flexWrap="wrap">
            <Typography variant='h3' color='secondary' style={{ lineHeight:"300px" }} noWrap>
                CLIENT IS INACTIVE
            </Typography>
        </Box>
    )

    return (
        <Box key={ svcHistory } display="flex" justifyContent="space-around" flexWrap="wrap">
            <Box width='100%' maxWidth="800px" mt={ 4 } pt={ 0 }>
                <Box p={ 1 } pl={ 2 } pr={ 2 } display='flex' justifyContent="space-between" flexWrap="wrap" 
                    style={{ borderRadius: "6px", backgroundColor:"#F3F3F3" }}>
                    <HeaderTitle client={ client } clientsFound={ clientsFound } selectedTab = { selectedTab } />
                    {/* <LastServed lastServed={ lastServed } nextService={ nextService } /> */}
                    <Box mt={ .75 } display='flex' flexDirection='row' key={ lastServedText + nextServiceText }>
                        <Box display='flex' justifyContent='right'>
                            <Typography variant='subtitle1' color='secondary' style={{ lineHeight:"24px" }} noWrap>
                                <span style={{ color:"#ccc" }}>SERVED:&nbsp;</span>{ lastServedText }
                            </Typography>
                        </Box>
                        <Box ml={1.5} display='flex' justifyContent='right'>
                            <Typography variant='subtitle1' color='secondary' style={{ lineHeight:"24px" }} noWrap>
                                <span style={{ color:"#ccc" }}>NEXT:&nbsp;</span>{ nextServiceText }
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <PrimaryButtons { ...props } lastServedFoodDate={ lastServedFoodDate } lastServedDays={ lastServedDays }
                        handleAddSvc={ handleAddSvc } handleUndoSvc={ handleUndoSvc } activeServiceTypes={ activeServiceTypes }
                        targetServices={ targetServices } />
                </Box>
                <Box display="flex" justifyContent="center" flexWrap='wrap' mt={ 4 }>
                    <SecondaryButtons { ...props } lastServedFoodDate={ lastServedFoodDate } lastServedDays={ lastServedDays }
                        handleAddSvc={ handleAddSvc } handleUndoSvc={ handleUndoSvc } activeServiceTypes={ activeServiceTypes }
                        targetServices={ targetServices } />
                </Box>
            </Box>
            <Box maxWidth="500px" mt={ 3 } justifyContent="center">
                <ServiceNotes { ...props } />
            </Box>
        </Box>
    )
}