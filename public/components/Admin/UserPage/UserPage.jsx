import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { dbGetUser } from '../../System/js/Database.js';
import { Box, Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import { UserForm } from '../../User';

UserPage.propTypes = {
    session: PropTypes.object.isRequired,
    userName: PropTypes.string,
    clearRecord: PropTypes.func.isRequired,
}

export default function UserPage(props) {
    const user = props.userName ? dbGetUser(props.session, props.userName) : null;
    const [ dialogOpen, setDialogOpen ] = useState(true);

    return (
        <Dialog maxWidth="md" open={ dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">{user == null ? "New Record" : "Edit Record"}</DialogTitle>
            <DialogContent>
                <Box>
                    <UserForm clearRecord={props.clearRecord} setDialogOpen={setDialogOpen} session={ props.session } user={ user } />
                </Box>
            </DialogContent>
        </Dialog>
    );
}