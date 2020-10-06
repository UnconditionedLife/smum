import React, { useEffect, useState, Fragment } from 'react';
import { Box, Checkbox, FormControlLabel } from '@material-ui/core';
import { NotificationImportant } from '@material-ui/icons';
import { Button, TextField } from '../../System';
import { isEmpty } from '../../System/js/Utils.js';

export default function NoteForm(props) {
    const client = props.client;
    const handleClientChange = props.handleClientChange;
    const handleNoteCountChange = props.handleNoteCountChange;
    const editMode = props.editMode;
    const handleEditModeChange = props.handleEditModeChange;
    const editNote = props.editNote;
    const noteText = props.noteText;
    const handleTextFieldChange = props.handleTextFieldChange;
    const noteImportant = props.noteImportant
    const handleNoteImportantChange = props.handleNoteImportantChange
    const [ stopEffect, setStopEffect ] = useState(false)
    
    const textLabel = isEmpty(editNote) ? "Add Note" : "Edit Note";

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
        <Fragment>
            <TextField width={ 1 } label={ textLabel } multiline rows={ 2 } variant="outlined" value= { noteText }
                onChange={ event => { handleTextFieldChange(event.target.value) }} />
            <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center" alignItems="center">
                <Box ml= { 4 } mr= { -2 } >
                    <NotificationImportant color="secondary"
                        onClick={ event => { handleNoteImportantChange(event.target.value) }} />
                </Box>
                <FormControlLabel
                    control={ 
                        <Checkbox checked={ noteImportant }
                        onChange={ event => { handleNoteImportantChange(event.target.checked) }} /> }
                    label="Important" />
            </Box>
            <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
                <Button variant="contained" color="primary"
                    onClick={ event => { handleNoteSave(event.target.value) }}>Save</Button>
                <Button variant="outlined" color="secondary"
                    onClick={ event => { handleNoteCancel(event.target.value) }}>Cancel</Button>
            </Box>
        </Fragment>
    )
};