import React, { Fragment } from 'react';
import { useForm, Controller } from "react-hook-form";

import { Box, Button } from '@material-ui/core';
import { TextField } from '../System';

export default function PasswordForm(props) {
    const { register, handleSubmit, control, errors } = useForm();

    return (
        <Fragment>
            <form>
                <Box>
                    <Controller as={TextField} name="oldPassword" label="Current Password" type="password"
                        defaultValue="" control={ control } register={ register }/>
                </Box>
                <Box>
                    <Controller as={TextField} name="newPassword1" label="New Password" type="password"
                        defaultValue="" control={ control } register={ register }/>
                    <Controller as={TextField} name="newPassword2" label="Confirm Password" type="password"
                        defaultValue="" control={ control } register={ register }/>
                </Box>
            </form>
            <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
                <Button variant="contained" color="primary"
                    disabled={ true } >Change</Button>
            </Box>
        </Fragment>
    )
};
