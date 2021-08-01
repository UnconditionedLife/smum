import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, Dialog, DialogContent, DialogTitle, MenuItem } from '@material-ui/core';
import { FormSelect, FormTextField, SaveCancel } from '../../System';

DependentsFormDialog.propTypes = {
    session: PropTypes.object.isRequired,
    client: PropTypes.object.isRequired,                // current client
    // editMode: PropTypes.string.isRequired,           // 'edit' = display form
    // handleEditMode: PropTypes.func.isRequired,          // editMode handler
    saveMessage: PropTypes.object.isRequired,
    editRecord: PropTypes.object.isRequired,            // history record being edited
    handleEditRecord: PropTypes.func.isRequired,        // editMode handler
    saveAndUpdateClient: PropTypes.func.isRequired,     // saving and updateing client handler
    // handleClientHistory: PropTypes.func.isRequired,  // handles updating history
}

export default function DependentsFormDialog(props) {
    const [ dialogOpen, setDialogOpen ] = useState(true);


    function handleDialog(state){
        if (dialogOpen !== state) setDialogOpen(state)
    }


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

                    <FormSelect name="relationship" label= "Relationship" fieldsize="sm" control ={control}
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

                    <FormTextField name="dob" type="date" label="DOB" fieldsize="md" control={control}
                        error={ errors.dob } rules={ {required: 'Required'}}/>

                    <FormTextField name="age" label="Age" fieldsize="xs" control={ control } disabled={ true } />

                    <FormSelect name="grade" label="Grade" fieldsize="xs" control={control}
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
                    <SaveCancel key={ props.saveMessage.text }
                        saveDisabled={ !formState.isDirty } message={ props.saveMessage } 
                        onClick={ (isSave) => { isSave ? submitForm() : handleDialog(false) } } />
                </Box>
            </DialogContent>
        </Dialog>
    )
}