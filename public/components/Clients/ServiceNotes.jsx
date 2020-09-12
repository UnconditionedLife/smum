import React,  { Fragment } from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import theme from '../Sections/Theme.jsx';
import { isEmpty } from '../System/js/Utils.js';
import { useState, useEffect } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import NotesDisplay from './NotesDisplay.jsx';
import NoteForm from './NoteForm.jsx';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles({
    card: {
        width: 300,
        marginBottom: 8,
    },
    fabMargin: {
        marginLeft: 15,
        float: 'right',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        // marginTop: -10,
    },
    badge: {
        marginTop: 0,
    }
  });

export default function ServiceNotes(props) {
    const session = props.session;
    const client = props.client;
    const handleClientChange = props.handleClientChange;
    const [ noteCount, setNoteCount ] = useState(0);
    const [ editNote, setEditNote ] = useState({})
    const [ editMode, setEditMode ] = useState('none')
    const [ noteText, setNoteText ] = useState('')
    const [ noteImportant, setNoteImportant ] = useState(false)
    const classes = useStyles();
    

    useEffect(() => {
        if (!isEmpty(client)) setNoteCount(client.notes.length)
    })

    function handleNoteCountChange(count){
        if (count !== noteCount) setNoteCount(count)
    };
    
    function handleEditModeChange(newEditMode){
        if (newEditMode !== editMode) {
            if (newEditMode === 'add') {
                handleTextFieldChange('')
                handleNoteImportantChange(false)
                handleEditNoteChange({})
            }
            setEditMode(newEditMode)
        }
    };

    function handleEditNoteChange(newNote){
        if (newNote !== editNote) setEditNote(newNote)
    };

    function handleTextFieldChange(text){
        if (noteText !== text) setNoteText(text)
    };

    function handleNoteImportantChange(checked){
        if (noteImportant !== checked) setNoteImportant(checked)
    };

    return (
        <ThemeProvider theme={ theme }>
            <div className={ classes.header }>
                <Badge className={ classes.badge } badgeContent={ noteCount } color="secondary">
                    <Typography className={classes.title} variant='h6' noWrap>
                        SERVICE NOTES&nbsp;
                    </Typography>
                </Badge>  
                { editMode === 'none' && 
                    <Tooltip title= 'Add Note'>
                        <Fab size="small" className={classes.fabMargin} onClick={() => handleEditModeChange('add')}><AddIcon /></Fab>
                    </Tooltip> }
            </div>
            { editMode === 'add' &&
            <Fade in= { editMode === 'add' }  timeout={ 1500 }>
                <Card className={classes.card} variant="elevation" elevation={ 8 }>
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
        </ThemeProvider>
    )
};