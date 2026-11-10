import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Box, Chip } from '@mui/material';
import { Typography } from '../../System';
import { House } from '@mui/icons-material';
import { calcFamilyCounts } from '../../System/js/Clients/ClientUtils';

HistoryHeader.propTypes = {
    client: PropTypes.object.isRequired, // current client record
    lastServedFoodDate: PropTypes.object,
}

dayjs.extend(customParseFormat)

export default function HistoryHeader(props) {
    const { client, lastServedFoodDate } = props;
    const familyCounts = calcFamilyCounts(client)

    // Attempt to get last food service from client.lastServed which is synced in DB
    // Check both new (svcCat) and old (serviceCategory) property names
    let lastFoodSvc = (client.lastServed || []).find(svc => (svc.svcCat || svc.serviceCategory) === "Food_Pantry");

    let displayDate = lastServedFoodDate;
    if (lastFoodSvc) {
        // Prefer the synced date from client.lastServed if it's available and later
        // Check both new (svcDT) and old (serviceDateTime) property names
        const syncedDate = dayjs(lastFoodSvc.svcDT || lastFoodSvc.serviceDateTime);
        if (!displayDate || syncedDate.isAfter(dayjs(displayDate))) {
            displayDate = syncedDate;
        }
    }

    const lsFoodDate = (displayDate !== null && displayDate !== undefined)
        ? dayjs(displayDate).format("MMM DD, YYYY - h:mm a")
        : "** Never **"


    return (
        <Box sx={{
            width: 1
        }}>
            <Box
                sx={{
                    mb: 1,
                    display: 'flex',
                    flexDirection: 'row',
                    height: '44px',
                    justifyContent: 'center',
                    alignContent: 'center',
                    flexWrap: "wrap"
                }}>
                <Chip icon={<House />} label={client.clientId} color="primary"
                    style={{ width: '118px', fontSize: 'x-large', justifyContent: 'left', marginRight: '12px' }} />
                <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
                    <Typography color='primary' variant='h6' noWrap>
                        <b>{client.givenName} {client.familyName}</b>
                    </Typography>
                    <Typography color='primary' variant='subtitle2' noWrap>
                        &nbsp;&nbsp;(Fam: {familyCounts.totalSize}, Kids: {familyCounts.totalChildren})
                    </Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-around",
                    alignItems: "center",
                    mx: { xs: 0, sm: 2 },
                    py: 0.5,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '12px',
                    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05), 0 1px 3px rgba(16, 24, 40, 0.08)',
                }}>
                <Box sx={{ px: 2.5, py: 1 }}>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>Created</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{dayjs(client.createdDateTime).format("MMM DD, YYYY - h:mm a")}</Typography>
                </Box>
                <Box sx={{ px: 2.5, py: 1 }}>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>Updated</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{dayjs(client.updatedDateTime).format("MMM DD, YYYY - h:mm a")}</Typography>
                </Box>
                <Box sx={{ px: 2.5, py: 1 }}>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>First Seen</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{dayjs(client.firstSeenDate).format("MMM DD, YYYY - h:mm a")}</Typography>
                </Box>
                <Box sx={{ px: 2.5, py: 1 }}>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>Last Served</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{lsFoodDate}</Typography>
                </Box>
                <Box sx={{ px: 2.5, py: 1 }}>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>Last ID Check</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{dayjs(client.familyIdCheckedDate).format("MMM DD, YYYY")}</Typography>
                </Box>
            </Box>
        </Box>
    );
}