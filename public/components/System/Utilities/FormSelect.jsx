import React from 'react';
import { Box } from '@material-ui/core';
import Select from '../Core/Select.jsx';
import Typography from '../Core/Typography.jsx';
import { Controller } from 'react-hook-form';


// Props
//      name - Name of form field 
//      label - Display label for form field
//      type - Type of input field
//      control - Control property from parent form
//      rules - Validation rules
//      error - Error object for this field (i.e. errors.<name>
// Additional props are passed through to the Controller component. 
// See the API documentation for Controller for full details.

function FormSelect(props) {
    return (
        <Box display="flex" flexDirection="column">
            <Controller as={ Select } { ...props } />
            <Typography ml={ 1.5 } mb={ 1 } mt={ -1 } variant='body2' color='error'>
                { props.error ? props.error.message : '' }
            </Typography>
        </Box>
    )
}

export default FormSelect;