import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Box, Chip } from '@mui/material';
import { Typography } from '../../System';
import { useTheme } from '@mui/material/styles';
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

    const theme = useTheme()
    const greenBorder = { borderColor: theme.palette.primary.light, borderWidth: "3px", borderStyle: "solid" }

    return (
        <Box width={1}>
            <Box mb={1} display='flex' flexDirection='row' height='44px' justifyContent='center' alignContent='center' flexWrap="wrap">
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
            <Box display="flex" flexWrap="wrap" justifyContent="center"
                alignItems="center" style={greenBorder}>
                <Box px={2} py={0.5}><Typography><strong>Created:</strong> {dayjs(client.createdDateTime).format("MMM DD, YYYY - h:mm a")}</Typography></Box>
                <Box px={2} py={0.5}><Typography><strong>Updated:</strong> {dayjs(client.updatedDateTime).format("MMM DD, YYYY - h:mm a")}</Typography></Box>
                <Box px={2} py={0.5}><Typography><strong>First Seen:</strong> {dayjs(client.firstSeenDate).format("MMM DD, YYYY - h:mm a")}</Typography></Box>
                <Box px={2} py={0.5}><Typography><strong>Last Served:</strong> {lsFoodDate}</Typography></Box>
                <Box px={2} py={0.5}><Typography><strong>Last ID Check:</strong> {dayjs(client.familyIdCheckedDate).format("MMM DD, YYYY")}</Typography></Box>

            </Box>
        </Box>
    )
}