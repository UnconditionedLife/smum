import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { dbGetUserAsync, setEditingState } from '../../System/js/Database';
import { Box, Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import { UserForm } from '../../User';

UserPage.propTypes = {
    userName: PropTypes.string,
    clearRecord: PropTypes.func.isRequired,
}

export default function UserPage(props) {
    const [ user, setUser ] = useState("")
    const [ dialogOpen, setDialogOpen ] = useState(true);
    
    if (dialogOpen) setEditingState(true)

    function closeDialog() {
        setDialogOpen(false);
        setEditingState(false)
        props.clearRecord();
    }

    useEffect(() => {
        if (props.userName)
            dbGetUserAsync(props.userName).then( userObj => { setUser(userObj) });
        else   
            setUser(null);
    }, [])

    if (user == "") return null

    return (
        <Dialog maxWidth="md" open={ dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">{user == null ? "New Record" : "Edit Record"}</DialogTitle>
            <DialogContent>
                <Box>
                    <UserForm onClose={ closeDialog } user={ user } />
                </Box>
            </DialogContent>
        </Dialog>
    );
}