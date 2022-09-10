import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, Dialog, DialogContent, DialogTitle, MenuItem } from '@material-ui/core';
import { getSvcTypes, globalMsgFunc, getUserName } from '../../System/js/Database';
import { FormSelect, FormTextField, SaveCancel } from '../../System';
import { saveHistoryFormAsync, removeSvcAsync, checkSvcCounts } from '../../System/js/Clients/History';

HistoryFormDialog.propTypes = {
    client: PropTypes.object.isRequired,                // current client
    editMode: PropTypes.string.isRequired,              // 'edit' = display form
    handleEditMode: PropTypes.func.isRequired,          // editMode handler
    editRecord: PropTypes.object.isRequired,            // history record being edited
    handleEditRecord: PropTypes.func.isRequired,        // editMode handler
    updateClient: PropTypes.func.isRequired,
}

export default function HistoryFormDialog(props) {
    const { editRecord, updateClient, client, handleEditMode } = props
    const [ dialogOpen, setDialogOpen ] = useState(true);
    
    const svcNames = getSvcTypes()
        // .filter(obj => obj.svcBtns == "Primary")   // removed to allow for changing secondary services
        .map(obj => obj.svcName)

    function handleDialog(state){
        if (!state) { 
            handleEditMode('cancel')
        }
        setDialogOpen(state)
    }

    const initValues = editRecord
    const { handleSubmit, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: initValues, 
    })

    function doSave(formValues) {
        // check if counts are valid
        if (checkSvcCounts(formValues) === false) {
            globalMsgFunc('error', 'Individuals must equal sum of Children, Adults, and Seniors!')
            return null
        }
        
        saveHistoryFormAsync(editRecord, formValues, client, getUserName())
            .then( savedSvc => {
                if (savedSvc !== null) { 
                    // update client history to reflect edits
                    const tempClient = Object.assign({}, client)
                    const index = tempClient.svcHistory.findIndex((svc) => svc.svcId === editRecord.svcId)
                    tempClient.svcHistory[index] = savedSvc
                    updateClient(tempClient)
                    const oldRecord = Object.assign({}, editRecord)
                    removeSvcAsync(client, oldRecord)
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
                    <FormTextField name="svcDT" label="Service Date/Time" type="datetime-local" fieldsize="xl"
                        error={ errors.svcDT } control={ control } />

                    <FormSelect name="svcName" label="Service Name" error={ errors.svcName } 
                        control={ control } rules={ {required: 'Service name is required'}} >
                        { svcNames.map((item) => (
                            <MenuItem value={ item } key={ item }>{ item }</MenuItem>
                        ))}
                    </FormSelect>

                    <FormSelect width='160px' name="cStatus" label="Client Status" error={ errors.cStatus } 
                        control={ control } rules={ {required: 'Homeless is required'}} >
                            <MenuItem value="Client">Client</MenuItem>
                            <MenuItem value="NonClient">NonClient</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                    </FormSelect>
                
                    <FormSelect width='100px' name="homeless" label="Homeless" error={ errors.homeless } 
                        control={ control } rules={ {required: 'Homeless is required'}} >
                            <MenuItem value={ true }>YES</MenuItem>
                            <MenuItem value={ false }>NO</MenuItem>
                    </FormSelect>
                
                    <FormTextField width='100px' name="svcItems" label="# Items" error={ errors.svcItems } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                
                    <FormTextField width='100px' name="adults" label="# Adults" error={ errors.adults } 
                        control={ control } rules={ {required: 'Service name is required'}} />

                    <FormTextField width='100px' name="children" label="# Children" error={ errors.children } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                
                    <FormTextField width='100px' name="individuals" label="# Individuals" error={ errors.individuals } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    
                    <FormTextField width='100px' name="seniors" label="# Seniors" error={ errors.seniors } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    
                    <FormTextField width='160px' name="svcBy" label="Serviced By" error={ errors.svcBy } 
                        control={ control } disabled={ true } />
                    </form>
                    <SaveCancel saveDisabled={ !formState.isDirty } onClick={ (isSave) => { isSave ? submitForm() : handleDialog(false) } } />
                </Box>
            </DialogContent>
        </Dialog>
    )
}