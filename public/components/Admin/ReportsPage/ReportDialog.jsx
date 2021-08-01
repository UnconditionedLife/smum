import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableContainer, TableFooter } from '@material-ui/core';
import { Button,  } from '../../System';

ReportDialog.propTypes = {
    dialogOpen: PropTypes.bool,
    heading: PropTypes.string,
    body: PropTypes.element,
    actions: PropTypes.element
}

export default function ReportDialog(props) {
    return (
        <Dialog fullWidth={true} maxWidth={'xl'} open={ props.dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">{props.heading}</DialogTitle>
            <DialogContent>
            {props.body}
            </DialogContent>
            <DialogActions>
            {props.actions}
            </DialogActions>
        </Dialog>
    )
}