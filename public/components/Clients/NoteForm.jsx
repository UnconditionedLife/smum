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
        width: 300,
        marginBottom: 8,
    },
    button: {
      marginLeft: 30,
      marginTop: -5,
      marginRight: 0,
      minWidth: 95,
    },
    textField: {
        width: 270,
        marginTop: 5,
    },
    importantIcon: {
        marginTop: 10,
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
        marginTop: -10,
    },
    paper: {
        marginBottom: 8,
        padding: 8,
    }
  });

export default function NoteEdit(props) {
    const client = props.client;
    const handleClientChange = props.handleClientChange;
    const noteCount = props.noteCount
    const handleNoteCountChange = props.handleNoteCountChange;
    const handleEditNoteChange = props.handleEditNoteChange;
    const editMode = props.editMode;
    const handleEditModeChange = props.handleEditModeChange;
    const editNote = props.editNote;
    const handleNotesChange = props.handleNotesChange;
    const noteText = props.noteText;
    const handleTextFieldChange = props.handleTextFieldChange;
    const noteImportant = props.noteImportant
    const handleNoteImportantChange = props.handleNoteImportantChange
    const [ stopEffect, setStopEffect ] = useState(false)
    const classes = useStyles();
    
    const textLable = isEmpty(editNote) ? "Add Note" : "Edit Note";

    useEffect(() => {
        if (!isEmpty(editNote) && !stopEffect) {
            handleTextFieldChange(editNote.noteText)
            let important = false
            if (editNote.isImportant === "true") important = true
            handleNoteImportantChange(important)
            setStopEffect(true)
        }
    });

    function handleNoteSave(){
        let important = "false"
        let tempClient = client 
        let tempNotes = client.notes
        let newNote = {}
        if (noteImportant) important = "true"
        if (isEmpty(editNote)) {
            const noteId = window.cuid()
            newNote.createdDateTime = window.moment().format(dateTime);
            newNote.updatedDateTime = window.moment().format(dateTime);
            newNote.isImportant = important;
            newNote.noteByUserName = "jleal67";
            newNote.noteId = noteId;
            newNote.noteText = noteText;

            tempNotes.unshift(newNote)
        } else {
            newNote.createdDateTime = editNote.createdDateTime;
            newNote.updatedDateTime = window.moment().format(dateTime);
            newNote.isImportant = important;
            newNote.noteByUserName = "jleal67";
            newNote.noteId = editNote.noteId;
            newNote.noteText = noteText;

            const index = tempNotes.map(function(e) { return e.noteId; }).indexOf(newNote.noteId);
            tempNotes[index] = newNote
        }
        tempClient.notes = tempNotes
        handleClientChange(tempClient)
        handleNoteCountChange(tempClient.notes.length)
        handleNoteCancel()
        const result = window.dbSaveCurrentClient(client)
        if (result !== "success") {
            alert("Client did not save properly");
        }
    };

    function handleNoteCancel(){
        if (editMode !== 'none') {
            handleTextFieldChange('')
            handleNoteImportantChange(false)
            handleEditModeChange('none')
        }
    };

    return (
        // <Paper variant="outlined" className={ classes.paper}>
        <div>
            <div>
                <TextField label={ textLable } multiline rows={2} variant="outlined" value= { noteText }
                    className={ classes.textField} onChange={ event => { handleTextFieldChange(event.target.value) }}
                />
            </div>
            <div className={ classes.flexbox }>
                <div className={ classes.importantIcon }>
                    <NotificationImportantIcon color="secondary"
                        onClick={ event => { handleNoteImportantChange(event.target.value) }}/>
                </div>
                <div className={ classes.checkbox }>
                    <FormControlLabel
                        control={ 
                        <Checkbox checked={ noteImportant }
                        onChange={ event => { handleNoteImportantChange(event.target.checked) }} /> }
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
        </div>
    )
};