import React,  { Fragment, useState, useEffect  } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { Box, Badge, CardContent, Fade, Tooltip, Typography } from '@material-ui/core';
import NotesDisplay from './NotesDisplay.jsx';
import NoteForm from './NoteForm.jsx';
import AddIcon from '@material-ui/icons/Add';
import { Card, Fab } from '../../System';

ServiceNotes.propTypes = {
    client: PropTypes.object.isRequired, updateClient: PropTypes.func.isRequired,    
    showAlert: PropTypes.func.isRequired,
}

export default function ServiceNotes(props) {
    const client = props.client;
    const updateClient = props.updateClient;
    const [ noteCount, setNoteCount ] = useState(0);
    const [ editNote, setEditNote ] = useState({})
    const [ editMode, setEditMode ] = useState('none')
    const [ noteText, setNoteText ] = useState('')
    const [ noteImportant, setNoteImportant ] = useState(false)

    useEffect(() => {
        if (!isEmpty(client)) setNoteCount(client.notes.length)
    })

    function handleNoteCountChange(count){
        if (count !== noteCount) setNoteCount(count)
    }
    
    function handleEditModeChange(newEditMode){
        if (newEditMode !== editMode) {
            if (newEditMode === 'add') {
                handleTextFieldChange('')
                handleNoteImportantChange(false)
                handleEditNoteChange({})
            }
            setEditMode(newEditMode)
        }
    }

    function handleEditNoteChange(newNote){
        if (newNote !== editNote) setEditNote(newNote)
    }

    function handleTextFieldChange(text){
        if (noteText !== text) setNoteText(text)
    }

    function handleNoteImportantChange(checked){
        if (noteImportant !== checked) setNoteImportant(checked)
    }

    return (
        <Fragment>
            <Card height='80px'>
                <Box display='flex' minWidth='300px' maxWidth='100%' p={ 2 } justifyContent='space-between' alignItems='center'>
                    <Badge badgeContent={ noteCount } color="secondary">
                        <Typography variant='h6' noWrap>
                            SERVICE NOTES&nbsp;
                        </Typography>
                    </Badge>  

                    { editMode === 'none' && 
                        <Tooltip title= 'Add Note'>
                            <Fab ml={ 2 } float='right' size="small" onClick={() => handleEditModeChange('add')}><AddIcon /></Fab>
                        </Tooltip> 
                    }

                </Box>
            </Card>
            { editMode === 'add' &&
            <Fade in= { editMode === 'add' }  timeout={ 1500 }>
                <Card width='300px'mb={ 1 } variant="elevation" elevation={ 8 }>
                    <CardContent>
                        <NoteForm
                            client = { client } 
                            updateClient = { updateClient }
                            noteCount = { noteCount }
                            handleNoteCountChange = { handleNoteCountChange }
                            editNote = { editNote }
                            handleEditNoteChange = { handleEditNoteChange }
                            editMode={ editMode }
                            handleEditModeChange = { handleEditModeChange }
                            noteText = { noteText }
                            handleTextFieldChange = { handleTextFieldChange }
                            noteImportant = { noteImportant }
                            handleNoteImportantChange = { handleNoteImportantChange }
                            showAlert={ props.showAlert }
                        /> 
                    </CardContent>
                </Card>
            </Fade>
            }   
            <NotesDisplay 
                client={ client } updateClient = { updateClient }
                handleNoteCountChange = { handleNoteCountChange }
                editNote = { editNote } handleEditNoteChange = { handleEditNoteChange }
                editMode={ editMode } handleEditModeChange = { handleEditModeChange }
                noteText = { noteText } handleTextFieldChange = { handleTextFieldChange }
                noteImportant = { noteImportant } handleNoteImportantChange = { handleNoteImportantChange }
                showAlert={ props.showAlert }
            />
        </Fragment>
    )
}