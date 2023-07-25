import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, Dialog, DialogContent, DialogTitle, MenuItem } from '@mui/material';
import { FormSelect, FormTextField, SaveCancel } from '../../System';
import { setEditingState } from '../../System/js/Database';
import cuid from 'cuid';
import moment from 'moment';

DependentsFormDialog.propTypes = {
    client: PropTypes.object.isRequired,                // current client
    saveMessage: PropTypes.object.isRequired,
    editRecord: PropTypes.object,                       // history record being edited
    handleEditRecord: PropTypes.func.isRequired,        // editMode handler
    saveAndUpdateClient: PropTypes.func.isRequired,     // saving and updateing client handler
    selectedDependent: PropTypes.string,
    setAnchorEl: PropTypes.func.isRequired,
    setSelectedDependent: PropTypes.func.isRequired
}

export default function DependentsFormDialog(props) {
    const { client, selectedDependent, saveAndUpdateClient, saveMessage, 
        handleEditRecord, setAnchorEl, setSelectedDependent  } = props
    const [ dialogOpen, setDialogOpen ] = useState(true);
    const dependent = getDependent(selectedDependent)
    const defValues = dependent;
    const { handleSubmit, reset, watch, setValue, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: defValues,
    });

    const dob = watch("dob")

    React.useEffect(() => {
        if (dob) {
            setValue("age", moment().diff(dob, "years"))
        }

      }, [dob, setValue]);


    if (dialogOpen) setEditingState(true)

    function doSave(values) {
        const data = Object.assign({}, client);
        if (selectedDependent === "new") {
            // insert new dependent data
            const now = moment().format('YYYY-MM-DDTHH:mm');
            const newDep = {
                depId: cuid(),
                createdDateTime: now, 
                updatedDateTime: now,
                age: ""
            }
            Object.assign(newDep, values);
            data.dependents.push(newDep)
        } else {
            // Overwrite data structure with form values
            data.dependents.forEach((dep, i) => {
                if (dep.depId === selectedDependent) {
                    Object.assign(data.dependents[i], values);
                }
            })
        }
        saveAndUpdateClient(data)
        handleCancel()
    }

    function getDependent(depId) {
        if (depId === "new") {
            
            return {
                age: "", dob: "", familyName: "", gender: "", givenName: "",
                grade: "None", gradeDateTime: "", isActive: "Active", relationship: ""
            }
        } else {
            const depArr = client.dependents.filter((dep) => {
                if (dep.depId === depId) return true
                return false
            })
            return depArr[0]
        }
    }

    function handleCancel() {
        setEditingState(false)
        // if (dialogOpen !== false) setDialogOpen(false)
        setDialogOpen(false)
        handleEditRecord(null)
        setAnchorEl(null)
        setSelectedDependent(null)
        reset()
    }

    const submitForm = handleSubmit(doSave); 

    return (
        <Dialog open={ dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">Edit Dependents Record</DialogTitle>
            <DialogContent>
                <Box>
                <form>
                    <FormTextField name="givenName" label="Given Name" fieldsize="md" control = {control}
                        error={ errors.givenName } rules={ {required: 'Required'}}/>

                    <FormTextField name="familyName" label="Family Name" fieldsize="md" control = {control}
                        error={ errors.familyName } rules={ {required: 'Required'}}/>

                    <FormSelect name="relationship" label= "Relationship" fieldsize="md" control ={control}
                        error={ errors.relationship } rules={ {required: 'Required'}}>
                            <MenuItem value="">&nbsp;</MenuItem>
                            <MenuItem value="Spouse">Spouse</MenuItem>
                            <MenuItem value="Child">Child</MenuItem>
                            <MenuItem value="Parent">Parent</MenuItem>
                            <MenuItem value="Grandparent">Grandparent</MenuItem>
                            <MenuItem value="Sibling">Sibling</MenuItem>
                            <MenuItem value="Grandchild">Grandchild</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                    </FormSelect>

                    <FormSelect name="gender" label="Gender" fieldsize="sm" error={ errors.gender } 
                        control={ control } rules={ {required: 'Required'}} >
                            <MenuItem value="">&nbsp;</MenuItem>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                    </FormSelect>

                    <FormTextField name="dob" type="date" label="Date of Birth" fieldsize="md" control={control}
                        InputLabelProps={{ shrink: true }} error={ errors.dob } rules={ {required: 'Required'}} />

                    <FormTextField name="age" label="Age" fieldsize="xs" control={ control } disabled={ true } />

                    <FormSelect name="grade" label="Grade" fieldsize="sm" control={control}
                        error={ errors.grade } rules={ {required: 'Required'}}>
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
                    
                    <FormSelect name="isActive" label="Status" fieldsize="sm" error={ errors.isActive } 
                        control={ control } rules={ {required: 'Required'}} >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                    </FormSelect>   

                    </form>
                    <SaveCancel key={ saveMessage.text }
                        saveDisabled={ !formState.isDirty } message={ saveMessage } 
                        onClick={ (isSave) => { isSave ? submitForm() : handleCancel() } } />
                </Box>
            </DialogContent>
        </Dialog>
    )
}