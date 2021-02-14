import React from 'react';
import PropTypes from 'prop-types';
import { Box, Tooltip } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Button from '../Core/Button.jsx';
import moment from 'moment';

// Props
//      onClick - Callback function(isSave). Argument indicates which button
//          was pressed (true = Save, false = Cancel) 
//      saveLabel - Label for affirmative button (default "Save")
//      cancelLabel - Label for negative buttion (default "Cancel")
//      saveDisabled - Disable affirmative button (default false)
//      cancelDisabled - Disable negative button (default false)
//      disabled - Disable both buttons (default false)
//      message - Object with (text, severity)
//          severity: 'error', 'warning', 'info', or 'success'
//          text: message string
//          lastUpdate: date object corresponding to last save (implies severity='info')

SaveCancel.propTypes = {
    onClick: PropTypes.func.isRequired,
    saveLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    saveDisabled: PropTypes.bool,
    cancelDisabled: PropTypes.bool,
    disabled: PropTypes.bool,
    message: PropTypes.object,
}

SaveCancel.defaultProps = {
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
    saveDisabled: false,
    cancelDisabled: false,
    disabled: false,
}

export default function SaveCancel(props) {
    const saveDisabled = props.saveDisabled || props.disabled;
    const cancelDisabled = props.cancelDisabled || props.disabled;
    let msgText = null;
    let msgSeverity = null;
    let msgTime = null;

    if (props.message?.lastUpdate) {
        msgTime = props.message.lastUpdate;
    } else if (props.message) {
        msgText = props.message.text;
        msgSeverity = props.message.severity;
    }

    return (
        <Box display="flex" mt={ 2 } flexDirection="column" flexWrap="wrap" alignContent="center" justifyContent="center">
            <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
                <Button variant="contained" color="primary"
                    disabled={ saveDisabled } onClick={ () => props.onClick(true) }>{ props.saveLabel }</Button>
                <Button variant="outlined" color="secondary"
                    disabled={ cancelDisabled } onClick={ () => props.onClick(false) }>{ props.cancelLabel }</Button>
            </Box>
            { msgText && <Box width='40%' height='38px' m={ 1 } alignContent="center" justifyContent="center">
                <Alert severity={ msgSeverity } >{ msgText }</Alert>
            </Box> }
            { msgTime && <Box width='40%' height='38px' m={ 1 } alignContent="center" justifyContent="center">
                <Tooltip title={ moment(msgTime).format('MMM DD, YYYY hh:mm A') } placement="right">
                    <Alert severity="info">{ "Last updated " + moment(msgTime).fromNow() }</Alert>
                </Tooltip>
            </Box> }
        </Box>
    )
}

