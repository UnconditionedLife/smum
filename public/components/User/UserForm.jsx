import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, MenuItem } from '@material-ui/core';
import { FormSelect, FormTextField, SaveCancel } from '../System';
import { packZipcode, unpackZipcode, validState, validPhone, formatPhone } from '../System/js/Forms.js';

export default function UserForm(props) {
    let defValues = { ...props.user };
    defValues.zipcode = packZipcode(props.user.zipcode, props.user.zipSuffix);
    const { handleSubmit, reset, control, errors, formState } = useForm({
        mode: 'onBlur',
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
                { !props.selfEdit && 
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="userName" label="Username" disabled error={ errors.userName } 
                        control={ control } rules={ {required: 'Username is required'}} />
                    <FormSelect name="userRole" label="Role" error={ errors.userRole } 
                        control={ control } rules={ {required: 'User role is required'}} >
                            <MenuItem value="Volunteer">Volunteer</MenuItem>
                            <MenuItem value="Admin">Admin</MenuItem>
                            <MenuItem value="TechAdmin">TechAdmin</MenuItem>

                    </FormSelect>
                    <FormSelect name="isActive" label="Status" error={ errors.isActive }
                        control={ control } rules={ {required: 'User status is required'}} >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                    </FormSelect>
                </Box>
                }
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="givenName" label="Given Name" error={ errors.givenName } 
                        control={ control } rules={ {required: 'Given name is required'}} />
                    <FormTextField name="familyName" label="Family Name" error={ errors.familyName } 
                        control={ control } rules={ {required: 'Family name is required'}} />
                    <FormTextField name="dob" label="Date of Birth" type="date" error={ errors.date }
                        control={ control } />
                </Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField width="300px" name="street" label="Street" error={ errors.street }
                        control={ control } rules={ {required: 'Street address is required'}} />
                    <FormTextField name="city" label="City" error={ errors.city }
                        control={ control } rules={ {required: 'City is required'}} />
                    <FormTextField width="60px" name="state" label="State" error={ errors.state }
                        control={ control } rules={ {required: 'State is required',
                        validate: value => validState(value.toUpperCase()) || 'Invalid state'} } />
                    <FormTextField width="150px" name="zipcode" label="Zip Code" error={ errors.zipcode }
                        control={ control } rules={ {required: 'Zip code is required', 
                        pattern: {value: /^\d{5}$|^\d{5}-\d{4}$/, message: 'Invalid zip code'}} } />
                </Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="telephone" label="Telephone" error={ errors.telephone }
                        control={ control } rules={ {validate: value => validPhone(value) || 'Enter a US phone number with area code'} } />
                    <FormTextField name="email" label="Email" error={ errors.email }
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
    selfEdit: PropTypes.bool,
}