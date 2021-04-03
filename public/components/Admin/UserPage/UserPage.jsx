import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import { dbGetUserAsync } from '../../System/js/Database.js';
import { Box, Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import { UserForm } from '../../User';

UserPage.propTypes = {
    userName: PropTypes.string,
    clearRecord: PropTypes.func.isRequired,
}

export default function UserPage(props) {
    const [ user, setUser ] = useState(null)
    const [ dialogOpen, setDialogOpen ] = useState(true);

    useEffect(() => {
        dbGetUserAsync(props.userName).then( userObj => { setUser(userObj) })
    }, [])

    if (user == null) return null

    return (
        <Dialog maxWidth="md" open={ dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">{user == null ? "New Record" : "Edit Record"}</DialogTitle>
            <DialogContent>
                <Box>
                    <UserForm clearRecord={props.clearRecord} setDialogOpen={setDialogOpen} user={ user } />
                </Box>
            </DialogContent>
        </Dialog>
    );
}