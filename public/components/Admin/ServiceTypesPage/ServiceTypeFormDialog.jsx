import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, Dialog, DialogContent, DialogTitle, MenuItem, Typography } from '@material-ui/core';
import { SettingsServiceCats } from '../../System/js/Database';
import { FormSelect, FormTextField, SaveCancel } from '../../System';

ServiceTypeFormDialog.propTypes = {
    editMode: PropTypes.string.isRequired,              // 'edit' = display form
    serviceTypes: PropTypes.array.isRequired,              // 'edit' = display form
    handleEditMode: PropTypes.func.isRequired,          // editMode handler
    editRecord: PropTypes.object.isRequired,            // history record being edited
    handleEditRecord: PropTypes.func.isRequired,        // editMode handler
    // handleClientHistory: PropTypes.func.isRequired,     // handles updating history
}

export default function ServiceTypeFormDialog(props) {
    const [ dialogOpen, setDialogOpen ] = useState(true);
    const [ saveMessage, setSaveMessage ] = useState({})
    const svcCats = SettingsServiceCats();

    let delayInt

    function handleDialog(state){
        if (!state) { 
            props.handleEditMode('cancel')
        }
        setDialogOpen(state)
    }

    function unpackFromDate(record){
        let currYear = new Date().getFullYear()
        return (currYear) + "-" + (parseInt(record.available.dateFromMonth) + 1).toString().padStart(2, '0')+"-"+record.available.dateFromDay.toString().padStart(2, '0')
    }

    function unpackToDate(record){
        let currYear = new Date().getFullYear()
        let avail = record.available
        let fromMonth = parseInt(avail.dateFromMonth)
        let fromDay = parseInt(avail.dateFromDay)
        let toMonth = parseInt(avail.dateToMonth)
        let toDay = parseInt(avail.dateToDay)

        if (fromMonth < toMonth ||
            ((fromMonth == toMonth) && 
            fromDay <= toDay)) {
            return currYear+"-"+(toMonth + 1).toString().padStart(2, '0')+"-"+toDay.toString().padStart(2, '0')
        }
        return (currYear + 1)+"-"+(toMonth + 1).toString().padStart(2, '0')+"-"+toDay.toString().padStart(2, '0')
    }

    const initValues = props.editRecord
    initValues.fromdate = unpackFromDate(props.editRecord)
    initValues.todate = unpackToDate(props.editRecord)
    
    const { handleSubmit, reset, watch, control, errors, setError, formState } = useForm({
        mode: 'onBlur',
        defaultValues: initValues, 
    })

    function getTargetServices() {
        console.log(props.serviceTypes)
        return props.serviceTypes.filter(function( obj ) {
            return obj.fulfillment.type == "Voucher"
        })
    }

    function updateMessage(msg){
        if (saveMessage !== msg) setSaveMessage(msg)
    }

    useEffect(() => { 
        updateMessage({ result: 'success', time: props.editRecord.updatedDateTime })
    }, [ props.editRecord ])

    function doSave(formValues) {
        console.log(svcCats)
        alert("Changes saved (not really!)\n"+JSON.stringify(formValues));
        updateMessage({text: 'History record was saved!', time: initValues.updatedDateTime, result: 'success'})
    }

    function startMessageTimer(boo){
        if (boo === false) {
            if (saveMessage.result === 'success') {
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
    const childSelected = watch("target.child")
    const fulfillType = watch("fulfillment.type")
    const fromDate = watch("fromdate");
    const toDate = watch("todate");
    const fromTime = watch("fulfillment.fromDateTime");
    const toTime = watch("fulfillment.toDateTime");

    const targetServices = getTargetServices()
    console.log(targetServices)
    console.log(svcCats)
    return (
        <Dialog maxWidth="md" open={ dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">Edit Service Type Record</DialogTitle>
            <DialogContent>
                <Box>
                <form>   
                    <Box mt={ 0 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>General Info</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
             
                    <FormTextField name="serviceName" label="Service Name" fieldsize="lg" error={ errors.serviceName } 
                        control={ control } rules={ {required: 'Required'}} />

                    <FormSelect name="serviceCategory" label="Service Category" fieldsize="md" error={ errors.serviceName } 
                        control={ control } rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        { svcCats.map((item) => (
                            <MenuItem value={ item.replace(" ", "_") } key={ item }>{ item }</MenuItem>
                        ))}
                    </FormSelect>     

                    <FormSelect name="isActive" label="Status" control={ control } fieldsize="sm" error={ errors.isActive }
                        rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </FormSelect>

                    <FormTextField name="serviceDescription" label="Service Description" fieldsize="xl" error={ errors.serviceDescription } 
                        control={ control } rules={ {required: 'Required'}} />

                    <FormSelect name="serviceButtons" label="Buttons" control={ control } fieldsize="sm" error={ errors.serviceButtons }
                        rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="Primary">Primary</MenuItem>
                        <MenuItem value="Secondary">Secondary</MenuItem>
                    </FormSelect>

                    <FormTextField name="numberItems" fieldsize="xs" label="# of Items" error={ errors.numberItems } 
                        control={ control } rules={ {required: 'Required'}} />
                    
                    <FormSelect fieldsize="sm" name="itemsPer" label="Items Per" control={ control } error={ errors.itemsPer }
                        rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="Family">Family</MenuItem>
                        <MenuItem value="Person">Person</MenuItem>
                    </FormSelect>

                    <FormTextField fieldsize="xs" name="serviceInterval" label="Interval" error={ errors.serviceInterval } 
                        control={ control } rules={ {required: 'Required'}} />

                    <FormSelect fieldsize="sm" name="isUSDA" label="USDA" control={ control } error={ errors.isUSDA }
                        rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="NA">N/A</MenuItem>
                        <MenuItem value="USDA">USDA</MenuItem>
                        <MenuItem value="NonUSDA">Non USDA</MenuItem>
                        <MenuItem value="Emergency">Emergency</MenuItem>
                    </FormSelect>
                    </Box>
                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Service Available</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField fieldsize="md" name="fromdate" rules={{required: "Required", 
                        validate: (value) => value <= toDate || 'From date must be before or same as to date'}} label="From" type="date" error={ errors.fromdate }
                        control={ control } />
                    <FormTextField fieldsize="md" name="todate" rules={{required: "Required", validate: (value) => fromDate <= value || "To date must be after or same as from date"}} label="To" type="date" error={ errors.todate }
                        control={ control } />
                    </Box>

                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Target Recipient</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormSelect fieldsize="xs" name="target.homeless" label="Homeless" control={ control } error={ errors.target?.homeless }
                        rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="Unselected">Any</MenuItem>
                        <MenuItem value="YES">Yes</MenuItem>
                        <MenuItem value="NO">No</MenuItem>
                    </FormSelect>
                    <FormSelect fieldsize="lg" name="target.family" label="Family" control={ control } error={ errors.target?.family }
                        rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="Unselected">Any</MenuItem>
                        <MenuItem value="Single_Individual">Single Individual</MenuItem>
                        <MenuItem value="Couple">Couple</MenuItem>
                        <MenuItem value="Family_with_Children">With Children</MenuItem>
                    </FormSelect>
                    <FormSelect fieldsize="sm" name="target.gender" label="Gender" control={ control } error={ errors.target?.gender }
                        rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="Unselected">Any</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                    </FormSelect>
                    <FormSelect fieldsize="sm" name="target.child" label="Child" control={ control } error={ errors.target?.child }
                        rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="Unselected">Any</MenuItem>
                        <MenuItem value="YES">Yes</MenuItem>
                        <MenuItem value="NO">No</MenuItem>
                    </FormSelect>
                    {childSelected == "YES" &&
                        <React.Fragment>
                        <FormTextField fieldsize="sm" name="target.childMinAge" label="Min Age" error={ errors.target?.childMinAge } 
                        control={ control } rules={ {required: 'Required'}} />
                        <FormTextField fieldsize="sm" name="target.childMaxAge" label="Max Age" error={ errors.target?.childMaxAge } 
                        control={ control } rules={ {required: 'Required'}} />
                         <FormSelect fieldsize="md" name="target.childMinGrade" label="Min Grade" control={ control } error={ errors.target?.childMinGrade }
                        rules={ {required: 'Required'}} >
                            <MenuItem value="">&nbsp;</MenuItem>
                            <MenuItem value="Unselected">Any</MenuItem>
                            <MenuItem value="K">K</MenuItem>
                            <MenuItem value="1">1st</MenuItem>
                            <MenuItem value="2">2nd</MenuItem>
                            <MenuItem value="3">3rd</MenuItem>
                            <MenuItem value="4">4th</MenuItem>
                            <MenuItem value="5">5th</MenuItem>
                            <MenuItem value="6">6th</MenuItem>
                            <MenuItem value="7">7th</MenuItem>
                            <MenuItem value="8">8th</MenuItem>
                            <MenuItem value="9">9th</MenuItem>
                            <MenuItem value="10">10th</MenuItem>
                            <MenuItem value="11">11th</MenuItem>
                            <MenuItem value="12">12th</MenuItem>
                        </FormSelect>
                        <FormSelect fieldsize="sm" name="target.childMaxGrade" label="Max Grade" control={ control } error={ errors.target?.childMaxGrade }
                        rules={ {required: 'Required'}} >
                            <MenuItem value="">&nbsp;</MenuItem>
                            <MenuItem value="Unselected">Any</MenuItem>
                            <MenuItem value="K">K</MenuItem>
                            <MenuItem value="1">1st</MenuItem>
                            <MenuItem value="2">2nd</MenuItem>
                            <MenuItem value="3">3rd</MenuItem>
                            <MenuItem value="4">4th</MenuItem>
                            <MenuItem value="5">5th</MenuItem>
                            <MenuItem value="6">6th</MenuItem>
                            <MenuItem value="7">7th</MenuItem>
                            <MenuItem value="8">8th</MenuItem>
                            <MenuItem value="9">9th</MenuItem>
                            <MenuItem value="10">10th</MenuItem>
                            <MenuItem value="11">11th</MenuItem>
                            <MenuItem value="12">12th</MenuItem>
                        </FormSelect>
                        </React.Fragment>
                        
                    }
                    </Box>
                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Fulfillment</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormSelect fieldsize="md" name="fulfillment.type" label="Type" control={ control } error={ errors.fulfillment?.type }
                            rules={ {required: 'Required'}} >
                                <MenuItem value="">&nbsp;</MenuItem>
                                <MenuItem value="Fulfill">Fulfill</MenuItem>
                                <MenuItem value="Notify">Notify</MenuItem>
                                <MenuItem value="Voucher">Voucher</MenuItem>
                                <MenuItem value="Voucher_Fulfill">Voucher Fulfill</MenuItem>
                        </FormSelect>
                        {fulfillType == "Voucher" &&
                        <React.Fragment>
                        <FormTextField fieldsize="xl" InputLabelProps={{ shrink: true }}  rules={{validate: (value) => value <= toTime || 'From date must be before or same as to date'}} name="fulfillment.fromDateTime" label="From" type="datetime-local" error={ errors.fulfillment?.fromDateTime }
                        control={ control } />
                        <FormTextField fieldsize="xl" InputLabelProps={{ shrink: true }} rules={{validate: (value) => value >= fromTime || 'To date must be later or same as from date'}} name="fulfillment.toDateTime" label="To" type="datetime-local" error={ errors.fulfillment?.toDateTime }
                        control={ control } />
                        </React.Fragment>}
                        {fulfillType == "Voucher_Fulfill" &&
                        <FormSelect fieldsize="lg" name="target.service" label="Type" control={ control } error={ errors.target?.service }
                            rules={ {required: 'Required'}} >
                                <MenuItem value="">&nbsp;</MenuItem>
                                <MenuItem value="Unselected">Unselected</MenuItem>
                                { targetServices.map((item) => (
                                    <MenuItem value={ item.serviceTypeId } key={ item.serviceTypeId }>{ item.serviceName }</MenuItem>
                                ))}
                        </FormSelect>}
                    </Box>


                    </form>
                    <SaveCancel key={saveMessage.text} saveDisabled={ !formState.isDirty } message={ saveMessage } onClick={ (isSave) => { isSave ? submitForm() : handleDialog(false) } } />
                </Box>
            </DialogContent>
        </Dialog>
    )
}