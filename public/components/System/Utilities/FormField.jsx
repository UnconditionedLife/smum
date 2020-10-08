import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import TextField from '../Core/TextField.jsx';
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

function FormField(props) {
    return (
        <Box flexDirection="column">
            <Controller as={ TextField } { ...props } />
            <Typography ml={ 1.5 } mb={ 1 } mt={ -1 } variant='body2' color='error'>
                { props.error ? props.error.message : '' }
            </Typography>
        </Box>
    )
}

FormField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    control: PropTypes.object.isRequired,
    rules: PropTypes.object,
    error: PropTypes.object.isRequired,
}

export default FormField;