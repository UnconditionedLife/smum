import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, MenuItem, Typography } from '@mui/material';
import { FormSelect, FormTextField, SaveCancel } from '../System';
import { packZipcode, unpackZipcode, validState, validPhone, formatPhone } from '../System/js/Forms.js';
import { dbGetUserAsync, dbSaveUserAsync, dbSetModifiedTime, setEditingState } from '../System/js/Database';
import { cogCreateUserAsync, cogUpdateUserAsync } from '../System/js/Cognito.js';
import { removeErrorPrefix } from '../System/js/GlobalUtils';

const defaultPassword = "ChangeMe0!";

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

    // Warn about trying to add an account with an existing username. However,
    // because this validation is asynchronous, an error will not prevent
    // saving the entry (which will overwrite the existing user).
    function validUsername(name) {
        if (isNewUser) {
            dbGetUserAsync(name)
            .then( () => {
                setError('userName', {type: 'manual', message: 'Username is already in use'});
            })
            .catch( () => {} );
        }
        return true;
    }

    async function saveUser(userData, isNewUser, updateEmail, updatePhone) {
        if (isNewUser) {
            try {
                let newUser = await cogCreateUserAsync(
                    userData.userName,
                    defaultPassword,
                    [
                        { Name: 'email', Value: userData.email },
                        { Name: 'phone_number', Value: userData.telephone.replace(/[^+\d]/g, '') }
                    ]
                );
            } catch (error) {
                return Promise.reject(error);
            }
        } else if (updateEmail || updatePhone) {
            if (!props.selfEdit) {
                return Promise.reject('Email or phone must be edited by the logged-in user');
            } else {
                let attrs = [];
                if (updateEmail) {
                    attrs.push({ Name: 'email', Value: userData.email });
                }
                if (updatePhone) {
                    attrs.push({ Name: 'phone_number', Value: userData.telephone.replace(/[^+\d]/g, '') });
                }
                await cogUpdateUserAsync(attrs)
                    .catch( err => {
                        return Promise.reject(removeErrorPrefix(String(err)));
                    });
            }
        }
        return await dbSaveUserAsync(userData);
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
        saveUser(userData, isNewUser, formState.dirtyFields.email, formState.dirtyFields.telephone)
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
                    <FormTextField name="telephone" label="Telephone" disabled={ !isNewUser && !props.selfEdit } error={ errors.telephone }
                        control={ control } rules={ {required: 'Required',
                            validate: value => validPhone(value) || 'Enter a US phone number with area code'} } />
                    <FormTextField fieldsize="xl" name="email" label="Email" disabled={ !isNewUser && !props.selfEdit } error={ errors.email }
                        control={ control } rules={ {required: 'Required'}}/>
                </Box>
            </form>
            <SaveCancel saveDisabled={ !formState.isDirty } onClick={ (isSave) => { isSave ? submitForm() : doCancel() } } 
                message={ saveMessage } />
        </Fragment>
    );
}