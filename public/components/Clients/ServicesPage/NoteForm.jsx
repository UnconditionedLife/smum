import React, { useEffect, useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Box, Checkbox, FormControlLabel } from '@material-ui/core';
import { NotificationImportant } from '@material-ui/icons';
import { Button, TextField } from '../../System';
import { isEmpty, utilNow } from '../../System/js/GlobalUtils.js';
import { dbSaveClientAsync, getSession } from '../../System/js/Database.js';
import cuid from 'cuid';

NoteForm.propTypes = {
    client: PropTypes.object.isRequired, updateClient: PropTypes.func.isRequired,
    handleNoteCountChange: PropTypes.func.isRequired,
    editMode: PropTypes.string.isRequired,
    handleEditModeChange: PropTypes.func.isRequired,
    editNote: PropTypes.object.isRequired,
    noteText: PropTypes.string.isRequired,
    handleTextFieldChange: PropTypes.func.isRequired,
    noteImportant: PropTypes.bool.isRequired,
    handleNoteImportantChange: PropTypes.func.isRequired,
    showAlert: PropTypes.func.isRequired,
}

export default function NoteForm(props) {
    const client = props.client;
    const updateClient = props.updateClient;
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
    const userName = getSession().user.userName;

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
            const noteId = cuid()
            newNote.createdDateTime = utilNow() // moment().format(dateTime);
            newNote.updatedDateTime = utilNow() // moment().format(dateTime);
            newNote.isImportant = important;
            newNote.noteByUserName = userName;
            newNote.noteId = noteId;
            newNote.noteText = noteText;

            tempNotes.unshift(newNote)
        } else {
            newNote.createdDateTime = editNote.createdDateTime;
            newNote.updatedDateTime = utilNow()
            newNote.isImportant = important;
            newNote.noteByUserName = userName;
            newNote.noteId = editNote.noteId;
            newNote.noteText = noteText;

            const index = tempNotes.map(function(e) { return e.noteId; }).indexOf(newNote.noteId);
            tempNotes[index] = newNote
        }
        tempClient.notes = tempNotes
        updateClient(tempClient)
        handleNoteCountChange(tempClient.notes.length)
        handleNoteCancel()
        dbSaveClientAsync(client)
            .then( () => {
                props.showAlert('success', 'Note successfully added.');
            })
            .catch( message => {
                props.showAlert('error', message);
            });
    }

    function handleNoteCancel(){
        if (editMode !== 'none') {
            handleTextFieldChange('')
            handleNoteImportantChange(false)
            handleEditModeChange('none')
        }
    }

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
}