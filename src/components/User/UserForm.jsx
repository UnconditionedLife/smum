import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, MenuItem, Typography } from '@material-ui/core';
import { FormSelect, FormTextField, SaveCancel } from '../System';
import { packZipcode, unpackZipcode, validState, validPhone, formatPhone } from '../System/js/Forms.js';
import { dbGetUserAsync, dbSaveUserAsync, dbSetModifiedTime, setEditingState } from '../System/js/Database';

UserForm.propTypes = {
    user: PropTypes.object,     // null to create new user
    selfEdit: PropTypes.bool,   // true if editing current session user
    onClose: PropTypes.func,    // callback when Cancel is pressed
}

export default function UserForm(props) {
    const isNewUser = (props.user == null);
    let initValues;
    let userData;
    const initMsg = isNewUser ? {} : {result: 'success', time: props.user.updatedDateTime};
    const [ saveMessage, setSaveMessage ] = useState(initMsg);

    if (isNewUser) {
        userData = {
            userName: '', isActive: 'Active', userRole: 'Volunteer',
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

    if (formState.isDirty) 
        setEditingState(true);

    function validUsername(name) {
        dbGetUserAsync(name)
        .then( () => {
            setError('userName', {type: 'manual', message: 'Username is already in use'});
        })
        .catch( () => {} );
        return true;
    }

    function doSave(formValues) {
        // Convert form values to canonical format
        formValues.state = formValues.state.toUpperCase();
        formValues.telephone = formatPhone(formValues.telephone);
        // Overwrite user data structure with form values
        Object.assign(userData, formValues);
        Object.assign(userData, unpackZipcode(formValues.zipcode));
        // Save user data and reset form state to new values
        dbSetModifiedTime(userData, isNewUser);
        setSaveMessage({ result: 'working' });
        dbSaveUserAsync(userData)
            .then( () => {
                setSaveMessage({ result: 'success', time: userData.updatedDateTime });
                setEditingState(false)
                reset(formValues);
                if (props.onClose)
                    props.onClose();
            })
            .catch( message => {
                setSaveMessage({ result: 'error', text: message });
            });
        // TODO update cognito if phone or email is modified
    }
    const submitForm = handleSubmit(doSave);

    function doCancel() {
        setEditingState(false)
        reset();
        if (props.onClose)
            props.onClose();      
    }

    return (
        <Fragment>
            <form>
                <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Account Holder</Typography></Box>
                { !props.selfEdit && 
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="userName" label="Username" disabled={ !isNewUser } error={ errors.userName } 
                        control={ control } rules={ {required: 'Required', validate: value => validUsername(value)} }/>
                    <FormSelect name="userRole" label="Role" error={ errors.userRole } 
                        control={ control } rules={ {required: 'Required'}} >
                            <MenuItem value="Volunteer">Volunteer</MenuItem>
                            <MenuItem value="Admin">Admin</MenuItem>
                            <MenuItem value="TechAdmin">TechAdmin</MenuItem>
                    </FormSelect>
                    <FormSelect name="isActive" label="Status" error={ errors.isActive }
                        control={ control } rules={ {required: 'Required'}} >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                    </FormSelect>
                </Box>
                }
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="givenName" label="Given Name" error={ errors.givenName } 
                        control={ control } rules={ {required: 'Required'}} />
                    <FormTextField name="familyName" label="Family Name" error={ errors.familyName } 
                        control={ control } rules={ {required: 'Required'}} />
                    <FormTextField name="dob" label="Date of Birth" type="date" error={ errors.date }
                        control={ control } />
                </Box>

                <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Address</Typography></Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField fieldsize="xl" name="street" label="Street" error={ errors.street }
                        control={ control } rules={ {required: 'Required'}} />
                    <FormTextField name="city" label="City" error={ errors.city }
                        control={ control } rules={ {required: 'Required'}} />
                    <FormTextField fieldsize="xs" name="state" label="State" error={ errors.state }
                        control={ control } rules={ {required: 'Required',
                        validate: value => validState(value.toUpperCase()) || 'Invalid state'} } />
                    <FormTextField fieldsize="sm" name="zipcode" label="Zip Code" error={ errors.zipcode }
                        control={ control } rules={ {required: 'Required', 
                        pattern: {value: /^\d{5}$|^\d{5}-\d{4}$/, message: 'Invalid zip code'}} } />
                </Box>

                <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Contact Info</Typography></Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="telephone" label="Telephone" error={ errors.telephone }
                        control={ control } rules={ {validate: value => validPhone(value) || 'Enter a US phone number with area code'} } />
                    <FormTextField fieldsize="xl" name="email" label="Email" error={ errors.email }
                        control={ control } />
                </Box>
            </form>
            <SaveCancel saveDisabled={ !formState.isDirty } onClick={ (isSave) => { isSave ? submitForm() : doCancel() } } 
                message={ saveMessage } />
        </Fragment>
    );
}