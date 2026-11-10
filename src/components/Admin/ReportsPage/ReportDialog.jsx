import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Table, TableContainer, TableFooter, Tooltip } from '@mui/material';
import { Button,  } from '../../System';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { Print } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { reportTheme } from '../../Theme.jsx';

ReportDialog.propTypes = {
    dialogOpen: PropTypes.bool,
    heading: PropTypes.string,
    body: PropTypes.element,
    actions: PropTypes.element
}

export default function ReportDialog(props) {
    const ref = useRef()
    const getPageMargins = () => {
        return `@page { margin: 20px 20px 40px 20px; }`;
      };
    const printReport = useReactToPrint({
        contentRef: ref,
        ignoreGlobalStyles: true,
        pageStyle: getPageMargins(),
    })
    return (
        <Dialog fullWidth={true} maxWidth={'xl'} open={ props.dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">{props.heading}</DialogTitle>
            <DialogContent ref={ref}>
                <ThemeProvider theme={ reportTheme }>{props.body}</ThemeProvider>
            </DialogContent>
            <DialogActions>
            {props.actions}
            <Tooltip title='Print Report' placement="left-start" ><Fab size="medium" align='right' onClick={ () => printReport() }><Print /></Fab></Tooltip>
            </DialogActions>
        </Dialog>
    )
}