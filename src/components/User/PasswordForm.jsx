import React, { Fragment, useState } from 'react';
import { useForm } from "react-hook-form";
import { Box } from '@mui/material';
import { FormTextField, SaveCancel, Typography } from '../System';
import { getUserName, setEditingState } from '../System/js/Database';
import { cogChangePasswordAsync } from '../System/js/Cognito';

export default function PasswordForm() {
    const { reset, handleSubmit, control, formState, errors, setError } = useForm({
        mode: 'OnBlur',
        defaultValues: {userName: getUserName(), oldPassword: '', newPassword1: '', newPassword2: ''},
    });
    const [ saveMessage, setSaveMessage ] = useState({});

    function onSubmit(data) {
        if (data.newPassword1 != data.newPassword2)
            setError('newPassword2', {type: 'manual', message: 'New passwords must match'});
        else {
            cogChangePasswordAsync(data.oldPassword, data.newPassword1)
                .then( () => {
                    setSaveMessage({ result: 'success', text: 'Password updated' });
                    setEditingState(false);
                    reset();
                })
                .catch( (message) => {
                    setSaveMessage({ result: 'error', text: message });
                });
        }
    }
    const doSubmit = handleSubmit(onSubmit);

    function doCancel() {
        reset();
        setEditingState(false);
    }

    if (formState.isDirty) setEditingState(true);
    
    return (
        <Fragment>
            <form>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="userName" label="Username" disabled={ true } error={ errors.userName } 
                        autoComplete="username" hidden={ true }
                        control={ control } />
                    <FormTextField name="oldPassword" label="Current Password" error= {errors.oldPassword} 
                        type="password" autoComplete="current-password"
                        control={ control } rules={ {required: 'Current password is required'} }/>
                </Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="newPassword1" label="New Password" 
                        type="password" autoComplete="new-password"
                        control={ control } error= {errors.newPassword1} rules={ {required: 'New password is required'} }/>
                    <FormTextField name="newPassword2" label="Confirm Password" error= {errors.newPassword2} 
                        type="password" autoComplete="new-password"
                        control={ control } rules={ {required: 'New password is required'} }/>
                </Box>
            </form>
            <Typography>
                Passwords must be 8 characters or more and contain at least: <br/>
                - one upper case letter <br/>
                - one lower case letter <br/>
                - one digit <br/>
                - one special character <br/>
            </Typography>
            <SaveCancel saveDisabled={ !formState.isDirty } onClick={ (isSave) => { isSave ? doSubmit() : doCancel() } } 
                message={ saveMessage } />
        </Fragment>
    )
}