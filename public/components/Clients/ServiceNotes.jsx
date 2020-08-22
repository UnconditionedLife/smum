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
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    noteContainer: {
        maxWidth: 300,
        flex: 1,
        alignContent: 'stretch',
    },
    fabMargin: {
        marginLeft: 15,
        float: 'right',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: -10,
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
        console.log('Change Notes')
        if (value !== notes){
            setNotes(value)
            console.log(notes)
        }
        console.log(notes)
        console.log(notes)
    };
    
    function handleIsEditNoteChange(value){
        if (value !== notes){
            setIsEditNote(value)
        }
    };
    return (
        <Fragment>
            <div className={ classes.header }>
            <Typography className={classes.title} variant='subtitle1' noWrap>
                SERVICE NOTES
            </Typography>    
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
            <NotesDisplay 
                notes={ notes }
                handleNotesChange={ handleNotesChange } />
        </Fragment>
    )

};