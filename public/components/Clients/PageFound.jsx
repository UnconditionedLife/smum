import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { createMuiTheme, fade, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { green, deepOrange } from '@material-ui/core/colors';
import { isEmpty } from '../js/Utils.js';

const smumTheme = createMuiTheme({
    palette: {
        primary: { main: green[600] },
        secondary: { main: deepOrange[900] },
    }
});

// const useStyles = makeStyles((theme) => ({
//   table: {
//     minWidth: 650,
//     backgroundColor:theme.palette.primary.dark,
//   },
//   cell: {
    
//   },
//   tablerow: {
//     backgroundColor:theme.palette.primary.dark,
//   },
//   container: {
//     backgroundColor:theme.palette.primary.dark,
//   }
// }));

export default function FoundPage(props) {
//   const classes = useStyles();
  const clientData = props.clientData

  if(!isEmpty(clientData)){
    return (
        <div>
            <ThemeProvider theme={ smumTheme }>
                <TableContainer > 
                    <Table >
                    <TableHead>
                        <TableRow >
                        <TableCell>ID #</TableCell>
                        <TableCell align="center">Given Name</TableCell>
                        <TableCell align="center">Family Name</TableCell>
                        <TableCell align="center">DOB</TableCell>
                        <TableCell align="center">Street Address</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clientData.map((row) => (
                        <TableRow key={row.clientId}>
                            <TableCell component="th" scope="row">{row.clientId}</TableCell>
                            <TableCell align="center">{row.givenName}</TableCell>
                            <TableCell align="center">{row.familyName}</TableCell>
                            <TableCell align="center">{row.dob}</TableCell>
                            <TableCell align="center">{row.street}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
            </ThemeProvider>
        </div>
    );
  } else {
    return null
  }  
};