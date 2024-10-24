import React from 'react';
import PropTypes from 'prop-types';
import { InputLabel } from '@mui/material';
import Select from '../Core/Select.jsx';
import FormControl from '../Core/FormControl.jsx';
import Typography from '../Core/Typography.jsx';
import { Controller } from 'react-hook-form';
import { getFormFieldSize } from '../js/FormsSystem'

FormSelect.propTypes = {
    name: PropTypes.string.isRequired,      // name - Name of form field
    label: PropTypes.string.isRequired,     // label - Display label for form field
    control: PropTypes.object.isRequired,   // control - Control property from parent form
    rules: PropTypes.object,                // rules - Validation rules
    error: PropTypes.object,                // error - Error object for this field (i.e. errors.<name>)
    fieldsize: PropTypes.string,            // defines the width of the text field
}
// Additional props are passed through to the Controller component. 
// See the API documentation for Controller for full details.

export default function FormSelect(props) {
    let selectProps = { ...props };
    selectProps.error = Boolean(props.error);
    const width = getFormFieldSize(props.fieldsize) // xs, sm, md, lg, xl

    return (
        <FormControl size='small'>
            <InputLabel>{ props.label }</InputLabel>
            <Controller as={ Select } width={ width } { ...selectProps }   />
            <Typography ml={ 0.5 } variant='body2' color='error'>
                { props.error ? props.error.message : '' }
            </Typography>
        </FormControl>
    )
}