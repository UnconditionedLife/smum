

// Nikhil's Chnages kept after merge
import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { fade, makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

// const useStyles = makeStyles((theme) => ({
//   grow: {
//     flexGrow: 1,
//   },
//   menuButton: {
//     marginRight: theme.spacing(2),
//   },
//   title: {
//     display: 'none',
//     [theme.breakpoints.up('sm')]: {
//       display: 'block'
//     },
//   },
//   clients:{
//     width:'100%',
//     position:'relative',
//     top:'3.5px',
//     fontSize:'15px',
//     right:'90px',

//   },
//   admin:{
//     width:'100%',
//     position:'relative',
//     top:'3.5px',
//     fontSize:'15px',
//     right:'65px',
//   },
//   username:{
//     width:'100%',
//     position:'relative',
//     top:'3.5px',
//     fontSize:'15px',
//     right:'40px',
//     textTransform:'none',
//   },
//   logout:{
//     width:'100%',
//     position:'relative',
//     top:'3px',
//     fontSize:'15px',
//     right:'-30px',
//   },
//   search: {
//     position: 'relative',
//     borderRadius: theme.shape.borderRadius,
//     backgroundColor: fade(theme.palette.common.white, 0.15),
//     '&:hover': {
//       backgroundColor: fade(theme.palette.common.white, 0.25),
//     },
//     marginRight: theme.spacing(2),
//     marginLeft:20,
//     width: '100%',
//     [theme.breakpoints.up('sm')]: {
//       marginLeft: theme.spacing(3),
//       width: 'auto',
//     },
//   },
//   searchIcon: {
//     padding: theme.spacing(0, 2),
//     height: '100%',
//     position: 'absolute',
//     pointerEvents: 'none',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   inputRoot: {
//     color: 'inherit',
//     marginLeft: '10px'
//   },
//   inputInput: {
//     padding: theme.spacing(1, 1, 1, 0),
//     // vertical padding + font size from searchIcon
//     paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
//     transition: theme.transitions.create('width'),
//     width: '100%',
//     [theme.breakpoints.up('md')]: {
//       width: '20ch',
//     },
//   },
//   sectionDesktop: {
//     display: 'none',
//     [theme.breakpoints.up('md')]: {
//       display: 'flex',
//     },
//   },
//   sectionMobile: {
//     display: 'flex',
//     [theme.breakpoints.up('md')]: {
//       display: 'none',
//     },
//   },
// }));
const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
    backgroundColor:theme.palette.primary.dark,
    // position: 'relative',
    
    // backgroundColor: fade(theme.palette.common.white, 0.15),
    // '&:hover': {
    //   backgroundColor: fade(theme.palette.common.white, 0.25),
    // },
    // marginRight: theme.spacing(2),
  },
  cell: {
    
  },
  tablerow: {
    backgroundColor:theme.palette.primary.dark,
  },
  container: {
    backgroundColor:theme.palette.primary.dark,
  }
}));



function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData( 8888, 'Family Home', 'Testing', 'Sep 17, 1973', '123 Street'),
 
];

export default function FoundPage(props) {
  const classes = useStyles();
  const clientData = props.clientData
  // const columns = ["clientId","givenName","familyName","dob","street"]

  if(clientData!=null){
    return (

      <div>
      <TableContainer className={classes.container} component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead className={classes.tablehead}>
            <TableRow className={classes.tablerow}>
              <TableCell>ID #</TableCell>
              <TableCell className={classes.cell} align="center">Given Name</TableCell>
              <TableCell className={classes.cell} align="center">Family Name</TableCell>
              <TableCell className={classes.cell} align="center">DOB</TableCell>
              <TableCell className={classes.cell} align="center">Street Address</TableCell>
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
      </div>
    );
  }
  else {
    return null
  }  
}