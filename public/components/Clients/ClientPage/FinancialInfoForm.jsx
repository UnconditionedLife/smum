import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Box, InputAdornment, Typography } from '@material-ui/core';
import { FormTextField, SaveCancel } from '../../System';
import { useForm } from "react-hook-form";

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

    function doSave(values) {
        let data = Object.assign({}, props.client);
        Object.assign(data, values);
        const saved = props.saveAndUpdateClient(data)
        reset(values);
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

            <SaveCancel disabled={!formState.isDirty} onClick={(isSave) => { isSave ? submitForm() : reset() }}
                message={ props.saveMessage } />
        </Fragment>
    );
}
