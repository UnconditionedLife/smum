import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Popper, Table, TableBody, TableCell, TableContainer, 
            TableHead, TableRow } from '@mui/material';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import { Card } from '../../System';
import { HistoryFormDialog, HistoryPopupMenu } from '..';
import { isEmpty, isMobile } from '../../System/js/GlobalUtils';
import { removeSvcAsync } from '../../System/js/Clients/History';
import { globalMsgFunc, isAdmin } from '../../System/js/Database';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect } from 'react';

HistoryBodyRow.propTypes = {
    svcHistory: PropTypes.array.isRequired,
    selectedService: PropTypes.object,
    handleSelectedService: PropTypes.func.isRequired,
}

export default function HistoryBodyRow(props) {
    dayjs.extend(customParseFormat)
    const { svcHistory, selectedService, handleSelectedService } = props
    
    if (isEmpty(svcHistory)) return null

    const validRow = { color: 'text.primary' }
    const invalidRow = { color: 'secondary.main', cursor:'default' }

    return (
        <TableBody>
            <Fragment>
                { svcHistory.map((svc) => (
                    <Fragment key={svc.svcId} >
                        <TableRow 
                            key={ svc.svcId }
                            onClick= { (event) => { if (isAdmin() && svc.svcValid) handleSelectedService(event, svc)} }
                            selected= { svc.svcId == selectedService }>
                            <TableCell 
                                sx={ (svc.svcValid) ? validRow : invalidRow }>
                                    { (svc.svcValid) ? 
                                        <span style={{ fontSize: '0.8125rem'}}>
                                            { (dayjs(svc.svcUpdatedDT).format("MMM DD, YYYY - h:mma") !== 'Invalid Date') ? 
                                                dayjs(svc.svcUpdatedDT).format("MMM DD, YYYY - h:mma") : dayjs(svc.svcDT).format("MMM DD, YYYY - h:mma") }
                                            <br/>
                                            { dayjs(svc.svcDT).format("MMM DD, YYYY - h:mma") }
                                        </span> : 
                                        <Box sx={{
                                            display: "flex"
                                        }}>
                                            <Box
                                                sx={{
                                                    mr: .25,
                                                    mt: 1.4
                                                }}>
                                                { (svc.svcValid) ? "" : <DoNotDisturbOnIcon fontSize="small" /> }
                                            </Box>
                                            <Box>
                                                <span style={{ fontSize: '0.75rem'}}>
                                                    { (dayjs(svc.svcUpdatedDT).format("MMM DD, YYYY - h:mma") !== 'Invalid Date') ? 
                                                        dayjs(svc.svcUpdatedDT).format("MMM DD, YYYY - h:mma") : dayjs(svc.svcDT).format("MMM DD, YYYY - h:mma") }
                                                    <br/>
                                                    { dayjs(svc.svcDT).format("MMM DD, YYYY - h:mma") }
                                                </span>
                                            </Box>
                                        </Box>
                                    }
                            </TableCell>
                            <TableCell 
                                sx={ (svc.svcValid) ? validRow : invalidRow }>
                                    { svc.svcName }
                            </TableCell>
                            <TableCell
                                sx={ (svc.svcValid) ? validRow : invalidRow }>
                                    { svc.cStatus }
                            </TableCell>
                            <TableCell 
                                sx={ (svc.svcValid) ? validRow : invalidRow }>
                                    { (svc.homeless) ? "YES" : "NO" }
                            </TableCell>
                            <TableCell 
                                sx={ (svc.svcValid) ? validRow : invalidRow }>
                                    { svc.svcItems }
                            </TableCell>
                            <TableCell
                                sx={ (svc.svcValid) ? validRow : invalidRow }>
                                    { svc.adults }
                            </TableCell>
                            <TableCell
                                sx={ (svc.svcValid) ? validRow : invalidRow }>
                                    { svc.children }
                            </TableCell>
                            <TableCell
                                sx={ (svc.svcValid) ? validRow : invalidRow }>
                                    { svc.individuals }
                            </TableCell>
                            <TableCell
                                sx={ (svc.svcValid) ? validRow : invalidRow }>
                                    { svc.seniors }
                            </TableCell>
                            <TableCell
                                sx={ (svc.svcValid) ? validRow : invalidRow }>
                                    { svc.svcBy }
                            </TableCell>
                        </TableRow>
                    </Fragment>
                ))}
            </Fragment>
        </TableBody>
    );
}