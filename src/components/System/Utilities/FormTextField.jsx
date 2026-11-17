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
// Additional props are passed through to the TextField component.

export default function FormTextField(props) {
    const { name, control, rules, defaultValue, error, fieldsize, ...textProps } = props;
    const width = getFormFieldSize(fieldsize) // xs, sm, md, lg, xl
    
    return (
        <FormControl>
            <Controller name={ name } control={ control } rules={ rules } defaultValue={ defaultValue }
                render={ ({ field: { ref, ...field } }) => (
                    <TextField m={ 0 } width={ width } size="small" { ...textProps } { ...field }
                        inputRef={ ref } error={ Boolean(error) } />
                ) } />
            <Typography ml={ 0.5 } variant='body2' color='error'>
                { error ? error.message : '' }
            </Typography>
        </FormControl>
    )
}