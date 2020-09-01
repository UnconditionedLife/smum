import React from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import Fab from '@material-ui/core/Fab';
import NoteForm from './NoteForm.jsx';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles({
    card: {
        width: 300,
        marginBottom: 8,
        paddingBottom: -10,
    },
    margin: {
        margin: 0,
    },
    padding: {
        paddingTop: 0,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    important: {
        marginRight: 10,
    }
  });

export default function NotesDisplay(props) {
    const client = props.client;
    const handleClientChange = props.handleClientChange;
    const noteCount = props.noteCount
    const handleNoteCountChange = props.handleNoteCountChange;
    const editNote = props.editNote
    const handleEditNoteChange = props.handleEditNoteChange;
    const editMode = props.editMode;
    const handleEditModeChange = props.handleEditModeChange;
    const noteText = props.noteText;
    const handleTextFieldChange = props.handleTextFieldChange;
    const noteImportant = props.noteImportant
    const handleNoteImportantChange = props.handleNoteImportantChange
    const classes = useStyles();

    function handleDeleteNote(noteId) {
        let tempClient = client
        const notes = client.notes
        const filteredNotes = notes.filter(note => note.noteId !== noteId)
        tempClient.notes = filteredNotes
        handleClientChange(tempClient)
        handleNoteCountChange(client.notes.length)
        const result = window.dbSaveCurrentClient(client)
        if (result !== "success") {
            alert("Client did not save properly");
        }
    };

    function handleEditNote(noteId) {
        const notes = client.notes
        const editNote = notes.filter(note => note.noteId === noteId)
        handleEditNoteChange(editNote[0])
        handleEditModeChange('edit')
        
    };

    function display(type, noteId) {
        const show = (type === 'form')
        if (editMode === 'edit' && editNote.noteId === noteId) return show
        return !show
    };
    
    return (
        <div>
            {client.notes.map((row) => ( 
                <Card key={row.noteId} className={classes.card} variant="elevation" elevation={4}> 
                    { display('note', row.noteId) &&
                        <CardContent>
                            <div className={classes.header} >                            
                                {row.isImportant === "true" && <div><Fab className={classes.important} color="secondary" size="small" ><NotificationImportantIcon /></Fab></div> }        
                                <div>
                                    <Typography variant="caption" color="textSecondary" gutterBottom>
                                        Added { window.moment(row.createdDateTime).fromNow() }
                                        <br/><b>{row.noteByUserName}</b>
                                        { row.createdDateTime !== row.updatedDateTime &&
                                            <Tooltip title= { window.moment(row.updatedDateTime).fromNow() } >
                                                <span> (Edited)</span>
                                            </Tooltip>   
                                        }
                                    </Typography>
                                </div>
                                <div>
                                    <IconButton size="small" 
                                        className={classes.margin}
                                        onClick={() => handleDeleteNote(row.noteId)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    { editMode !== 'add' && 
                                        <IconButton size="small" 
                                            className={classes.margin}
                                            onClick={() => handleEditNote(row.noteId)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    }
                                </div>
                            </div>
                            <div>
                                {row.isImportant === "true" && <Typography variant="subtitle2" color="secondary"> {row.noteText}</Typography> }
                                {row.isImportant === "false" && <Typography variant="subtitle2" > {row.noteText}</Typography> }
                            </div>
                        </CardContent>
                    }
                    { display('form', row.noteId) &&
                        <Fade in={ display('form', row.noteId) }  timeout={ 1000 }>
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
                                    noteText={ noteText }
                                    handleTextFieldChange ={ handleTextFieldChange }
                                    noteImportant={ noteImportant }
                                    handleNoteImportantChange={ handleNoteImportantChange }
                                /> 
                            </CardContent>                               
                        </Fade>
                    }
                </Card>
            ))}
        </div>
    )
};