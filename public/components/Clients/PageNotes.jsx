import React from 'react';
import { isEmpty } from '../js/Utils.js';
import { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import NotesDisplay from './NotesDisplay.jsx';
import NoteEdit from './NoteForm.jsx';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
    checkboxDiv: {
        padding: "12px"
    },
    buttonDiv: {
        paddingTop: "8px"
    }

}));

export default function PageNotes(props) {
    const client = props.client;
    const notesDiv = useRef(null);
    const classes = useStyles();

    useEffect(() => {
        if (!isEmpty(client)) {
            const isEdit = true;
            window.uiShowNotes(notesDiv.current, 'Notes Page')
            window.uiShowExistingNotes()
        }
    })

    return (
        <div>
            {/* <NoteEdit client={ client } /> */}
            <NotesDisplay client={ client } />
            <div id="newNoteButton" className="topFormButtonsDiv">
                <Button variant="contained" color="primary" onClick={ () => window.clickToggleNoteForm('show','') } >New Note</Button>
                {/* <input className="solidButton" onClick={ window.clickToggleNoteForm('show','') } type="button" value="New Note" /> */}
            </div>
            <div>
                <div id="noteEditForm">
                    {/* <form noValidate autoComplete="off"> */}
                        <div id="noteEditHeader">NEW NOTE</div>
                        {/*<TextField
                            id="noteTextArea"
                            //   className="noteForm"
                            label="Client Note"
                            multiline
                            rowsMax={4}
                            rows={4}
                            value=""
                            variant="outlined"
                            //   onChange={handleChange}
                            /> */}
                        <div><textarea id="noteTextArea" className="noteForm" required></textarea></div>
                        <div className={ classes.checkboxDiv }><input id="noteIsImportant" className="noteForm" type="checkbox" value="true"/><span className="checkboxtext">&nbsp; IMPORTANT!</span></div>
                        <div  className={ classes.checkboxDiv }><p><input className="solidButton" onClick={ () => window.clickSaveNote() } type="button" value="Save"/></p></div>
                        <div  className={ classes.checkboxDiv }><input className="openButton" onClick={ () => window.clickToggleNoteForm('hide', '') } type="button" value="Cancel"/></div>
                    {/* </form> */}
                </div>
                <div id="notesContainer">
                    <div ref={ notesDiv }></div>
                </div>
            </div>
        </div>
    );
};