import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Box } from '@mui/system';
import { Typography } from '../../System';
import { useTheme } from '@mui/material/styles';

HistoryHeader.propTypes = {
    client: PropTypes.object.isRequired, // current client record
    lastServedFoodDate: PropTypes.object,
}

dayjs.extend(customParseFormat)

export default function HistoryHeader(props) {
    
    const { client, lastServedFoodDate } = props;
    const lsFoodDate = (lastServedFoodDate !== null) 
        ? dayjs(lastServedFoodDate).format("MMM DD, YYYY - h:mm a") 
        : "** Never **"
    const theme = useTheme()
    const greenBorder = { borderColor: theme.palette.primary.light, borderWidth: "3px", borderStyle: "solid" }

    return (
        <Box display="flex" flexWrap="wrap" justifyContent="center"
            alignItems="center" style={greenBorder}>
                <Box px={2} py={0.5}><Typography><strong>Created:</strong> { dayjs(client.createdDateTime).format("MMM DD, YYYY - h:mm a") }</Typography></Box>
                <Box px={2} py={0.5}><Typography><strong>Updated:</strong> { dayjs(client.updatedDateTime).format("MMM DD, YYYY - h:mm a") }</Typography></Box>
                <Box px={2} py={0.5}><Typography><strong>First Seen:</strong> { dayjs(client.firstSeenDate).format("MMM DD, YYYY - h:mm a") }</Typography></Box>
                <Box px={2} py={0.5}><Typography><strong>Last Served:</strong> { lsFoodDate }</Typography></Box>
                <Box px={2} py={0.5}><Typography><strong>Last ID Check:</strong> { dayjs(client.familyIdCheckedDate).format("MMM DD, YYYY") }</Typography></Box>

        </Box>
   )
}