import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Box, InputAdornment, Typography } from '@mui/material';
import { FormTextField, SaveCancel } from '../../System';
import { useForm } from "react-hook-form";
import { setEditingState } from '../../System/js/Database';

FinancialInfoForm.propTypes = {
    client: PropTypes.object.isRequired,
    saveMessage: PropTypes.object.isRequired,
    saveAndUpdateClient: PropTypes.func.isRequired,
}

export default function FinancialInfoForm(props) {

    let defValues = { ...props.client };
    const { handleSubmit, reset, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: defValues,
    });

    if (formState.isDirty) setEditingState(true)

    function doSave(values) {
        let data = Object.assign({}, props.client);
        Object.assign(data, values);
        const saved = props.saveAndUpdateClient(data)
        reset(values);
    }

    function handleCancel() {
        setEditingState(false)
        reset()
    }

    const submitForm = handleSubmit(doSave);

    return (
        <Fragment>
            <form>
                <Box mt={ 2 } ><Typography>Monthly Amounts</Typography></Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="financials.income" label="Income" control={control} fieldsize="sm"
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> } } 
                        rules={ {required: 'Required'}} />
                    <FormTextField name="financials.rent" label="Rent"  control={control} fieldsize="sm"
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> } } 
                        rules={ {required: 'Required'}} />
                    <FormTextField name="financials.foodStamps" label="Food Stamps" control={control} fieldsize="sm"
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> } } 
                        rules={ {required: 'Required'}} />
                    <FormTextField name="financials.govtAssistance" label="Govt. Assist" control={control} fieldsize="sm"
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> } } 
                        rules={ {required: 'Required'}} />
                </Box>
            </form>

            <SaveCancel disabled={!formState.isDirty} onClick={(isSave) => { isSave ? submitForm() : handleCancel() }}
                message={ props.saveMessage } />
        </Fragment>
    );
}
