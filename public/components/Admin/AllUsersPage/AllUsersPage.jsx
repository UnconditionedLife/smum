import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Fab, Table, TableBody,
     TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@material-ui/core';
import { Add, ExpandMore } from '@material-ui/icons';
import { dbGetAllUsers } from '../../System/js/Database.js';
import { UserPage } from '../../Admin';

UserList.propTypes = {
    list: PropTypes.array.isRequired,
    session: PropTypes.object.isRequired,
}

function UserList(props) {
    const [ editMode, setEditMode ] = useState('none');
    const [ userName, setUserName ] = useState(null);

    function handleEditRecord(newUserName){
        setUserName(newUserName)
        setEditMode("edit")   
    }

    function clearRecord() {
        setEditMode('none')
        setUserName(null)
    }


    return (
        <Box width='100%' mx={ 2 }>
            <TableContainer> 
                <Table>
                <TableHead>
                    <TableRow>
                    <TableCell align="center">Username</TableCell>
                    <TableCell align="center">Given Name</TableCell>
                    <TableCell align="center">Family Name</TableCell>
                    <TableCell align="center">User Role</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.list.map((row) => (
                    <TableRow 
                        key={ row.userName }
                        onClick={ () => handleEditRecord(row.userName) }
                        selected={ row.userName == userName }
                    >
                        <TableCell component="th" scope="row">{row.userName}</TableCell>
                        <TableCell align="center">{row.givenName}</TableCell>
                        <TableCell align="center">{row.familyName}</TableCell>
                        <TableCell align="center">{row.userRole}</TableCell>
                    </TableRow>
                    ))}
                    { editMode === 'edit' &&
                        <UserPage clearRecord={ clearRecord } 
                          session={ props.session }  userName={ userName } />
                    }
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

AllUsersPage.propTypes = {
    session: PropTypes.object.isRequired,
}

export default function AllUsersPage(props) {
    const users = dbGetAllUsers(props.session).sort((a, b) => a.userName.localeCompare(b.userName));
    const [ newUser, setNewUser ] = useState(false);

    return (
        <Box mt={ 7 }>
            <Tooltip title= 'Add User'>
                <Fab onClick={()=>setNewUser(true)} size="small" color='default' >
                    <Add />
                </Fab>
            </Tooltip>
            { newUser &&
                <UserPage clearRecord={ ()=>setNewUser(false) } 
                    session={ props.session }  userName={ null } />
            }
            <Accordion defaultExpanded={ true }>
                <AccordionSummary expandIcon={ <ExpandMore /> }>
                    <Typography variant='button' >Active Users</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <UserList 
                        list={ users.filter(u => u.isActive == 'Active') }
                        session={ props.session }
                    />
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={ <ExpandMore /> }>
                    <Typography variant='button' >Inactive Users</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <UserList 
                        list={ users.filter(u => u.isActive != 'Active') } 
                        session={ props.session }
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}