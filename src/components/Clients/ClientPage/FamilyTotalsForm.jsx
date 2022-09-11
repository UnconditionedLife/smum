import React from 'react';
// import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { FormTextField, SaveCancel } from '../../System';
import { useForm } from "react-hook-form";

export default function FamilyTotalsForm(props) {

    let defValues = { ...props.client };
    const { handleSubmit, reset, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: defValues,
    });

    function doSave(values) {
    }

    const submitForm = handleSubmit(doSave);

    return (
        <Box display="flex" flexDirection="row" flexWrap="wrap">
            <form>
            <FormTextField name="family.totalAdults" disabled={ true } label="Adults" fieldsize="xs" type= "number" control={control} />
            <FormTextField name="family.totalChildren" disabled={ true } label="Children" fieldsize="xs" type= "number" control={control} />
            <FormTextField name="family.totalOtherDependents" disabled={ true } label="Other Dep." fieldsize="xs" type= "number" control={control} />
            <FormTextField name="family.totalSeniors" disabled={ true } label="Seniors" fieldsize="xs" type= "number" control={control} />
            <FormTextField name="family.totalSize" disabled={ true } label="Total Size" fieldsize="xs" type= "number" control={control} />
            </form>
        </Box>
    );
}
