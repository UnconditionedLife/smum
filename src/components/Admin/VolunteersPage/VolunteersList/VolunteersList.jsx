import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Fab, Snackbar, Table, TableBody,
     TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { Add, ExpandMore } from '@mui/icons-material';
import VolunteerPage from '../VolunteerPage/VolunteerPage.jsx';
import { navigationAllowed, dbGetAllVolunteersAsync } from '../../../System/js/Database';

function VolunteerList(props) {

    return (
        <Box width='100%' mx={ 2 }>
            <TableContainer> 
                <Table>
                <TableHead>
                    <TableRow>
                    <TableCell align="center">Full Name</TableCell>
                    <TableCell align="center">Email</TableCell>
                    <TableCell align="center">Telephone</TableCell>
                    <TableCell align="center">Program ID</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.list.map((row) => (
                    <TableRow 
                        key={ row.VolunteerId || row.volunteerId }
                    >
                        <TableCell align="center">{row.FullName || row.fullName || ''}</TableCell>
                        <TableCell align="center">{row.Email || row.email || ''}</TableCell>
                        <TableCell align="center">{row.Telephone || row.telephone || ''}</TableCell>
                        <TableCell align="center">{row.ProgramId || row.programId || ''}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

VolunteerList.propTypes = {
    list: PropTypes.array.isRequired,
}

export default function VolunteersList() {
    const [ newVolunteer, setNewVolunteer ] = useState(false);
    const [ volunteers, setVolunteers ] = useState([]);

    useEffect(() => { 
        getVolunteerList() //initial load
    }, [newVolunteer])

    function getVolunteerList() {
        dbGetAllVolunteersAsync().then(volunteers => {
            console.log('Fetched volunteers:', volunteers);
            setVolunteers(
                (volunteers || [])
                    .filter(v => v && typeof v === 'object')
                    .sort((a, b) => {
                        const nameA = a.FullName || a.fullName || '';
                        const nameB = b.FullName || b.fullName || '';
                        return nameA.localeCompare(nameB);
                    })
            );
        });
    }
    
    return (
        <Box mt={ 2 } mb={ 2 }>
            
            <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={ true }>
                <Tooltip title= 'Add Volunteer'>
                    <Fab onClick={()=>{
                        if (navigationAllowed()) {
                            setNewVolunteer(true)
                        }
                    }} size="small" color='default' >
                        <Add />
                    </Fab>
                </Tooltip>
            </Snackbar>

            { newVolunteer &&
                <VolunteerPage clearRecord={ ()=>{ setNewVolunteer(false); getVolunteerList(); } } volunteerId={ null } />
            }

            <Typography variant='h6' sx={{ mb: 2 }}>Volunteers</Typography>
            <VolunteerList 
                list={ volunteers }
            />
        </Box>
    );
} 