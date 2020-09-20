import React from 'react';
import { Box } from '@material-ui/core';
import Button from '../Core/Button.jsx';

// Props
//      onClick - Callback function(isSave). Argument indicates which button
//          was pressed (true = Save, false = Cancel) 
//      saveLabel - Label for affirmative button (default "Save")
//      cancelLabel - Label for negative buttion (default "Cancel")
//      saveDisabled - Disable affirmative button (default false)
//      cancelDisabled - Disable negative button (default false)
//      disabled - Disable both buttons (default false)

function SaveCancel(props) {
    let saveLabel = props.saveLabel || "Save";
    let cancelLabel = props.cancelLabel || "Cancel";
    let saveDisabled = false;
    if ('saveDisabled' in props)
        saveDisabled = props.saveDisabled;
    else if ('disabled' in props)
        saveDisabled = props.disabled;
    let cancelDisabled = false;
    if ('cancelDisabled' in props)
        cancelDisabled = props.cancelDisabled;
    else if ('disabled' in props)
        cancelDisabled = props.disabled;

    return (
        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
            <Button variant="contained" color="primary"
                disabled={ saveDisabled } onClick={ () => props.onClick(true) }>{ saveLabel }</Button>
            <Button variant="outlined" color="secondary"
                disabled={ cancelDisabled } onClick={ () => props.onClick(false) }>{ cancelLabel }</Button>
        </Box>
    )
}

export default SaveCancel;