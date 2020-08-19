import React,  { Fragment } from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import theme from '../Sections/Theme.jsx';
import { isEmpty } from '../js/Utils.js';
import { useEffect, useRef, useState } from 'react';
import NotesDisplay from './NotesDisplay.jsx';
import NoteEdit from './NoteEdit.jsx';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles({
    noteContainer: {
        maxWidth: '300px',
        flex: 1,
        alignContent: 'stretch',
    },
    fabMargin: {
        marginLeft: '50px',
        marginBottom: '15px',
    }
  });

  // TODO MAKE THIS A GENERIC FUNCTION ???
  function addNoteId(array, key) {
    let newArray = []
    array.forEach((item, index) => {
        item[key] = index;
        newArray.push(item);
    })
    return newArray
};


export default function ServiceNotes(props) {
    const client = props.client;
    const classes = useStyles();
    const [ notes, setNotes ] = useState([])
    const [ isEditNote, setIsEditNote ] = useState(false)
    
    useEffect(() => {
        if (!isEmpty(client) && isEmpty(notes)) {
            if (!isEmpty(client.notes)) {
                let notesTemp = client.notes
                notesTemp = addNoteId(client.notes, "noteId")
                notesTemp.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
                setNotes(notesTemp)
            }
        }
    },[]);

    function handleNotesChange(value){
        if (value !== notes){
            setNotes(value)
        }
    };
    
    function handleIsEditNoteChange(value){
        if (value !== notes){
            setIsEditNote(value)
        }
    };
    if (!isEmpty(notes)) {
        return (
            <Fragment>
                <div className="serviceDateTimeREACT">
                    SERVICE NOTES
                    { isEditNote === false && <Fab size="small" className={classes.fabMargin} onClick={() => handleIsEditNoteChange(true)}><AddIcon /></Fab> }
                </div>
                { isEditNote === true && 
                    <Fade timeout={20000}>
                        <NoteEdit
                            notes={ notes } 
                            isEditNote={ isEditNote } 
                            handleIsEditNoteChange={ handleIsEditNoteChange } 
                            handleNotesChange={ handleNotesChange }
                        /> 
                    </Fade>
                }       
                <NotesDisplay notes={ notes } />
            </Fragment>
        )
    } else {
        return null
    }  
};