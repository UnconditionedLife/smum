import React, { Fragment } from 'react';
// import PropTypes from 'prop-types';
import { Box, MenuItem } from '@material-ui/core';
import { FormTextField, SaveCancel } from '../../System';
import { useForm } from "react-hook-form";

export default function FamilyTotalsForm(props) {

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
                    <FormTextField name="family.totalAdults" disabled={ true } label="Adults" type= "number" control={control} 
                    rules={ {required: '# of Adults required'}} />
                    <FormTextField name="family.totalChildren" disabled={ true } label="Children" type= "number" control={control} 
                    rules={ {required: '# of Children equired'}} />
                    <FormTextField name="family.totalOtherDependents" disabled={ true } label="Other Dep." type= "number" control={control} 
                    rules={ {required: '# of Total Dependents required'}} />
                    <FormTextField name="family.totalSeniors" disabled={ true } label="Seniors" type= "number" control={control} 
                    rules={ {required: '# of Seniors required'}} />
                    <FormTextField name="family.totalSize"  disabled={ true } label="Total Size" type= "number" control={control} 
                    rules={ {required: 'Total size is required'}} />
                </Box>

                <Box>
        </Box>

            </form>

            
        </Fragment>
    );
}
