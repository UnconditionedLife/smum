import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Table, TableBody,
     TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { dbGetAllUsers } from '../System/js/database.js';


function UserList(props) {
    return (
        <Box>
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
                        onClick={ (event) => props.onSelect(row.userName) }
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

UserList.propTypes = {
    list: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
}

export default function AllUsersPage(props) {
    const users = dbGetAllUsers(props.session).sort((a, b) => a.userName.localeCompare(b.userName));

    return (
        <Box mt={ 7 }>
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

AllUsersPage.propTypes = {
    session: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
}
