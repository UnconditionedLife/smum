import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, MenuItem } from '@mui/material';
import { FormTextField, FormSelect, SaveCancel } from '../../System';

export default function TestForm(props) {
    let defValues = { ...props.client };
    const { handleSubmit, reset, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: defValues, 
    });

    function doSave(values) {
        // let userData = Object.assign({}, props.user);
        // values.state = values.state.toUpperCase();
        // values.telephone = formatPhone(values.telephone);
        // Object.assign(userData, values);
        // Object.assign(userData, unpackZipcode(values.zipcode));
        // reset(values);
        // alert("Changes saved (not really!)");
        alert('Saving: ' + JSON.stringify(values))
    }

    const submitForm = handleSubmit(doSave);

    return (
        <Fragment>
            <form>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="givenName" label="Given Name" error={ errors.givenName } 
                        control={ control } rules={ {required: 'Given name is required'}} />
                    <FormTextField name="familyName" label="Family Name" error={ errors.familyName } 
                        control={ control } rules={ {required: 'Family name is required'}} />
                    <FormSelect name="gender" label="Gender" width="100px" error={ errors.gender } 
                        control={ control } rules={ {required: 'Gender is required'} }>
                            <MenuItem value=''>None</MenuItem>
                            <MenuItem value='Female'>Female</MenuItem>
                            <MenuItem value='Male'>Male</MenuItem>
                            <MenuItem value='Undefined'>Undefined</MenuItem>
                    </FormSelect>

                    {/* Possible solution for using Select with RFH:
                    https://codesandbox.io/s/rhf-mui-select-tqe89 */}
                </Box>
            </form>
            <SaveCancel disabled={ !formState.isDirty } onClick={ (isSave) => { isSave ? submitForm() : reset() } } />
        </Fragment>
    );
}

TestForm.propTypes = {
    client: PropTypes.object,
}