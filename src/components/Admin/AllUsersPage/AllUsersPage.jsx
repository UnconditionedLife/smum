import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Fab, Snackbar, Table, TableBody,
     TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { Add, ExpandMore } from '@mui/icons-material';
import { UserPage } from '..';
import { dbGetAllUsersAsync, navigationAllowed } from '../../System/js/Database';

AllUsersPage.propTypes = {
}

function UserList(props) {
    UserList.propTypes = {
        list: PropTypes.array.isRequired,
    }

    const [ editMode, setEditMode ] = useState('xxx');
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
                        <UserPage clearRecord={ clearRecord } userName={ userName }  />
                    }
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default function AllUsersPage(props) {
    const [ newUser, setNewUser ] = useState(false);
    const [ users, setUsers ] = useState(null);

    useEffect(() => { 
        getUserList() //initial load
    }, [newUser])

    function getUserList() {
        dbGetAllUsersAsync()
            .then( usersArray => { 
                setUsers( usersArray.sort((a, b) => a.userName.localeCompare(b.userName)))
            })
    }
    
    if (users === null) return null

    return (
        <Box mt={ 2 } mb={ 2 }>
            
            <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={ true }>
                <Tooltip title= 'Add User'>
                    <Fab onClick={()=>{
                        if (navigationAllowed()) {
                            setNewUser(true)
                        }
                    }} size="small" color='default' >
                        <Add />
                    </Fab>
                </Tooltip>
            </Snackbar>

            { newUser &&
                <UserPage clearRecord={ ()=>setNewUser(false) } userName={ null } />
            }

            <Accordion defaultExpanded={ true }>
                <AccordionSummary expandIcon={ <ExpandMore /> }>
                    <Typography variant='button' >Active Users</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <UserList 
                        list={ users.filter(u => u.isActive == 'Active') }
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
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}