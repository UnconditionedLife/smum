import React, { Fragment, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { Box } from '@material-ui/core';
import { TextField, FormField, SaveCancel } from '../System';

export default function UserForm(props) {

    const { register, handleSubmit, reset, control, formState } = useForm();

    function doSave(data) {
        alert("Saving " + JSON.stringify(data));
    }

    function saveError(data, e) {
        alert("Error" + JSON.stringify(data))
    }

    function saveAction(isSave) {
        if (isSave) {
            console.log("Saving form");
            handleSubmit(data => doSave(data), data => saveError(data)); 
        }
        else 
            reset();
    }

    function buildZipcode(user) {
        let zip = user.zipcode;
        if (user.zipSuffix > 0)
            zip += "-" + user.zipSuffix;
        return zip;
    }

    return (
        <Fragment>
            <form>
                <Box display="flex" flexDirection="row">
                    <FormField name="givenName" label="Given Name" defaultValue={ props.user.givenName } 
                        control={ control } />
                    <FormField name="familyName" label="Family Name" defaultValue={ props.user.familyName } 
                        control={ control } />
                    <FormField name="dob" label="Date of Birth" type="date" defaultValue={ props.user.dob }
                        control={ control } />
                </Box>
                <Box display="flex" flexDirection="row">
                    <FormField name="street" label="Street" defaultValue={ props.user.street }
                        control={ control } />
                    <FormField name="city" label="City" defaultValue={ props.user.city }
                        control={ control } />
                    <FormField name="state" label="State" defaultValue={ props.user.state }
                        control={ control } />
                    <FormField name="zipcode" label="Zip Code" defaultValue={ buildZipcode(props.user) }
                        control={ control } />
                </Box>
                <Box display="flex" flexDirection="row">
                    <FormField name="telephone" label="Telephone" defaultValue={ props.user.telephone }
                        control={ control } />
                    <FormField name="email" label="Email" defaultValue={ props.user.email }
                        control={ control } />
                </Box>
            </form>
            <p>STATE: { JSON.stringify(formState) }</p>
            <SaveCancel disabled={ !formState.isDirty } onClick={ (isSave) => { saveAction(isSave) } } />
        </Fragment>
    )
};
