import React, { Fragment, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { Box } from '@material-ui/core';
import { TextField, SaveCancel } from '../System';

export default function UserForm(props) {
    const [modified, setModified] = useState(false);

    const { register, handleSubmit, reset, control, errors } = useForm();

    function doSave(data) {
        alert("Saving " + JSON.stringify(data));
        setModified(false);
    }

    function saveError(data, e) {
        alert("Error" + JSON.stringify(data))
    }

    function saveAction(isSave) {
        if (isSave) 
            handleSubmit(data => doSave(data), data => saveError(data)); 
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
                <Box>
                    <Controller as={TextField} name="givenName" label="Given Name" defaultValue={ props.user.givenName } 
                        control={ control } register={ register }/>
                    <Controller as={TextField} name="familyName" label="Family Name" defaultValue={ props.user.familyName } 
                        control={ control } register={ register }/>
                    <Controller as={TextField} name="dob" label="Date of Birth" type="date" defaultValue={ props.user.dob }
                        control={ control } register={ register }/>
                </Box>
                <Box>
                    <Controller as={TextField} name="street" label="Street" defaultValue={ props.user.street }
                        control={ control } register={ register }/>
                    <Controller as={TextField} name="city" label="City" defaultValue={ props.user.city }
                        control={ control } register={ register }/>
                    <Controller as={TextField} name="state" label="State" defaultValue={ props.user.state }
                        control={ control } register={ register }/>
                    <Controller as={TextField} name="zipcode" label="Zip Code" defaultValue={ buildZipcode(props.user) }
                        control={ control } register={ register }/>
                </Box>
                <Box>
                    <Controller as={TextField} name="telephone" label="Telephone" defaultValue={ props.user.telephone }
                        control={ control } register={ register }/>
                    <Controller as={TextField} name="email" label="Email" defaultValue={ props.user.email }
                        control={ control } register={ register }/>
                </Box>
            </form>
            {/* <button onClick={ () => {setModified(true);} }>Modify</button><br/> */}
            <SaveCancel saveDisabled={true} onClick={ (isSave) => { saveAction(isSave) } } />
        </Fragment>
    )
};
