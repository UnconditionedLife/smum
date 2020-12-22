import React from 'react';
import PropTypes from 'prop-types';
import { InputLabel } from '@material-ui/core';
import Select from '../Core/Select.jsx';
import FormControl from '../Core/FormControl.jsx';
import Typography from '../Core/Typography.jsx';
import { Controller } from 'react-hook-form';

FormSelect.propTypes = {
    name: PropTypes.string.isRequired,      // name - Name of form field
    label: PropTypes.string.isRequired,     // label - Display label for form field
    control: PropTypes.object.isRequired,   // control - Control property from parent form
    rules: PropTypes.object,                // rules - Validation rules
    error: PropTypes.object,                // error - Error object for this field (i.e. errors.<name>)
}
// Additional props are passed through to the Controller component. 
// See the API documentation for Controller for full details.

function FormSelect(props) {
    let selectProps = { ...props };
    selectProps.error = Boolean(props.error);

    return (
        <FormControl variant='outlined'>
            <InputLabel>{ props.label }</InputLabel>
            <Controller as={ Select } { ...selectProps }   />
            <Typography ml={ 0.5 } variant='body2' color='error'>
                { props.error ? props.error.message : '' }
            </Typography>
        </FormControl>
    )
}

export default FormSelect;