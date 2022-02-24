import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Table, TableContainer, TableFooter, Tooltip } from '@material-ui/core';
import { Button,  } from '../../System';
import ReactToPrint from 'react-to-print';
import { useRef } from 'react';
import { Print } from '@material-ui/icons';

ReportDialog.propTypes = {
    dialogOpen: PropTypes.bool,
    heading: PropTypes.string,
    body: PropTypes.element,
    actions: PropTypes.element
}

export default function ReportDialog(props) {
    const ref = useRef()
    return (
        <Dialog fullWidth={true} maxWidth={'xl'} open={ props.dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">{props.heading}</DialogTitle>
            <DialogContent ref={ref}>
            {props.body}
            </DialogContent>
            <DialogActions>
            {props.actions}
            <ReactToPrint
                trigger={() => <Tooltip title='Print Report' placement="left-start" ><Fab size="medium" align='right'><Print /></Fab></Tooltip> }
                content={() => ref.current}
                copyStyles={ false }
            />
            </DialogActions>
        </Dialog>
    )
}