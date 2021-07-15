import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, Dialog, DialogContent, DialogTitle, MenuItem } from '@material-ui/core';
import { isEmpty } from '../../System/js/GlobalUtils';
import { getSvcTypes, getSession, globalMsgFunc } from '../../System/js/Database';
import { FormSelect, FormTextField, SaveCancel } from '../../System';
import { saveHistoryFormAsync, utilRemoveServiceSync } from '../../System/js/Clients/History';

HistoryFormDialog.propTypes = {
    client: PropTypes.object.isRequired,                // current client
    editMode: PropTypes.string.isRequired,              // 'edit' = display form
    handleEditMode: PropTypes.func.isRequired,          // editMode handler
    editRecord: PropTypes.object.isRequired,            // history record being edited
    handleEditRecord: PropTypes.func.isRequired,        // editMode handler
    // handleClientHistory: PropTypes.func.isRequired,     // handles updating history
}

export default function HistoryFormDialog(props) {
    const [ dialogOpen, setDialogOpen ] = useState(true);
    const [ message, setMessage ] = useState(null)
    const userName = getSession().user.userName

    let delayInt

    const serviceNames = getSvcTypes()
        .filter(obj => obj.serviceButtons == "Primary")
        .map(obj => obj.serviceName)

    function handleDialog(state){
        if (!state) { 
            props.handleEditMode('cancel')
        }
        setDialogOpen(state)
    }

    const initValues = props.editRecord
    const { handleSubmit, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: initValues, 
    })

    function doSave(formValues) {
        saveHistoryFormAsync(props.editRecord, formValues, props.client, userName)
            .then( message => {
                const msg = message ? message : undefined
                if (msg === undefined) {
                    globalMsgFunc('success', 'History record was saved!')
                    utilRemoveServiceSync(props.editRecord.serviceId)
                        .then( removeMessage => {
                            console.log("REMOVED:", removeMessage)
                            const removeMsg = message ? message : undefined
                            if (removeMsg === undefined) globalMsgFunc('success', 'Saved and old history record removed!')
                        })
                    handleDialog(false)
                }
            }) 
    }

    // function startMessageTimer(boo){
    //     if (boo === false) {
    //         if (message.severity === 'success') {
    //             // props.handleClientHistory()
    //             handleDialog(false)
    //             props.handleEditMode('cancel')
    //         }
    //         clearTimeout(delayInt)
    //     } else {
    //         delayInt = setTimeout(function(){
    //             startMessageTimer(false)
    //         }, 1200)
    //     }
    // }

    const submitForm = handleSubmit(doSave);

    return (
        <Dialog open={ dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">Edit Service History Record</DialogTitle>
            <DialogContent>
                <Box>
                <form>
                    <FormTextField name="servicedDateTime" label="Service Date/Time" type="datetime-local" fieldsize="xl"
                        error={ errors.servicedDateTime } control={ control } />

                    <FormSelect name="serviceName" label="Service Name" error={ errors.serviceName } 
                        control={ control } rules={ {required: 'Service name is required'}} >
                        { serviceNames.map((item) => (
                            <MenuItem value={ item } key={ item }>{ item }</MenuItem>
                        ))}
                    </FormSelect>

                    <FormSelect width='160px' name="clientStatus" label="Client Status" error={ errors.clientStatus } 
                        control={ control } rules={ {required: 'Homeless is required'}} >
                            <MenuItem value="Client">Client</MenuItem>
                            <MenuItem value="NonClient">NonClient</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                    </FormSelect>
                
                    <FormSelect width='100px' name="homeless" label="Homeless" error={ errors.homeless } 
                        control={ control } rules={ {required: 'Homeless is required'}} >
                            <MenuItem value="YES">YES</MenuItem>
                            <MenuItem value="NO">NO</MenuItem>
                    </FormSelect>
                
                    <FormTextField width='100px' name="itemsServed" label="# Items" error={ errors.itemsServed } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                
                    <FormTextField width='100px' name="totalAdultsServed" label="# Adults" error={ errors.totalAdultsServed } 
                        control={ control } rules={ {required: 'Service name is required'}} />

                    <FormTextField width='100px' name="totalChildrenServed" label="# Children" error={ errors.totalChildrenServed } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                
                    <FormTextField width='100px' name="totalIndividualsServed" label="# Individuals" error={ errors.totalIndividualsServed } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    
                    <FormTextField width='100px' name="totalSeniorsServed" label="# Seniors" error={ errors.totalSeniorsServed } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    
                    <FormTextField width='160px' name="servicedByUserName" label="Serviced By" error={ errors.servicedByUserName } 
                        control={ control } disabled={ true } />
                    </form>
                    <SaveCancel saveDisabled={ !formState.isDirty } message={ message } onClick={ (isSave) => { isSave ? submitForm() : handleDialog(false) } } />
                </Box>
            </DialogContent>
        </Dialog>
    )
}