import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CardContent, Typography } from '@mui/material';
import { Card } from '../../System';
import { isEmpty} from '../../System/js/GlobalUtils';
import { isAdmin } from '../../System/js/Database';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat)

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
            // <Box display="flex" flexWrap="wrap" justifyContent="center"
            // alignItems="center">
            //     <Fragment>
            //         { svcHistory.map((svc) => (
            //             <Fragment key={svc.svcId} >
            //                 <Card 
            //                     key={ svc.svcId }
            //                     width={320}
            //                     style={{cursor: "pointer"}}
            //                     onClick= { (event) => { if (isAdmin() && svc.svcValid) handleSelectedService(event, svc)} }
            //                     selected= { svc.svcId == selectedService }>
            //                     <CardContent style={ (svc.svcValid) ? validRow : invalidRow }>
            //                     <strong style={{fontSize: "120%"}}>{svc.svcName}</strong><br /><br />
            //                     <strong>{svc.cStatus}</strong>{svc.homeless ? " | ": null}<strong>{svc.homeless ? "HOMELESS" : null}</strong> | <strong>#items:</strong> {svc.svcItems} <br /> 
            //                     <strong>adults:</strong> {svc.adults} | <strong>children:</strong> {svc.children} | <strong>individuals:</strong> {svc.individuals} <br />
            //                     <strong>seniors:</strong> {svc.seniors} | <strong>by:</strong> {svc.svcBy} <br /><br />
            //                     <div style={{textAlign: "right", fontSize: '85%'}}>{(moment(svc.svcUpdatedDT).format("MMM DD, YYYY - h:mma") !== 'Invalid date') ? moment(svc.svcUpdatedDT).format("MMM DD, YYYY - h:mma") : moment(svc.svcDT).format("MMM DD, YYYY - h:mma")}</div>
            //                     </CardContent>                                    
            //                 </Card>
            //             </Fragment>
            //         ))}
            //     </Fragment>
            // </Box>
                <Box display="flex" flexWrap="wrap" justifyContent="center"
                    alignItems="center">
                        <Fragment>
                            { svcHistory.map((svc) => (
                                <Fragment key={svc.svcId} >
                                    <Card 
                                        key={ svc.svcId }
                                        width={320}
                                        style={{cursor: "pointer", backgroundColor: "#E0F0E2"}}
                                        onClick= { (event) => { if (isAdmin() && svc.svcValid) handleSelectedService(event, svc)} }
                                        selected= { svc.svcId == selectedService }
                                    >
                                        <CardContent style={ (svc.svcValid) ? validRow : invalidRow }>
                                            <Box display='flex' flexDirection='row'>
                                                <Box>
                                                    <Typography fontSize='90%'>
                                                        <strong>Service</strong> <br />
                                                        <strong>Status</strong> <br />
                                                        <strong>Homeless</strong> <br />
                                                        <strong># Items</strong> <br />
                                                        <strong># Adults</strong> <br />
                                                        <strong># Children</strong> <br />
                                                        <strong># Individuals</strong> <br />
                                                        <strong># Seniors</strong> <br />
                                                        <strong>Updated By</strong> <br />
                                                        <strong>Created</strong> <br />
                                                    </Typography>
                                                </Box>
                                                <Box marginLeft={ 2 }>
                                                    <Typography fontSize='90%'>
                                                        {svc.svcName}<br />
                                                        {svc.cStatus} <br /> 
                                                        {svc.homeless ? "Yes" : "No"} <br /> 
                                                        {svc.svcItems} <br /> 
                                                        {svc.adults} <br /> 
                                                        {svc.children} <br /> 
                                                        {svc.individuals} <br />
                                                        {svc.seniors} <br />
                                                        {svc.svcBy} <br />
                                                        {(dayjs(svc.svcUpdatedDT).format("MMM DD, YYYY - h:mma") !== 'Invalid Date') ? dayjs(svc.svcUpdatedDT).format("MMM DD, YYYY - h:mma") : dayjs(svc.svcDT).format("MMM DD, YYYY - h:mma")}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>                                    
                                    </Card>
                                </Fragment>
                            ))}
                        </Fragment>
                    </Box>
    )
}