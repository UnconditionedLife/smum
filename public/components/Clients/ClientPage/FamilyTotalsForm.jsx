import React, { Fragment } from 'react';
import { Box } from '@material-ui/core';
import { FormTextField, SaveCancel } from '../../System';
import { useForm } from "react-hook-form";

export default function ClientInfoForm(props) {

    //  let defValues = { ...props.client };
    // const { handleSubmit, reset, control, errors, formState } = useForm({
    //     mode: 'onBlur',
    //     defaultValues: defValues,
    // });

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
                    <FormTextField name="family.totalAdult" label="Adults" type= "number" control={control} error={ errors.family.totalAdults }
                    rules={ {required: '# of Adults required'}} />
                    <FormTextField name="family.totalChildren" label="Children" type= "number" control={control} error={ errors.family.totalChildren }
                    rules={ {required: '# of Children equired'}} />
                    <FormTextField name="family.totalOtherDependents" label="Other Dep." type= "number" control={control} error={ errors.family.totalOtherDependents }
                    rules={ {required: '# of Total Dependents required'}} />
                    <FormTextField name="family.totalSeniors" label="Seniors" type= "number" control={control} error={ errors.family.totalSeniors }
                    rules={ {required: '# of Seniors required'}} />
                    <FormTextField name="family.totalSize" label="Total Size" type= "number" control={control} error={ errors.family.totalSize }
                    rules={ {required: 'Total size is required'}} />
                </Box>

                <Box>
                    JSON.stringify(props.client);
        </Box>

            </form>

            <SaveCancel disabled={!formState.isDirty} onClick={(isSave) => { isSave ? submitForm() : reset() }} />
        </Fragment>
    );
}
