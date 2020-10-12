import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '../Core/FormControl.jsx';
import TextField from '../Core/TextField.jsx';
import Typography from '../Core/Typography.jsx';
import { Controller } from 'react-hook-form';


// Props
//      name - Name of form field 
//      label - Display label for form field
//      type - Type of text input field
//      control - Control property from parent form
//      rules - Validation rules
//      error - Error object for this field (i.e. errors.<name>)
// Additional props are passed through to the Controller component. 
// See the API documentation for Controller for full details.

function FormTextField(props) {
    return (
        <FormControl variant='outlined'>
            <Controller as={ TextField } m={ 0 } { ...props } />
            <Typography ml={ 0.5 } variant='body2' color='error'>
                { props.error ? props.error.message : '' }
            </Typography>
        </FormControl>
    )
}

FormTextField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    control: PropTypes.object.isRequired,
    rules: PropTypes.object,
    error: PropTypes.object.isRequired,
}

export default FormTextField;