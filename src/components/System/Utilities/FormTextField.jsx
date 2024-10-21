import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '../Core/FormControl.jsx';
import TextField from '../Core/TextField.jsx';
import Typography from '../Core/Typography.jsx';
import { Controller } from 'react-hook-form';
import { getFormFieldSize } from '../js/FormsSystem'

FormTextField.propTypes = {
    name: PropTypes.string.isRequired,      // Name of form field
    label: PropTypes.string.isRequired,     // Display label for form field
    type: PropTypes.string,                 // Type of text input field
    control: PropTypes.object.isRequired,   // Control property from parent form
    rules: PropTypes.object,                // Validation rules
    error: PropTypes.object,                // Error object for this field (i.e. errors.<name>)
    fieldsize: PropTypes.string,            // defines the width of the text field
}
// Additional props are passed through to the Controller component. 
// See the API documentation for Controller for full details.

export default function FormTextField(props) {
    let textProps = { ...props };
    textProps.error = Boolean(props.error);
    const width = getFormFieldSize(props.fieldsize) // xs, sm, md, lg, xl
    
    return (
        <FormControl>
            <Controller as={ TextField } m={ 0 } width={ width } size="small" { ...textProps } />
            <Typography ml={ 0.5 } variant='body2' color='error'>
                { props.error ? props.error.message : '' }
            </Typography>
        </FormControl>
    )
}