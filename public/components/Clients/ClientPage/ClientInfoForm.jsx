import React, { Fragment } from 'react';
// import PropTypes from 'prop-types';
import { Box, MenuItem, Typography } from '@material-ui/core';
import { FormTextField, SaveCancel, FormSelect } from '../../System';
import { useForm } from "react-hook-form";
import { packZipcode, unpackZipcode, validState, validPhone, formatPhone } from '../../System/js/Forms.js';

export default function ClientInfoForm(props) {

    let defValues = { ...props.client };
    const { handleSubmit, reset, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: defValues,
    });

    function doSave(values) {
        let clientData = Object.assign({}, props.client);
        Object.assign(clientData, values);
        reset(values);
        values.telephone = formatPhone(values.telephone);
        alert("Changes saved (not really!)");
    }

    const submitForm = handleSubmit(doSave);

    return (
        <Fragment>
            <form>

                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    {/* <FormTextField name="clientId" label="clientId" control={control} error={ errors.clientId } 
    rules={ {required: 'Client ID is required'}} /> */}
                    {/* <FormTextField name="updatedDateTime" label="updatedDateTime" control={control} error={ errors.updatedDateTime } 
                    rules={ {required: 'updatedDateTime is required'}} /> */}
                    {/* <FormTextField name="createdDateTime" label="createdDateTime" control={control} error={ errors.createdDateTime }
                    rules={ {required: 'createdDateTime is required'}}/>*/}

                    <FormTextField name="firstSeenDate" label="First Seen" type="date" control={control} error={ errors.firstSeenDate }
                    rules={ {required: 'First Seen time is required'}} />
                    <FormTextField name="familyIdCheckedDate" label="ID Checked" type="date" control={control} error={ errors.familyIdCheckedDate }
                    rules={ {required: 'ID Checked is required'}} />
                    <FormSelect name="isActive" label="Active Status" control={control} error={ errors.isActive }
                    rules={ {required: 'Active Status is required'}} >
                        <MenuItem value="Client">Client</MenuItem>
                        <MenuItem value="NonClient">NonClient</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </FormSelect>
                </Box>

                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="givenName" label="Given Name" control={control} error={ errors.givenName }
                    rules={ {required: 'Given Name is required'}} />
                    <FormTextField name="familyName" label="Family Name" control={control} error={ errors.familyName }
                    rules={ {required: 'Family Name is required'}} />
                    <FormTextField name="dob" label="DOB" control={control} error={ errors.dob }
                    type="date" rules={ {required: 'DOB is required'}} />
                </Box>

                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormSelect name="gender" label="Gender" control={control} error={ errors.gender }
                    rules={ {required: 'Gender is required'}} >
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                    </FormSelect>
                    <FormSelect name="ethnicGroup" label="Ethnicity" control={control} error={ errors.ethnicGroup }
                    rules={ {required: 'Ethnicity is required'}} >
                        <MenuItem value="Afro-American">Afro-American</MenuItem>
                        <MenuItem value="Anglo-European">Anglo-European</MenuItem>
                        <MenuItem value="Asian/Pacific Islander">Asian/Pacific Islander</MenuItem>
                        <MenuItem value="Filipino">Filipino</MenuItem>
                        <MenuItem value="Latino">Latino</MenuItem>
                        <MenuItem value="Native American">Native American</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </FormSelect>
                    <FormTextField name="clientAge" label="Age" control={control} error={ errors.clientAge }
                    rules={ {required: 'Age is required'}} />
                </Box>

                <Box display="flex" flexDirection="row" flexWrap="wrap">
                <Typography>
                Address
                </Typography>
                </Box>
        
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                
                
                    <FormSelect pr="50px" name="homeless" label="Homeless" control={control} error={ errors.homeless }
                    rules={ {required: 'Homeless Status is required'}} >
                        <MenuItem value="YES">Yes</MenuItem>
                        <MenuItem value="NO">No</MenuItem>

                    </FormSelect>

                    <FormTextField name="street" label="Street" control={control} error={ errors.street }
                    rules={ {required: 'Street is required'}} />
                </Box>

                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="city" label="City" control={control} error={ errors.city }
                    rules={ {required: 'City is required'}} />
                    <FormTextField name="state" label="State" control={control} error={ errors.state }
                    rules={ {required: 'State is required'}} />
                    <FormTextField name="zipcode" label="Zipcode" control={control} error={ errors.zipcode }
                    rules={ {required: 'Zipcode is required'}} />
                </Box>

                <Box display="flex" flexDirection="row" flexWrap="wrap">
                <Typography>
                Contact Info
                </Typography>
                </Box>

                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="telephone" label="Phone" control={control} error={ errors.telephone }
                    rules={ {validate: value => validPhone(value) || 'Enter a US phone number with area code'} } />
                    <FormTextField name="email" label="Email" control={control} error={ errors.email }
                    rules={ {required: 'Email is required'}} />
                </Box>

                <Box> 
        </Box>

    </form>

            <SaveCancel disabled={!formState.isDirty} onClick={(isSave) => { isSave ? submitForm() : reset() }} />
        </Fragment> 
    );
}