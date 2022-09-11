import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Box, MenuItem, Typography } from '@mui/material';
import { FormTextField, SaveCancel, FormSelect } from '../../System';
import { useForm } from "react-hook-form";
import { packZipcode, unpackZipcode, validState, validPhone, formatPhone } from '../../System/js/Forms.js';
import { setEditingState  } from '../../System/js/Database';


ClientInfoForm.propTypes = {
    client: PropTypes.object.isRequired,
    saveMessage: PropTypes.object.isRequired,
    saveAndUpdateClient: PropTypes.func.isRequired,
}

export default function ClientInfoForm(props) {
    const { client, saveAndUpdateClient, saveMessage } = props
    let defValues = { ...client };
    defValues.zipcode = packZipcode(defValues.zipcode, defValues.zipSuffix);
    const { handleSubmit, reset, control, errors, setValue, getValues, formState } = useForm({
        mode: 'onBlur',
        defaultValues: defValues,
    });
    const [dob, setDob] = useState(defValues.dob)

    // this hack is required because onchange is not working 
    // with the version of react-hook-form we are using
    useEffect(() => {
        const newDob = getValues().dob
        if (dob !== newDob) {
            setDob(newDob)
            setValue("age", moment().diff(newDob, "years"))
        }
    }, [getValues().dob, dob])

    if (formState.isDirty) setEditingState(true)

    function doSave(values) {
        // Convert form values to canonical format
        values.state = values.state.toUpperCase();
        values.telephone = formatPhone(values.telephone);
        // Overwrite data structure with form values
        let data = Object.assign({}, client);
        Object.assign(data, values);
        Object.assign(data, unpackZipcode(values.zipcode));
        saveAndUpdateClient(data)
        reset(values);
        values.telephone = formatPhone(values.telephone);
    }

    function handleCancel() {
        setEditingState(false)
        reset()
    }

    const submitForm = handleSubmit(doSave);

    return (
        <Fragment>
            <form>
                <Box mt={ 0 } ><Typography>Account Holder</Typography></Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="firstSeenDate" label="First Seen" type="date" disabled={ true } control={ control } error={ errors.firstSeenDate } />

                    <FormTextField name="familyIdCheckedDate" label="ID Checked" type="date" disabled={ true } control={ control } error={ errors.familyIdCheckedDate } />

                    <FormSelect name="isActive" label="Client Status" fieldsize="sm" control={ control } error={ errors.isActive } rules={ {required: 'Required'}} >
                        <MenuItem value="Client">Client</MenuItem>
                        <MenuItem value="NonClient">NonClient</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </FormSelect>
    
                    <FormTextField name="givenName" label="Given Name" fieldsize="md" control={ control } error={ errors.givenName } rules={ {required: 'Required'}} />

                    <FormTextField name="familyName" label="Family Name" fieldsize="md" control={ control } error={ errors.familyName } rules={ {required: 'Required'}} />

                    <FormTextField name="dob" label="Date of Birth" InputLabelProps={{ shrink: true }} control={ control } 
                        error={ errors.dob } type="date" rules={ {required: 'Required'}}/>
                
                    <FormSelect name="gender" label="Gender" fieldsize="sm" control={ control } error={ errors.gender } rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                    </FormSelect>

                    <FormSelect name="ethnicGroup" label="Ethnicity" control={ control } error={ errors.ethnicGroup } rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="Afro-American">Afro-American</MenuItem>
                        <MenuItem value="Anglo-European">Anglo-European</MenuItem>
                        <MenuItem value="Asian/Pacific Islander">Asian/Pacific Islander</MenuItem>
                        <MenuItem value="Filipino">Filipino</MenuItem>
                        <MenuItem value="Latino">Latino</MenuItem>
                        <MenuItem value="Native American">Native American</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </FormSelect>

                    <FormTextField name="age" label="Age" fieldsize="xs" disabled={ true } control={ control } error={ errors.age } />
                </Box>

                {/* ADDRESS */ }
                <Box mt={ 2 } ><Typography>Address</Typography></Box>
        
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormSelect name="homeless" label="Homeless" fieldsize="sm" control={ control } error={ errors.homeless } rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="YES">Yes&nbsp;</MenuItem>
                        <MenuItem value="NO">No&nbsp;&nbsp;&nbsp;</MenuItem>
                    </FormSelect>

                    <FormTextField name="street" label="Street" fieldsize="lg" control={ control } error={ errors.street } rules={ {required: 'Required'}} />
                
                    <FormTextField name="city" label="City" control={ control } error={ errors.city } rules={ {required: 'Required'}} />
                    <FormTextField name="state" label="State" fieldsize="xs" control={ control } error={ errors.state }
                        rules={ {required: 'Required',
                        validate: value => validState(value.toUpperCase()) || 'Invalid'} } />
                    <FormTextField name="zipcode" label="Zipcode" fieldsize="sm" control={ control } error={ errors.zipcode }
                        rules={ {required: 'Required', pattern: {value: /^\d{5}$|^\d{5}-\d{4}$/, 
                        message: 'Invalid'}} } />
                </Box>

                {/* CONTACT */ }
                <Box mt={ 2 } ><Typography>Contact Info</Typography></Box>

                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="telephone" label="Phone" control={ control } error={ errors.telephone }
                        rules={ {validate: value => validPhone(value) || 'Enter a US phone number with area code'} } />
                    <FormTextField name="email" label="Email" fieldsize="xl" control={ control } error={ errors.email } 
                        rules={ {pattern: { value: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                        message: 'Invalid'}} } />
                </Box>
            </form>

            <SaveCancel disabled={!formState.isDirty} onClick={(isSave) => { isSave ? submitForm() : handleCancel() }} 
                message={ saveMessage }/>
        </Fragment>
    );
}