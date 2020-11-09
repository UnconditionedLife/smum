import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Fab, Table, TableBody,
     TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@material-ui/core';
import { Add, ExpandMore } from '@material-ui/icons';
import { dbGetAllUsers } from '../../System/js/database.js';

UserList.propTypes = {
    list: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
}

function UserList(props) {
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
                        onClick={ () => props.onSelect(row.userName) }
                    >
                        <TableCell component="th" scope="row">{row.userName}</TableCell>
                        <TableCell align="center">{row.givenName}</TableCell>
                        <TableCell align="center">{row.familyName}</TableCell>
                        <TableCell align="center">{row.userRole}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

AllUsersPage.propTypes = {
    session: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
}

export default function AllUsersPage(props) {
    const users = dbGetAllUsers(props.session).sort((a, b) => a.userName.localeCompare(b.userName));

    return (
        <Box mt={ 7 }>
            <Tooltip title= 'Add User'>
                <Fab onClick={() => props.onSelect('')}  size="small" color='default' >
                    <Add />
                </Fab>
            </Tooltip>
            <Accordion defaultExpanded='true'>
                <AccordionSummary expandIcon={ <ExpandMore /> }>
                    <Typography variant='button' >Active Users</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <UserList 
                        list={ users.filter(u => u.isActive == 'Active') }
                        onSelect= { props.onSelect }
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
                        onSelect= { props.onSelect }
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}