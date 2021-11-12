import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, Dialog, DialogContent, DialogTitle, MenuItem } from '@material-ui/core';
import { getSvcTypes, getSession, globalMsgFunc } from '../../System/js/Database';
import { FormSelect, FormTextField, SaveCancel } from '../../System';
import { saveHistoryFormAsync, removeSvcAsync, updateLastServed } from '../../System/js/Clients/History';

HistoryFormDialog.propTypes = {
    client: PropTypes.object.isRequired,                // current client
    editMode: PropTypes.string.isRequired,              // 'edit' = display form
    handleEditMode: PropTypes.func.isRequired,          // editMode handler
    editRecord: PropTypes.object.isRequired,            // history record being edited
    handleEditRecord: PropTypes.func.isRequired,        // editMode handler
    updateClient: PropTypes.func.isRequired,
    // handleClientHistory: PropTypes.func.isRequired,     // handles updating history
}

export default function HistoryFormDialog(props) {
    const editRecord = props.editRecord
    const updateClient = props.updateClient
    const client = props.client
    const [ dialogOpen, setDialogOpen ] = useState(true);
    // const [ message, setMessage ] = useState(null)
    const userName = getSession().user.userName

    const serviceNames = getSvcTypes()
        .filter(obj => obj.serviceButtons == "Primary")
        .map(obj => obj.serviceName)

    function handleDialog(state){
        if (!state) { 
            props.handleEditMode('cancel')
        }
        setDialogOpen(state)
    }

    const initValues = editRecord
    const { handleSubmit, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: initValues, 
    })

    function doSave(formValues) {
        saveHistoryFormAsync(editRecord, formValues, props.client, userName)
            .then( savedSvc => {
                if (savedSvc !== null) { 
                    // update client history to reflect edits
                    const tempClient = Object.create(client)
                    const index = tempClient.svcHistory.findIndex((svc) => svc.serviceId === editRecord.serviceId)
                    tempClient.svcHistory[index] = savedSvc
                    if (savedSvc.serviceButtons === 'primary') updateLastServed(client)
                    updateClient(tempClient)
                    const oldRecord = Object.assign({}, editRecord)
                    removeSvcAsync(oldRecord)
                        .then( oldSvc => {
                            if (oldSvc !== null) { 
                                globalMsgFunc('success', 'Saved changes and archived old history record!')
                                handleDialog(false)
                            } else {
                                globalMsgFunc('error', 'Failed to removed old service history!')
                            }
                        })
                } else {
                    globalMsgFunc('error', 'Failed to save edited service history!')
                }
            }) 
    }

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
                    <SaveCancel saveDisabled={ !formState.isDirty } onClick={ (isSave) => { isSave ? submitForm() : handleDialog(false) } } />
                </Box>
            </DialogContent>
        </Dialog>
    )
}