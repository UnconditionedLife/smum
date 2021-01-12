import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, Dialog, DialogContent, DialogTitle, MenuItem } from '@material-ui/core';
import { isEmpty } from '../../System/js/GlobalUtils';
import { FormSelect, FormTextField, SaveCancel } from '../../System';
import { saveHistoryForm } from '../../System/js/Clients';

DependentsFormDialog.propTypes = {
    session: PropTypes.object.isRequired,
    client: PropTypes.object.isRequired,                // current client
    // editMode: PropTypes.string.isRequired,              // 'edit' = display form
    handleEditMode: PropTypes.func.isRequired,          // editMode handler
    editRecord: PropTypes.object.isRequired,            // history record being edited
    handleEditRecord: PropTypes.func.isRequired,        // editMode handler
    // handleClientHistory: PropTypes.func.isRequired,     // handles updating history
}

export default function DependentsFormDialog(props) {
    const [ dialogOpen, setDialogOpen ] = useState(true);
    const [ message, setMessage ] = useState(null)

    let delayInt

    

    function handleDialog(state){
        if (dialogOpen !== state) setDialogOpen(state)
    }

    const initValues = props.editRecord
    const { handleSubmit, reset, control, errors, setError, formState } = useForm({
        mode: 'onBlur',
        defaultValues: initValues, 
    })

    function doSave(formValues) {
        const newService = saveHistoryForm(props.editRecord, formValues, props.client, props.session.user.userName)
        startMessageTimer(true)
        if (!isEmpty(newService)) {
            setMessage({text: 'Dependents form was saved!', severity: 'success'})
        } else {
            setMessage({text: 'Error while saving - try again!!', severity: 'error'})
        }
    }

    function startMessageTimer(boo){
        if (boo === false) {
            if (message.severity === 'success') {
                // props.handleClientHistory()
                handleDialog(false)
                props.handleEditMode('cancel')
            }
            clearTimeout(delayInt)
        } else {
            delayInt = setTimeout(function(){
                startMessageTimer(false)
            }, 1200)
        }
    }

    const submitForm = handleSubmit(doSave);

    return (
        <Dialog open={ dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">Edit Dependents Record</DialogTitle>
            <DialogContent>
                <Box>
                <form>
                    <FormTextField width='160px' name="givenName" label="Given Name" control = {control}
                    error={ errors.givenName } rules={ {required: 'Given name is required'}}/>
                    <FormTextField width='160px' name="familyName" label="Family Name" control = {control}
                    error={ errors.familyName } rules={ {required: 'Family name is required'}}/>

                    <FormSelect width='160px' name="relationship" label= "Relationship" control ={control}
                    error={ errors.relationship } rules={ {required: 'Relationship is required'}}>
                        <MenuItem value="Spouse">Spouse</MenuItem>
                        <MenuItem value="Child">Child</MenuItem>
                        <MenuItem value="Parent">Parent</MenuItem>
                        <MenuItem value="Grandparent">Grandparent</MenuItem>
                        <MenuItem value="Sibling">Sibling</MenuItem>
                        <MenuItem value="Grandchild">Grandchild</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </FormSelect>

                    <FormSelect width='160px' name="gender" label="Gender" error={ errors.gender } 
                        control={ control } rules={ {required: 'Gender is required'}} >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                    </FormSelect>

                    <FormTextField width='170px' name="dob" type="date" label="DOB" control={control}
                    error={ errors.dob } rules={ {required: 'DOB is required'}}/>
                    <FormTextField width='60px' name="age" label="Age" control={control}
                    error={ errors.age } rules={ {required: 'Age is required'}}/>
                    

                    <FormSelect width='80px' name="grade" label="Grade" control={control}
                    error={ errors.grade } rules={ {required: 'grade is required'}}>
                        <MenuItem value="None">None</MenuItem>
                        <MenuItem value="Pre-K">Pre-K</MenuItem>
                        <MenuItem value="K">K</MenuItem>
                        <MenuItem value="1st">1st</MenuItem>
                        <MenuItem value="2nd">2nd</MenuItem>
                        <MenuItem value="3rd">3rd</MenuItem>
                        <MenuItem value="4th">4th</MenuItem>
                        <MenuItem value="5th">5th</MenuItem>
                        <MenuItem value="6th">6th</MenuItem>
                        <MenuItem value="7th">7th</MenuItem>
                        <MenuItem value="8th">8th</MenuItem>
                        <MenuItem value="9th">9th</MenuItem>
                        <MenuItem value="10th">10th</MenuItem>
                        <MenuItem value="11th">11th</MenuItem>
                        <MenuItem value="12th">12th</MenuItem>
                    </FormSelect>
                    
                    <FormSelect width='160px' name="isActive" label="Status" error={ errors.isActive } 
                        control={ control } rules={ {required: 'Status is required'}} >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                    </FormSelect>   

                    </form>
                    <SaveCancel saveDisabled={ !formState.isDirty } message={ message } onClick={ (isSave) => { isSave ? submitForm() : handleDialog(false) } } />
                </Box>
            </DialogContent>
        </Dialog>
    )
}