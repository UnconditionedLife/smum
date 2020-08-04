import React, { useState, useEffect, useRef } from 'react';

export default function FoundPage(props) {
    const clientData = props.clientData
    const counter = props.counter
    const columns = ["clientId","givenName","familyName","dob","street"]

    const DidMount = props => {
        const didMountRef = useRef(false)
        
        console.log("MOUNT")
        useEffect(() => {
            console.log("EFFECT")
            if (clientData !== null) {
                if (didMountRef.current) {
                    const columns = ["clientId","givenName","familyName","dob","street"]
                    window.uiGenSelectHTMLTable("FoundClientsContainer", clientData, columns,'clientTable')
                } else didMountRef.current = true
            }
        })
    };

    // I TRIED THIS AS WELL AND IT DID NOT WORK EITHER
    // useEffect(() => {
    //     return () => {
    //         console.log("EFFECT")
    //         console.log(clientData)
    //         if (clientData !== null) {
    //             console.log("IN SHOW TABLE")
    //             const columns = ["clientId","givenName","familyName","dob","street"]
    //             window.uiGenSelectHTMLTable("FoundClientsContainer", clientData, columns,'clientTable')
    //         }
    //     }
    // })

    DidMount()
    
    return (
        <div>
            <div><br/><br/></div>
    <div>FOUND PAGE { counter} </div>
                <div id ="FoundClientsContainer"></div>
            <div><br/><br/></div>
        </div>
    );
};

// Nikhil's Chnages kept after merge
// import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';
// import Paper from '@material-ui/core/Paper';

// const useStyles = makeStyles({
//   table: {
//     minWidth: 650,
//   },
// });

// function createData(name, calories, fat, carbs, protein) {
//   return { name, calories, fat, carbs, protein };
// }

// const rows = [
//   createData( 8888, 'Family Home', 'Testing', 'Sep 17, 1973', '123 Street'),
 
// ];

// export default function FoundPage() {
//   const classes = useStyles();

//   return (
//     <div>
//     <div>
//         <div><br/><br/></div>
//         <div>FOUND PAGE</div>

//         <div id = "FoundClientsContainer"></div>
//         <div><br/><br/></div>
//     </div>

//     <div>
//     <TableContainer component={Paper}>
//       <Table className={classes.table} aria-label="simple table">
//         <TableHead>
//           <TableRow>
//             <TableCell>ID #</TableCell>
//             <TableCell align="center">Given Name</TableCell>
//             <TableCell align="center">Family Name</TableCell>
//             <TableCell align="center">DOB</TableCell>
//             <TableCell align="center">Street Address</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {rows.map((row) => (
//             <TableRow key={row.name}>
//               <TableCell component="th" scope="row">
//                 {row.name}
//               </TableCell>
//               <TableCell align="center">{row.calories}</TableCell>
//               <TableCell align="center">{row.fat}</TableCell>
//               <TableCell align="center">{row.carbs}</TableCell>
//               <TableCell align="center">{row.protein}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//     </div>
//     </div>

//   );
// }