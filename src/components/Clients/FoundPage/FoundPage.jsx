import React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { Box, CardContent, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { isEmpty, isMobile } from '../../System/js/GlobalUtils.js';
import dayjs from 'dayjs'
import { useState } from 'react';
import { useEffect } from 'react';
import { Card } from '../../System/index.js';

FoundPage.propTypes = {
    clientsFound: PropTypes.array.isRequired,
    client: PropTypes.object.isRequired, changeClient: PropTypes.func.isRequired,
    updateClientsURL: PropTypes.func.isRequired
}

export default function FoundPage(props) {
    const { clientsFound, client, updateClientsURL, changeClient } = props
    let clientId = isEmpty(client) ? null : client.clientId
    const [width, setWidth] = useState(window.innerWidth);

    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    const displayMobile = isMobile(width);

    function handleSelectedClient(event, newClientId) {
        if (clientId !== newClientId) {
            const newClient = clientsFound.filter(obj => obj.clientId == newClientId)
            changeClient(newClient[0], 1)
        }
    }
    const validRow = { color: 'text.primary', cursor: 'pointer' }
    const invalidRow = { color: 'secondary.main', cursor: 'pointer' }

    return (
        <Box sx={{
            mt: 3,
            px: { xs: 0, sm: 2 },
            mx: 'auto',
            maxWidth: 1500,
        }}>
            <TableContainer sx={ displayMobile ? {} : {
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
            }}> 
                {!displayMobile ?
                    <Table >
                    <TableHead>
                        <TableRow>
                        <TableCell>ID #</TableCell>
                        <TableCell align="center">Given Name</TableCell>
                        <TableCell align="center">Family Name</TableCell>
                        <TableCell align="center">DOB</TableCell>
                        <TableCell align="center">Street Address</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { clientsFound.map((row) => (
                            <TableRow 
                                key={row.clientId} 
                                onClick= { (event) => handleSelectedClient(event, row.clientId)}
                                selected= { row.clientId == clientId }
                                >
                                <TableCell sx={row.isActive == "Inactive" ?  invalidRow : validRow} component="th" scope="row">{row.clientId}</TableCell>
                                <TableCell sx={row.isActive == "Inactive" ?  invalidRow : validRow} align="center">{row.givenName}</TableCell>
                                <TableCell sx={row.isActive == "Inactive" ?  invalidRow : validRow} align="center">{row.familyName}</TableCell>
                                <TableCell sx={row.isActive == "Inactive" ?  invalidRow : validRow} align="center">{dayjs(row.dob).format("MMM DD, YYYY")}</TableCell>
                                <TableCell sx={row.isActive == "Inactive" ?  invalidRow : validRow} align="center">{row.street}</TableCell>
                            </TableRow>
                            ))}
                    </TableBody> 
                    </Table> :
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                        { clientsFound.map((row) => (
                                <Card 
                                    key={ row.clientId }
                                    width={320}
                                    onClick= { (event) => handleSelectedClient(event, row.clientId)}
                                    selected= { row.clientId == clientId } 
                                    sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) }}
                                >
                                <CardHeader 
                                    title={row.givenName + " " + row.familyName} 
                                    sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18) }}>
                                </CardHeader>
                                <CardContent sx={row.isActive == "Inactive" ?  invalidRow : validRow}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: row
                                        }}>
                                        <Box>
                                            <Typography sx={{
                                                fontSize: '90%'
                                            }}>
                                                <strong>ID</strong> <br />
                                                <strong>DOB</strong> <br />
                                                <strong>Street</strong>
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            ml: 2
                                        }}>
                                            <Typography sx={{
                                                fontSize: '90%'
                                            }}>
                                                {row.clientId} <br />
                                                {dayjs(row.dob).format("MMM DD, YYYY")} <br />
                                                {row.street}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>  
                                </Card>                                  
                            ))}
                    </Box>
                }
            </TableContainer>
        </Box>
    );

}