import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, Button } from '@material-ui/core';
import { FormTextField } from '../System';

PasswordForm.propTypes = {
    session: PropTypes.object.isRequired,
}

export default function PasswordForm(props) {
    const { reset, handleSubmit, control, formState, errors, setError } = useForm({
        mode: 'OnBlur',
        defaultValues: {oldPassword: '', newPassword1: '', newPassword2: ''},
    });

    function onSubmit(data) {
        // TODO: validate current password
    
        if (data.newPassword1 != data.newPassword2)
            setError('newPassword2', {type: 'manual', message: 'New passwords must match'});
        else {
            alert('Password changed to ' + data.newPassword1 + ' (not really!)');
            reset();
        }
    }
    
    return (
        <Fragment>
            <form>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
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
            <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
                <Button variant="contained" color="primary" onClick={ handleSubmit(onSubmit) }
                    disabled={ !formState.isDirty } >Change</Button>
            </Box>
        </Fragment>
    )
}