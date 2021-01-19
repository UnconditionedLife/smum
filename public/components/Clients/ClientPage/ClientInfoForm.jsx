import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Box, MenuItem, Typography } from '@material-ui/core';
import { FormTextField, SaveCancel, FormSelect } from '../../System';
import { saveClient } from '../../System/js/Clients/Clients';
import { useForm } from "react-hook-form";
import { packZipcode, unpackZipcode, validState, validPhone, formatPhone } from '../../System/js/Forms.js';
import { dbSetModifiedTime } from '../../System/js/Database';
import { isEmpty } from '../../System/js/GlobalUtils.js';

ClientInfoForm.propTypes = {
    client: PropTypes.object.isRequired,
}

export default function ClientInfoForm(props) {
    const [ saveMessage, setSaveMessage ] = useState({})

    if (isEmpty(saveMessage)) updateMessage("info", "Saved " + moment(props.client.updatedDateTime).fromNow())

    function updateMessage(s, t){
        setSaveMessage({ severity: s, text: t }) // severity: error, warning, info, success
    }
    
    let defValues = { ...props.client };
    defValues.zipcode = packZipcode(defValues.zipcode, defValues.zipSuffix);
    const { handleSubmit, reset, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: defValues,
    });

    function doSave(values) {
        // Convert form values to canonical format
        values.state = values.state.toUpperCase();
        values.telephone = formatPhone(values.telephone);
        // Overwrite data structure with form values
        let data = Object.assign({}, props.client);
        Object.assign(data, values);
        Object.assign(data, unpackZipcode(values.zipcode));
        // Save user data and reset form state to new values
        dbSetModifiedTime(data, false);
        const result = saveClient(data)
        if (result === 'failed') {
            updateMessage("error", "FAILED TO SAVE - try again!")
        } else {
            // UPDATE CLIENT STATE
            updateMessage("info", "Saved " + moment(props.client.updatedDateTime).fromNow())
        }
        reset(values);
        values.telephone = formatPhone(values.telephone);
    }

    const submitForm = handleSubmit(doSave);

    return (
        <Fragment>
            <form>
                <Box mt={ 0 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Account Holder</Typography></Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    {/* <FormTextField name="clientId" label="clientId" control={ control } error={ errors.clientId } 
    rules={ {required: 'Client ID is required'}} /> */}
                    {/* <FormTextField name="updatedDateTime" label="updatedDateTime" control={ control } error={ errors.updatedDateTime } 
                    rules={ {required: 'updatedDateTime is required'}} /> */}
                    {/* <FormTextField name="createdDateTime" label="createdDateTime" control={ control } error={ errors.createdDateTime }
                    rules={ {required: 'createdDateTime is required'}}/>*/}

                    <FormTextField name="firstSeenDate" label="First Seen" type="date" disabled={ true } control={ control } error={ errors.firstSeenDate }
                        rules={ {required: 'First Seen time is required'}} />

                    <FormTextField name="familyIdCheckedDate" label="ID Checked" type="date" disabled={ true } control={ control } error={ errors.familyIdCheckedDate }
                        rules={ {required: 'ID Checked is required'}} />

                    <FormSelect width='150px' name="isActive" label="Client Status" control={ control } error={ errors.isActive }
                        rules={ {required: 'Active Status is required'}} >
                        <MenuItem value="Client">Client</MenuItem>
                        <MenuItem value="NonClient">NonClient</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </FormSelect>
    
                    <FormTextField name="givenName" label="Given Name" fieldsize="md" control={ control } error={ errors.givenName }
                        rules={ {required: 'Given Name is required'}} />

                    <FormTextField name="familyName" label="Family Name" fieldsize="md" control={ control } error={ errors.familyName }
                        rules={ {required: 'Family Name is required'}} />

                    <FormTextField name="dob" label="Date of Birth" control={ control } error={ errors.dob }
                        type="date" rules={ {required: 'DOB is required'}} />
                
                    <FormSelect name="gender" label="Gender" fieldsize="sm" control={ control } error={ errors.gender }
                        rules={ {required: 'Gender is required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                    </FormSelect>

                    <FormSelect name="ethnicGroup" label="Ethnicity" control={ control } error={ errors.ethnicGroup }
                        rules={ {required: 'Ethnicity is required'}} >
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
                <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Address</Typography></Box>
        
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormSelect name="homeless" label="Homeless" fieldsize="xs" control={ control } error={ errors.homeless }
                        rules={ {required: 'Homeless Status is required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="YES">Yes&nbsp;</MenuItem>
                        <MenuItem value="NO">No&nbsp;&nbsp;&nbsp;</MenuItem>
                    </FormSelect>

                    <FormTextField name="street" label="Street" fieldsize="lg" control={ control } error={ errors.street }
                        rules={ {required: 'Street is required'}} />
                
                    <FormTextField name="city" label="City" control={ control } error={ errors.city }
                        rules={ {required: 'City is required'}} />
                    <FormTextField name="state" label="State" fieldsize="xs" control={ control } error={ errors.state }
                        rules={ {required: 'State is required',
                        validate: value => validState(value.toUpperCase()) || 'Invalid state'} } />
                    <FormTextField name="zipcode" label="Zipcode" fieldsize="sm" control={ control } error={ errors.zipcode }
                        rules={ {required: 'Zip code is required', pattern: {value: /^\d{5}$|^\d{5}-\d{4}$/, 
                        message: 'Invalid zip code'}} } />
                </Box>

                {/* CONTACT */ }
                <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Contact Info</Typography></Box>

                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="telephone" label="Phone" control={ control } error={ errors.telephone }
                        rules={ {validate: value => validPhone(value) || 'Enter a US phone number with area code'} } />
                    <FormTextField name="email" label="Email" fieldsize="xl" control={ control } error={ errors.email } />
                </Box>
            </form>

            <SaveCancel disabled={!formState.isDirty} onClick={(isSave) => { isSave ? submitForm() : reset() }} 
                message={ saveMessage }/>
        </Fragment> 
    );
}