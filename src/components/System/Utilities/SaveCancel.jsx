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
//          result: 'error', 'working', or 'success'
//          time: last update time (if result == 'success')
//          text: additional message string (optional)

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

    let m = {}
    if (props.message?.result === 'success') {
        m.severity = 'info';
        if (props.message.time) {
            m.text = "Saved " + moment(props.message.time).fromNow();
            m.tooltip = moment(props.message.time).format("MMM DD, YYYY h:mma");
        } else {
            m.text = props.message.text;
        }
    } else if (props.message?.result === 'error') {
        m.severity = 'error';
        m.text = props.message.text || 'FAILED TO SAVE - try again!';
        m.tooltip = props.message.text;
    } else if (props.message?.result === 'working') {
        m.severity = 'warning';
        m.text = 'SAVING TO DATABASE...';
    }

    const alertBox = (
        <Box maxWidth='300px' height='38px' m={ 1 } alignContent="center" justifyContent="center">
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
            <Box width={ 1 } display="flex" justifyContent="center">
                { (m.tooltip && m.text) && <Tooltip title={ m.tooltip } placement="right">{ alertBox }</Tooltip> }
                { (!m.tooltip && m.text) && alertBox }
            </Box>
        </Box>
    )
}