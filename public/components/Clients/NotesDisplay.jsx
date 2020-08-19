import React from 'react';
import { isEmpty } from '../js/Utils.js';
import { useEffect, useRef } from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import theme from '../Sections/Theme.jsx';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import NoteIcon from '@material-ui/icons/Note';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import Fab from '@material-ui/core/Fab';


// const useStyles = makeStyles((theme) => ({
//     checkboxDiv: {
//         padding: "12px"
//     },
//     buttonDiv: {
//         paddingTop: "8px"
//     }

// }));

const useStyles = makeStyles({
    root: {
        minWidth: 300,
        maxWidth: 300,
        marginBottom: 8,
    },
    margin: {
        margin: 0,
    },
    padding: {
        paddingTop: 0,
    },
    fabMargin: {
        marginRight: 14,
        marginBottom: 10,
    }
  });

export default function NotesDisplay(props) {
    const notes = props.notes;
    const classes = useStyles();
    const selectedNote = null

    console.log(notes)

    function notesSortImportant(){

    }

    return (
        <ThemeProvider theme={ theme }>
            {notes.map((row) => ( 
                <Card key={row.noteId} className={classes.root} variant="elevation" elevation={4}>
                    <CardContent>
                        {row.isImportant === "true" && <Fab color="secondary" size="small" className={classes.fabMargin} ><NotificationImportantIcon /></Fab> }
                        {row.isImportant === "false" && <Fab size="small" className={classes.fabMargin}><NoteIcon /></Fab> }
                        <Typography variant="caption" color="textSecondary" gutterBottom>
                            {window.moment(row.createdDateTime).fromNow()} by: {row.noteByUserName}
                        </Typography>
                        {row.isImportant === "true" && <Typography variant="subtitle2" color="secondary"> {row.noteText}</Typography> }
                        {row.isImportant === "false" && <Typography variant="subtitle2" > {row.noteText}</Typography> }
                    </CardContent>
                    <CardActions className={classes.padding}>
                        <IconButton className={classes.margin}>
                            <DeleteIcon />
                        </IconButton>
                        <IconButton className={classes.margin}>
                            <EditIcon />
                        </IconButton>
                        {/* <Button size="small">remove</Button> */}
                        {/* <Button size="small">edit</Button> */}
                    </CardActions>
                </Card>
            ))}
        </ThemeProvider>
    )
}