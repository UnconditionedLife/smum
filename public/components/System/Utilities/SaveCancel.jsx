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
//      message - Object with (text, severity, tooltip)
//          severity: 'error', 'warning', 'info', or 'success'
//          text: message string (NOT REQUIRED)
//          tooltip: date or additional info (NOT REQUIRED)

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

    //props.message = { result, text, time }
    let m = {}
    if (props.message.result === 'success') {
        m.severity = 'info'
        m.text = "Saved " + moment(props.message.time).fromNow()
        m.tooltip = moment(props.message.time).format("MMM DD, YYYY h:mma")
    }

    if (props.message.result === 'error') {
        m.severity = 'error'
        m.text = "FAILED TO SAVE - try again!"
        if (typeof props.message.text === 'object') {
            JSON.stringify(props.message.text)
            m.tooltip = props.message.text.message
        } else {
            m.tooltip = props.message.text
        }
    }

    if (props.message.result === 'loading') {
        m.severity = 'warning'
        m.text = "SAVING TO DATABASE..."
    }

    const alertBox = (
        <Box width='40%' height='38px' m={ 1 } alignContent="center" justifyContent="center">
            <Alert severity={ m.severity }> { m.text } </Alert>
        </Box>
    )

    return (
        <Box display="flex" mt={ 2 } flexDirection="column" flexWrap="wrap" alignContent="center" justifyContent="center">
            <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
                <Button variant="contained" color="primary"
                    disabled={ saveDisabled } onClick={ () => props.onClick(true) }>{ props.saveLabel }</Button>
                <Button variant="outlined" color="secondary"
                    disabled={ cancelDisabled } onClick={ () => props.onClick(false) }>{ props.cancelLabel }</Button>
            </Box>
            { (m.tooltip && m.text) && <Tooltip title={ m.tooltip } placement="right">{ alertBox }</Tooltip> }
            { (!m.tooltip && m.text) && alertBox }
        </Box>
    )
}