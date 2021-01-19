import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, MenuItem } from '@material-ui/core';
import { FormSelect, FormTextField, SaveCancel } from '../System';
import { packZipcode, unpackZipcode, validState, validPhone, formatPhone } from '../System/js/Forms.js';
import { dbGetUser, dbSetModifiedTime } from '../System/js/Database';

UserForm.propTypes = {
    session: PropTypes.object.isRequired,
    user: PropTypes.object,     // null to create new user
    selfEdit: PropTypes.bool,   // true if editing current session user
}

export default function UserForm(props) {
    const isNewUser = (props.user == null);
    let initValues;
    let userData;
    if (isNewUser) {
        userData = {userName: '', isActive: 'Active', userRole: 'Volunteer',
            givenName: '', familyName: '', dob: '2000-01-01',
            street: '', city: '', state: '', zipcode: '', zipSuffix: 0,
            telephone: '', email: '', notes: [],
        };
    } else {
        userData = Object.assign({}, props.user);
    }
    initValues = { ...userData };
    initValues.zipcode = packZipcode(userData.zipcode, userData.zipSuffix);

    const { handleSubmit, reset, control, errors, setError, formState } = useForm({
        mode: 'onBlur',
        defaultValues: initValues, 
    });

    function doSave(formValues) {
        // Validate form contents
        if (isNewUser && dbGetUser(props.session, formValues.userName) != null) {
            setError('userName', {type: 'manual', message: 'Username is already in use'});
        } else {
            // Convert form values to canonical format
            formValues.state = formValues.state.toUpperCase();
            formValues.telephone = formatPhone(formValues.telephone);
            // Overwrite user data structure with form values
            Object.assign(userData, formValues);
            Object.assign(userData, unpackZipcode(formValues.zipcode));
            // Save user data and reset form state to new values
            dbSetModifiedTime(userData, isNewUser);
            reset(formValues);
            alert("Changes saved (not really!)\n"+JSON.stringify(userData));
        }
    }

    const submitForm = handleSubmit(doSave);

    return (
        <Fragment>
            <form>
                { !props.selfEdit && 
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="userName" label="Username" disabled={ !isNewUser } error={ errors.userName } 
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
                    <FormTextField fieldsize="xl" name="street" label="Street" error={ errors.street }
                        control={ control } rules={ {required: 'Street address is required'}} />
                    <FormTextField name="city" label="City" error={ errors.city }
                        control={ control } rules={ {required: 'City is required'}} />
                    <FormTextField fieldsize="xs" name="state" label="State" error={ errors.state }
                        control={ control } rules={ {required: 'State is required',
                        validate: value => validState(value.toUpperCase()) || 'Invalid state'} } />
                    <FormTextField fieldsize="md" name="zipcode" label="Zip Code" error={ errors.zipcode }
                        control={ control } rules={ {required: 'Zip code is required', 
                        pattern: {value: /^\d{5}$|^\d{5}-\d{4}$/, message: 'Invalid zip code'}} } />
                </Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="telephone" label="Telephone" error={ errors.telephone }
                        control={ control } rules={ {validate: value => validPhone(value) || 'Enter a US phone number with area code'} } />
                    <FormTextField fieldsize="xl" name="email" label="Email" error={ errors.email }
                        control={ control } />
                </Box>
            </form>
            <SaveCancel disabled={ !formState.isDirty } onClick={ (isSave) => { isSave ? submitForm() : reset() } } />
        </Fragment>
    );
}
