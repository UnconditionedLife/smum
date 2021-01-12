import React, { Fragment } from 'react';
// import PropTypes from 'prop-types';
import { Box, MenuItem } from '@material-ui/core';
import { FormTextField, SaveCancel } from '../../System';
import { useForm } from "react-hook-form";

export default function FinancialInfoForm(props) {

    let defValues = { ...props.client };
    const { handleSubmit, reset, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: defValues,
    });

    function doSave(values) {
        let clientData = Object.assign({}, props.client);
        Object.assign(clientData, values);
        reset(values);
        alert("Changes saved (not really!)");
    }

    const submitForm = handleSubmit(doSave);

    return (
        <Fragment>
            <form>

                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="financials.income" label="Income" control={control} 
                    rules={ {required: 'Income status required'}} />
                    <FormTextField name="financials.rent" label="Rent"  control={control} 
                    rules={ {required: 'Rent amount required'}} />
                    <FormTextField name="financials.foodStamps" label="Food Stamps" control={control} 
                    rules={ {required: '# of Food Stamps required'}} />
                    <FormTextField name="financials.govtAssistance" label="Govt. Assist" control={control} 
                    rules={ {required: '# of Seniors required'}} />
                </Box>

                <Box>
        </Box>

            </form>

            <SaveCancel disabled={!formState.isDirty} onClick={(isSave) => { isSave ? submitForm() : reset() }} />
        </Fragment>
    );
}
