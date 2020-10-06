import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box } from '@material-ui/core';
import { FormField, SaveCancel } from '../System';
import { packZipcode, unpackZipcode, validState, validPhone, formatPhone } from '../System/js/Forms.js';

export default function UserForm(props) {
    let defValues = { ...props.user };
    defValues.zipcode = packZipcode(props.user.zipcode, props.user.zipSuffix);
    const { handleSubmit, reset, control, errors, formState } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
        shouldFocusError: true,
        defaultValues: defValues, 
    });

    function doSave(values) {
        let userData = Object.assign({}, props.user);
        values.state = values.state.toUpperCase();
        values.telephone = formatPhone(values.telephone);
        Object.assign(userData, values);
        Object.assign(userData, unpackZipcode(values.zipcode));
        reset(values);
        alert("Changes saved (not really!)");
    }

    const submitForm = handleSubmit(doSave);

    return (
        <Fragment>
            <form>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormField name="givenName" label="Given Name" error={ errors.givenName } 
                        control={ control } rules={ {required: 'Given name is required'}} />
                    <FormField name="familyName" label="Family Name" error={ errors.familyName } 
                        control={ control } rules={ {required: 'Family name is required'}} />
                    <FormField name="dob" label="Date of Birth" type="date" error={ errors.date }
                        control={ control } />
                </Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormField width="300px" name="street" label="Street" error={ errors.street }
                        control={ control } rules={ {required: 'Street address is required'}} />
                    <FormField name="city" label="City" error={ errors.city }
                        control={ control } rules={ {required: 'City is required'}} />
                    <FormField width="50px" name="state" label="State" error={ errors.state }
                        control={ control } rules={ {required: 'State is required',
                        validate: value => validState(value.toUpperCase()) || 'Invalid state'} } />
                    <FormField width="150px" name="zipcode" label="Zip Code" error={ errors.zipcode }
                        control={ control } rules={ {required: 'Zip code is required', 
                        pattern: {value: /^\d{5}$|^\d{5}-\d{4}$/, message: 'Invalid zip code'}} } />
                </Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormField name="telephone" label="Telephone" error={ errors.telephone }
                        control={ control } rules={ {validate: value => validPhone(value) || 'Enter a US phone number with area code'} } />
                    <FormField name="email" label="Email" error={ errors.email }
                        control={ control } />
                </Box>
            </form>
            <SaveCancel disabled={ !formState.isDirty } onClick={ (isSave) => { isSave ? submitForm() : reset() } } />
        </Fragment>
    );
}

UserForm.propTypes = {
    session: PropTypes.object.isRequired,
    user: PropTypes.object,
}