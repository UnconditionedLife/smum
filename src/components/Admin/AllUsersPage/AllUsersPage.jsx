import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Fab, Snackbar, Table, TableBody,
     TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@material-ui/core';
import { Add, ExpandMore } from '@material-ui/icons';
import { UserPage } from '..';
import { dbGetAllUsersAsync } from '../../System/js/Database.js';

AllUsersPage.propTypes = {
}

export default function AllUsersPage(props) {
    const [ newUser, setNewUser ] = useState(false);
    const [ users, setUsers ] = useState(null) 

    useEffect(() => { 
        getUserList()
    }, [])

    function getUserList() {
        dbGetAllUsersAsync()
            .then( usersArray => { 
                setUsers( usersArray.sort((a, b) => a.userName.localeCompare(b.userName)))
            })
    }

    function UserList(props) {
        UserList.propTypes = {
            list: PropTypes.array.isRequired,
        }

        const [ editMode, setEditMode ] = useState('none');
        const [ userName, setUserName ] = useState(null);
    
        function handleEditRecord(newUserName){
            setUserName(newUserName)
            setEditMode("edit")   
        }
    
        function clearRecord() {
            getUserList()
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
    
    
    if (users === null) return null

    return (
        <Box mt={ 2 }>
            
            <Snackbar  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={ true }>
                <Tooltip title= 'Add User'>
                    <Fab onClick={()=>setNewUser(true)} size="small" color='default' >
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