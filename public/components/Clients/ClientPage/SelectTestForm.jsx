import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box } from '@material-ui/core';
import { FormField, FormSelect, SaveCancel, Select } from '../../System';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';


export default function TestForm(props) {
    let defValues = { ...props.client };
    const { handleSubmit, reset, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: defValues, 
    });

    console.log(control)

    function doSave(values) {
        // let userData = Object.assign({}, props.user);
        // values.state = values.state.toUpperCase();
        // values.telephone = formatPhone(values.telephone);
        // Object.assign(userData, values);
        // Object.assign(userData, unpackZipcode(values.zipcode));
        // reset(values);
        // alert("Changes saved (not really!)");
    }

    const submitForm = handleSubmit(doSave);

    const genderOptions = [ 
        {value: 'female', label: 'Female'},
        {value: 'male', label: 'Male'},
        {value: 'undefined', label: 'Undefined'}
    ]

    return (
        <Fragment>
            <form>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormField name="givenName" label="Given Name" error={ errors.givenName } 
                        control={ control } rules={ {required: 'Given name is required'}} />
                    <FormField name="familyName" label="Family Name" error={ errors.familyName } 
                        control={ control } rules={ {required: 'Family name is required'}} />
                    <InputLabel id="demo-simple-select-outlined-label">Gender</InputLabel>
                    <FormSelect name="gender" label="Gender" error={ errors.givenName } 
                        control={ control } labelId="demo-simple-select-outlined-label" >
                            <option value=''>None</option>
                            <option value='Female'>Female</option>
                            <option value='Male'>Male</option>
                            <option value='Undefined'>Undefined</option>
                    </FormSelect>

                    {/* Possible solution for using Select with RFH:
                    https://codesandbox.io/s/rhf-mui-select-tqe89 */}
                </Box>
            </form>
            <SaveCancel disabled={ !formState.isDirty } onClick={ (isSave) => { isSave ? submitForm() : reset() } } />
            {/* <Box>
                <FormControl>
                    <InputLabel id="demo-simple-select-outlined-label">Age</InputLabel>
                    <Select native label='Gender' value={ props.client.gender }
                        inputProps={{ name: 'gender' }} labelId="demo-simple-select-outlined-label">
                        <option value=''>None</option>
                        <option value='Female'>Female</option>
                        <option value='Male'>Male</option>
                        <option value='Undefined'>Undefined</option>
                    </Select>
                </FormControl>
            </Box> */}
        </Fragment>
    );
}

TestForm.propTypes = {
    client: PropTypes.object,
}