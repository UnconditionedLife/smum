import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { Box, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { addServiceAsync, getActiveSvcTypes } from '../../System/js/Clients/Services'
import { PrimaryButtons, SecondaryButtons, ServiceNotes } from '..';
import { prnPrintReminderReceipt } from '../../System/js/Clients/Receipts';
import { removeSvcAsync } from '../../System/js/Clients/History';
import { globalMsgFunc } from '../../System/js/Database';
import { HeaderTitle } from '..';
import { calFindOpenDate } from '../../System/js/Calendar';
import { utilCalcTargetServices } from '../../System/js/Clients/ClientUtils.js';

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

dayjs.extend(relativeTime)

export default function ServicesPage(props) {
    const { client, updateClient, clientsFound, selectedTab, lastServedDays, lastServedFoodDate, clientInactive } = props
    // const [ svcHistory, setSvcHistory ] = useState(null)
    // const [ lastServedDays, setLastServedDays ] = useState(null)
    // const [ lastServedFoodDate, setLastServedFoodDate ] = useState(null)
    const [ lastServedText, setLastServedText ] = useState(null)
    const [ nextServiceDate, setNextServiceDate ] = useState(null)
    const [ nextServiceText, setNextServiceText ] = useState(null)
    const [ activeServiceTypes, setActiveServiceTypes ] = useState(null)
    const [ targetServices, setTargetServices ] = useState(null)
    const [ svcHistory, setSvcHistory ] = useState(null)
    const [ isAfter, setIsAfter ] = useState(null)

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
            const lastSvcDate = dayjs(lastServedFoodDate).endOf('day'); // removes time of day so calculation is from end of service day
            updateLastServedText(dayjs(lastServedFoodDate).fromNow().toUpperCase()) // used date/time to display FROM NOW
            const targetDate = dayjs(lastSvcDate).add(14, 'days')
            const nextSvcDate = calFindOpenDate(targetDate, 7);
            setNextServiceDate(nextSvcDate)
            const daysFromNow = dayjs().diff(nextSvcDate, 'days')
            const isAfter = dayjs().isAfter(nextSvcDate, 'day')
            setIsAfter(isAfter)
            if ( isAfter ) {
                if (daysFromNow === 0) updateNextServiceText("TODAY")
                if (daysFromNow === 1) updateNextServiceText(daysFromNow + " DAY OVERDUE")
                if (daysFromNow > 1) updateNextServiceText(daysFromNow + " DAYS OVERDUE")
            } else {
                updateNextServiceText(dayjs(nextSvcDate).format("MMMM D").toUpperCase())
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
        // if (activeServiceTypes === null) {
            setActiveServiceTypes(tempAST)
        // }
        // List of services available today
        const tempTS = utilCalcTargetServices(tempAST)
        // if (targetServices === null) {
            setTargetServices(tempTS)
        // }
    },[ client ])

    function handleAddSvc(svcType){
        addServiceAsync( client, svcType )
            .then((updatedClient) => {
                if (updatedClient !== null){
                    // updates svcHistory
                    updateClient(updatedClient)
                } else {   
                    globalMsgFunc('error', "FAILED to add service")
                }
            })
    }

    function handleUndoSvc(svcType){ 
        removeSvcAsync( client, svcType )
            .then((updatedClient) => {                
                if (updatedClient !== null){
                    // updates svcHistory
                    updateClient(updatedClient)
                } else {   
                    globalMsgFunc('error', "FAILED to remove service")
                }
            })
    }

    function printReminder(){
        prnPrintReminderReceipt(client, nextServiceDate);
    }

    // prevent rendering before activeServiceTypes are loaded
    if (activeServiceTypes === null) return null

    if (clientInactive) return (
        <Box
            key={ svcHistory }
            sx={{
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap"
            }}>
            <Typography variant='h3' color='secondary' style={{ lineHeight:"300px" }} noWrap>
                CLIENT IS INACTIVE
            </Typography>
        </Box>
    );

    return (
        <Box
            key={ svcHistory }
            sx={{
                maxWidth: '100%',
                display: "grid",
                gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 340px' },
                columnGap: 3,
                alignItems: 'start',
            }}>
            <Box
                sx={{
                    width: '100%',
                    mt: 4,
                    pt: 0
                }}>
                <Box
                    sx={{
                        p: 1.5,
                        pl: 2,
                        pr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: '12px',
                    }}>
                    <HeaderTitle client={ client } clientsFound={ clientsFound } selectedTab = { selectedTab } />
                    {/* <LastServed lastServed={ lastServed } nextService={ nextService } /> */}
                    <Box
                        key={ lastServedText + nextServiceText }
                        sx={{
                            mt: .75,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                            <Typography variant='subtitle1' color='secondary' style={{ lineHeight:"24px" }} noWrap>
                                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>Served&nbsp;</Box>{ lastServedText }
                            </Typography>
                        </Box>
                        { !isAfter && 
                            <Box
                                style={{ cursor:'pointer'}}
                                onClick={ printReminder }
                                sx={{
                                    ml: 1.5,
                                    px: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: 1,
                                    borderColor: (theme) => alpha(theme.palette.secondary.main, 0.35),
                                    borderRadius: 999,
                                    bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.06),
                                    justifyContent: 'center',
                                    '&:hover': { bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.12) },
                                }}>
                                <Typography variant='subtitle1' color='secondary' style={{ lineHeight:"24px" }} noWrap>
                                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>Next&nbsp;</Box><span>{ nextServiceText } &nbsp;</span> 
                                </Typography><PrintIcon color='secondary' fontSize='small' />
                            </Box>
                        }
                        { isAfter &&
                        <Box
                            sx={{
                                ml: 1.5,
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                            <Typography variant='subtitle1' color='secondary' style={{ lineHeight:"24px" }} noWrap>
                                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>Next&nbsp;</Box>{ nextServiceText }
                            </Typography>
                        </Box>
                        }
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: 'wrap',
                        mt: 4
                    }}>
                    <PrimaryButtons { ...props } lastServedFoodDate={ lastServedFoodDate } lastServedDays={ lastServedDays }
                        handleAddSvc={ handleAddSvc } handleUndoSvc={ handleUndoSvc } activeServiceTypes={ activeServiceTypes }
                        targetServices={ targetServices } />
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: 'wrap',
                        mt: 4
                    }}>
                    <SecondaryButtons { ...props } lastServedFoodDate={ lastServedFoodDate } lastServedDays={ lastServedDays }
                        handleAddSvc={ handleAddSvc } handleUndoSvc={ handleUndoSvc } activeServiceTypes={ activeServiceTypes }
                        targetServices={ targetServices } />
                </Box>
            </Box>
            <Box
                sx={{
                    width: '100%',
                    maxWidth: { xs: 500, lg: 'none' },
                    mx: 'auto',
                    mt: 4,
                }}>
                <ServiceNotes { ...props } />
            </Box>
        </Box>
    );
}