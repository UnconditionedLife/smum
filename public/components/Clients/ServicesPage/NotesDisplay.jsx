import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Delete, Edit, NotificationImportant } from '@material-ui/icons';
import { Box, CardContent, Fab, Fade, Tooltip, Typography } from '@material-ui/core';
import { Card, IconButton } from '../../System';
import { NoteForm } from '../../Clients';
import { dbSaveClientAsync, getSession } from '../../System/js/Database.js';
import moment from 'moment';

NotesDisplay.propTypes = {
    client: PropTypes.object.isRequired, 
    updateClient: PropTypes.func.isRequired,
    handleNoteCountChange: PropTypes.func.isRequired,
    showAlert: PropTypes.func.isRequired,
    editNote: PropTypes.object.isRequired,
    handleEditNoteChange: PropTypes.func.isRequired,
    editMode: PropTypes.string.isRequired,
    handleEditModeChange: PropTypes.func.isRequired,
    noteText: PropTypes.string.isRequired,
    handleTextFieldChange: PropTypes.func.isRequired,
    noteImportant: PropTypes.bool.isRequired,
    handleNoteImportantChange: PropTypes.func.isRequired,
}

export default function NotesDisplay(props) {
    const client = props.client;
    const updateClient = props.updateClient;
    const handleNoteCountChange = props.handleNoteCountChange;
    const editNote = props.editNote
    const handleEditNoteChange = props.handleEditNoteChange;
    const editMode = props.editMode;
    const handleEditModeChange = props.handleEditModeChange;
    const noteText = props.noteText;
    const handleTextFieldChange = props.handleTextFieldChange;
    const noteImportant = props.noteImportant
    const handleNoteImportantChange = props.handleNoteImportantChange
    const userName = getSession().user.userName

    function callback(response, msg){
        console.log("IN CALLBACK")
        console.log(response, msg)
        if (response === 'success') msg = "Note successfully removed."
        props.showAlert(response, msg);
    }

    function handleDeleteNote(noteId) {
        let tempClient = client
        const notes = client.notes
        const filteredNotes = notes.filter(note => note.noteId !== noteId)
        tempClient.notes = filteredNotes
        updateClient(tempClient)
        handleNoteCountChange(client.notes.length)
        dbSaveClientAsync(client)
            .then( () => {
                props.showAlert('success', 'Note successfully removed.');
            })
            .catch( message => {
                props.showAlert('error', message);
            });
    }

    function handleEditNote(noteId) {
        const notes = client.notes
        const editNote = notes.filter(note => note.noteId === noteId)
        handleEditNoteChange(editNote[0])
        handleEditModeChange('edit')
    }

    function display(type, noteId) {
        const show = (type === 'form')
        if (editMode === 'edit' && editNote.noteId === noteId) return show
        return !show
    }
    
    return (
        <Fragment>
            { client.notes.map((row) => ( 
                <Card key={ row.noteId } width="300px" mb={ 1 } pb={ 1.25 } variant="elevation" elevation={ 4 }> 
                    { display('note', row.noteId) &&
                        <CardContent>
                            <Box display='flex' mb={ 2 } justifyContent='space-between'>                            
                                { row.isImportant === "true" && 
                                    <Box mr={ 1.25 }>
                                        <Fab color="secondary" size="small" ><NotificationImportant /></Fab>
                                    </Box> 
                                }        
                                <Box>
                                    <Typography variant="caption" color="textSecondary" gutterBottom>
                                        Added { moment(row.createdDateTime).fromNow() }
                                        <br/><b>{row.noteByUserName}</b>
                                        { row.createdDateTime !== row.updatedDateTime &&
                                            <Tooltip title= { moment(row.updatedDateTime).fromNow() } >
                                                <span> (Edited)</span>
                                            </Tooltip>   
                                        }
                                    </Typography>
                                </Box>
                                <Box>
                                    <IconButton size="small" m={ 0 } onClick={ () => handleDeleteNote(row.noteId) }>
                                        <Delete />
                                    </IconButton>
                                    { editMode !== 'add' && userName === row.noteByUserName && 
                                        <IconButton size="small"  m={ 0 } onClick={ () => handleEditNote(row.noteId) }>
                                            <Edit />
                                        </IconButton>
                                    }
                                </Box>
                            </Box>
                            <Box>
                                {row.isImportant === "true" && <Typography variant="subtitle2" color="secondary"> {row.noteText}</Typography> }
                                {row.isImportant === "false" && <Typography variant="subtitle2" > {row.noteText}</Typography> }
                            </Box>
                        </CardContent>
                    }
                    { display('form', row.noteId) &&
                        <Fade in={ display('form', row.noteId) }  timeout={ 1000 }>
                            <CardContent>
                                <NoteForm
                                    client={ client } 
                                    updateClient={ updateClient }
                                    handleNoteCountChange={ handleNoteCountChange }
                                    editNote={ editNote }
                                    editMode={ editMode }
                                    handleEditModeChange={ handleEditModeChange }
                                    noteText={ noteText }
                                    handleTextFieldChange={ handleTextFieldChange }
                                    noteImportant={ noteImportant }
                                    handleNoteImportantChange={ handleNoteImportantChange }
                                    showAlert={ props.showAlert }
                                /> 
                            </CardContent>                               
                        </Fade>
                    }
                </Card>
            ))}
        </Fragment>
    )
}