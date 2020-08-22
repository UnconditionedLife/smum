import React from 'react';
import { isEmpty } from '../js/Utils.js';
import { useEffect, useRef, useState } from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import theme from '../Sections/Theme.jsx';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
    root: {
        minWidth: 280,
        maxWidth: 280,
        marginBottom: 5,
    },
    button: {
      marginLeft: 30,
      marginRight: 0,
      marginBottom: 20,
      minWidth: 95,
    },
    textField: {
        minWidth: 280,
        maxWidth: 280,
        marginTop: 10,
    },
    importantIcon: {
        marginTop: 20,
        marginRight: -10,
        marginLeft: 70,
        maxWidth: 30,
    },
    flexbox: {
        display: 'flex',
        minWidth: 280,
        maxWidth: 280,
        alignContent: 'center',
    }, 
    checkbox: {
        marginTop: 0,
    },
    paper: {
        marginBottom: 8,
        padding: 8,
    }
  });

export default function NoteEdit(props) {
    const notes = props.notes;
    const isEditNote = props.isEditNote;
    const handleIsEditNoteChange = props.handleIsEditNoteChange;
    const handleNotesChange = props.handleNotesChange;
    const [ noteText, setNoteText ] = useState('')
    const [ noteImportant, setNoteImportant ] = useState(false)
    const classes = useStyles();


    console.log("NOTE EDIT")

    function handleTextFieldChange(value){
        console.log(value)
    }

    function handleCheckboxChange(checked){
        console.log(event)
        if (noteImportant !== checked) {
            setNoteImportant(checked)
        }
    };

    function handleNoteSave(){
        console.log("Save")
    }

    function handleNoteCancel(){
        if (isEditNote) {
            handleTextFieldChange(0,'')
            // handleCheckboxChange(0, false)
            handleIsEditNoteChange(false)
        }
    };


    return (
        <Paper variant="outlined" className={ classes.paper}>
            <div>
                <TextField label="New Note" multiline rows={4} variant="outlined" 
                    className={ classes.textField} onChange={ event => { handleTextFieldChange(event.target.value) }}>
                    { noteText }
                </TextField>
            </div>
            <div className={ classes.flexbox }>
                <div className={ classes.importantIcon }>
                    <NotificationImportantIcon color="secondary"
                        onClick={ event => { handleCheckboxChange(event.target.value) }}/>
                </div>
                <div className={ classes.checkbox }>
                    <FormControlLabel
                         control={ 
                         <Checkbox checked={ noteImportant }
                        onChange={ event => { handleCheckboxChange(event.target.checked) }} /> }
                        label="Important" 
                    />
                </div>
            </div>
            <div className={ classes.flexbox }>
                <Button variant="contained" color="primary" className={ classes.button } 
                    onClick={ event => { handleNoteSave(event.target.value) }}>Save</Button>
                <Button variant="outlined" color="secondary" className={ classes.button } 
                    onClick={ event => { handleNoteCancel(event.target.value) }}>Cancel</Button>
            </div>
        </Paper>
    )
};