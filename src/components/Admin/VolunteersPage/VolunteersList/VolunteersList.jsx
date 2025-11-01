import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Fab, Snackbar, Table, TableBody,
     TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, Chip } from '@mui/material';
import { Add, ExpandMore } from '@mui/icons-material';
import VolunteerPage from '../VolunteerPage/VolunteerPage.jsx';
import { navigationAllowed, dbGetAllVolunteersAsync, dbGetAllProgramsAsync } from '../../../System/js/Database';
import { formatPhone } from '../../../System/js/Forms';
import dayjs from 'dayjs';

function VolunteerList(props) {

    function getProgramName(programId) {
        if (!programId || programId === '-') return 'N/A';
        const program = props.programs.find(prog => {
            // Check various possible ID field names
            const progId = prog.ProgramId || prog.programId || prog.Id || prog.id || prog.ID;
            return progId === programId || progId == programId;
        });
        if (program) {
            return program.ProgramName || program.Name || program.name || 'N/A';
        }
        return 'N/A';
    }

    return (
        <Box width='100%' mx={ 2 }>
            <TableContainer> 
                <Table>
                <TableHead>
                    <TableRow>
                    <TableCell align="center">First Name</TableCell>
                    <TableCell align="center">Last Name</TableCell>
                    <TableCell align="center">Email</TableCell>
                    <TableCell align="center">Telephone</TableCell>
                    <TableCell align="center">Program</TableCell>
                    <TableCell align="center">Registered</TableCell>
                    <TableCell align="center">Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.list.map((row) => (
                    <TableRow 
                        key={ row.VolunteerId || row.volunteerId }
                        onClick={() => props.onEdit && props.onEdit(row.VolunteerId || row.volunteerId)}
                        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                    >
                        <TableCell align="center">{row.FirstName || row.firstName || ''}</TableCell>
                        <TableCell align="center">{row.LastName || row.lastName || ''}</TableCell>
                        <TableCell align="center">{row.Email || row.email || ''}</TableCell>
                        <TableCell align="center">{formatPhone(row.Telephone || row.telephone || '')}</TableCell>
                        <TableCell align="center">{getProgramName(row.ProgramId || row.programId)}</TableCell>
                        <TableCell align="center">
                            {row.Time ? dayjs(row.Time).format('MMM D, YYYY h:mm A') : 'N/A'}
                        </TableCell>
                        <TableCell align="center">
                            {row.RegComplete !== undefined && (
                                row.RegComplete ? (
                                    <Chip label="Registered" size="small" color="success" />
                                ) : (
                                    <Chip label="Not Registered" size="small" color="warning" />
                                )
                            )}
                        </TableCell>
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
    programs: PropTypes.array.isRequired,
    onEdit: PropTypes.func,
}

export default function VolunteersList() {
    const [ newVolunteer, setNewVolunteer ] = useState(false);
    const [ editVolunteerId, setEditVolunteerId ] = useState(null);
    const [ volunteers, setVolunteers ] = useState([]);
    const [ programs, setPrograms ] = useState([]);

    useEffect(() => { 
        getVolunteerList() //initial load
        getProgramsList() //load programs for decoding
    }, [newVolunteer])

    function getVolunteerList() {
        dbGetAllVolunteersAsync().then(volunteers => {
            console.log('Fetched volunteers:', volunteers);
            setVolunteers(
                (volunteers || [])
                    .filter(v => v && typeof v === 'object')
                    .sort((a, b) => {
                        const lastA = a.LastName || a.lastName || '';
                        const lastB = b.LastName || b.lastName || '';
                        const firstA = a.FirstName || a.firstName || '';
                        const firstB = b.FirstName || b.firstName || '';
                        // Sort by last name, then first name
                        const lastCompare = lastA.localeCompare(lastB);
                        return lastCompare !== 0 ? lastCompare : firstA.localeCompare(firstB);
                    })
            );
        });
    }
    
    function getProgramsList() {
        dbGetAllProgramsAsync().then(progs => {
            console.log('Fetched programs:', progs);
            setPrograms(progs || []);
        }).catch(err => {
            console.error('Error loading programs:', err);
            setPrograms([]);
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

            { editVolunteerId &&
                <VolunteerPage clearRecord={ ()=>{ setEditVolunteerId(null); getVolunteerList(); } } volunteerId={ editVolunteerId } />
            }

            <Typography variant='h6' sx={{ mb: 2 }}>Volunteers</Typography>
            <VolunteerList
                list={ volunteers }
                programs={ programs }
                onEdit={ (volunteerId) => {
                    if (navigationAllowed()) {
                        setEditVolunteerId(volunteerId);
                    }
                }}
            />
        </Box>
    );
} 