import React,  { Fragment, useState, useEffect  } from 'react';
import { isEmpty } from '../../System/js/Utils.js';
import { Box, Badge, CardContent, Fade, Tooltip, Typography } from '@material-ui/core';
import NotesDisplay from './NotesDisplay.jsx';
import NoteForm from './NoteForm.jsx';
import AddIcon from '@material-ui/icons/Add';
import { Card, Fab } from '../../System';

export default function ServiceNotes(props) {
    const session = props.session;
    const client = props.client;
    const handleClientChange = props.handleClientChange;
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
                            handleClientChange = { handleClientChange }
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
                        /> 
                    </CardContent>
                </Card>
            </Fade>
            }   
            <NotesDisplay 
                client={ client }
                handleClientChange = { handleClientChange }
                session = { session }
                handleNoteCountChange = { handleNoteCountChange }
                editNote = { editNote }
                handleEditNoteChange = { handleEditNoteChange }
                editMode={ editMode }
                handleEditModeChange = { handleEditModeChange }
                noteText = { noteText }
                handleTextFieldChange = { handleTextFieldChange }
                noteImportant = { noteImportant }
                handleNoteImportantChange = { handleNoteImportantChange }
            />
        </Fragment>
    )
}