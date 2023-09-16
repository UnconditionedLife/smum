import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CardContent, CardHeader, Popper, Table, TableBody, TableCell, TableContainer, 
            TableHead, TableRow } from '@mui/material';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import { Card } from '../../System';
import { HistoryFormDialog, HistoryPopupMenu } from '..';
import { isEmpty, isMobile } from '../../System/js/GlobalUtils';
import { removeSvcAsync } from '../../System/js/Clients/History';
import { globalMsgFunc, isAdmin } from '../../System/js/Database';
import moment from 'moment';
import { useEffect } from 'react';

HistoryBodyCard.propTypes = {
    svcHistory: PropTypes.array.isRequired,
    selectedService: PropTypes.object,
    handleSelectedService: PropTypes.func.isRequired,
}

export default function HistoryBodyCard(props) {
    const { svcHistory, selectedService, handleSelectedService } = props
    
    if (isEmpty(svcHistory)) return null

    const validRow = {color: 'black' }
    const invalidRow = { color: 'red', cursor:'default' }

    return (
            <Box display="flex" flexWrap="wrap" justifyContent="center"
            alignItems="center">
                <Fragment>
                    { svcHistory.map((svc) => (
                        <Fragment key={svc.svcId} >
                            <Card 
                                key={ svc.svcId }
                                width={320}
                                style={{cursor: "pointer"}}
                                onClick= { (event) => { if (isAdmin() && svc.svcValid) handleSelectedService(event, svc)} }
                                selected= { svc.svcId == selectedService }>
                                <CardContent style={ (svc.svcValid) ? validRow : invalidRow }>
                                <strong style={{fontSize: "120%"}}>{svc.svcName}</strong><br /><br />
                                <strong>{svc.cStatus}</strong>{svc.homeless ? " | ": null}<strong>{svc.homeless ? "HOMELESS" : null}</strong> | <strong>#items:</strong> {svc.svcItems} <br /> 
                                <strong>adults:</strong> {svc.adults} | <strong>children:</strong> {svc.children} | <strong>individuals:</strong> {svc.individuals} <br />
                                <strong>seniors:</strong> {svc.seniors} | <strong>by:</strong> {svc.svcBy} <br /><br />
                                <div style={{textAlign: "right", fontSize: '85%'}}>{(moment(svc.svcUpdatedDT).format("MMM DD, YYYY - h:mma") !== 'Invalid date') ? moment(svc.svcUpdatedDT).format("MMM DD, YYYY - h:mma") : moment(svc.svcDT).format("MMM DD, YYYY - h:mma")}</div>
                                </CardContent>                                    
                            </Card>
                        </Fragment>
                    ))}
                </Fragment>
            </Box>
    )
}