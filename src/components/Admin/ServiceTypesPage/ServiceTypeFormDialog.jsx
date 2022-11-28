import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Box, Dialog, DialogContent, DialogTitle, MenuItem, Typography } from '@mui/material';
import { SettingsServiceCats } from '../../System/js/Database';
import { FormSelect, FormTextField, SaveCancel } from '../../System';
import { dbSaveSvcTypeAsync, dbSetModifiedTime, setEditingState } from '../../System/js/Database';

ServiceTypeFormDialog.propTypes = {
    // editMode: PropTypes.string.isRequired,              // 'edit' = display form
    serviceTypes: PropTypes.array.isRequired,              // 'edit' = display form
    handleEditMode: PropTypes.func.isRequired,          // editMode handler
    editRecord: PropTypes.object,            // history record being edited
    handleEditRecord: PropTypes.func.isRequired,        // editMode handler
    updateSvcTypes: PropTypes.func.isRequired,
}

export default function ServiceTypeFormDialog(props) {
    const { serviceTypes, updateSvcTypes, editRecord, handleEditMode, handleEditRecord } = props
    const [ dialogOpen, setDialogOpen ] = useState(true);
    const isNewSvcType = (editRecord == null);
    const initMsg = isNewSvcType ? {} : {result: 'success', time: editRecord.updatedDateTime};
    const [ saveMessage, setSaveMessage ] = useState(initMsg);
    const svcCats = SettingsServiceCats();
    let data;

    if (dialogOpen) setEditingState(true)

    if (isNewSvcType) {
        data = {available: {dateFromDay: "1", dateToDay: "1", dateFromMonth:"0", dateToMonth: "1"},
        fulfillment: {fromDateTime:"", toDateTime:"", type:""},
        target: {homeless: "", gender:"", family:"", child:"", childMinGrade:"Unselected", childMaxGrade:"Unselected", childMinAge:"0", childMaxAge:"0", service:""},
        isActive:"", svcUSDA:"", itemsPer:"", numberItems:"",
        svcBtns:"", svcCat:"",svcDesc:"",svcInterval:"",svcName:"", svcPeriod: "", 
        svcFrequency: ""};
        data.fromdate = packFromDate(data)
        data.todate = packToDate(data)
    }
    else {
        data = editRecord;
        data.fromdate = packFromDate(editRecord)
        data.todate = packToDate(editRecord)
    }

    function handleDialog(state){
        if (!state) { 
            setEditingState(false)
            handleEditMode('cancel')
        }
        setDialogOpen(state)
    }

    function packFromDate(record){
        let currYear = new Date().getFullYear()
        return (currYear) + "-" + (parseInt(record.available.dateFromMonth) + 1).toString().padStart(2, '0')+"-"+record.available.dateFromDay.toString().padStart(2, '0')
    }

    function packToDate(record){
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

    let defValues = { ...data };
    
    const { handleSubmit, reset, watch, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: defValues, 
    })

    function getTargetServices() {
        return serviceTypes.filter(function( obj ) {
            return obj.fulfillment.type == "Voucher"
        })
    }

    function unpackDates(fromdate, todate){
        const fromsplit = fromdate.split("-")
        const tosplit = todate.split("-")

        return {"available": {
            "dateFromMonth": (parseInt(fromsplit[1])-1), 
            "dateFromDay": parseInt(fromsplit[2]),
            "dateToMonth": (parseInt(tosplit[1])-1), 
            "dateToDay": parseInt(tosplit[2])
            }
        } 
    }

    function saveSvcType(data) {
        dbSetModifiedTime(data, isNewSvcType)
        // console.log(data)
        if (isNewSvcType) {
            const topId = Math.max(...serviceTypes.map(o => o.svcTypeId))
            data.svcTypeId = topId + 1
        }
        setSaveMessage({ result: 'working' });
        dbSaveSvcTypeAsync(data)
            .then( () => {
                handleEditRecord(data);
                updateSvcTypes();
                setEditingState(false)
                handleDialog(false)
            })
            .catch( message => {
                setSaveMessage({ result: 'error', text: message });
            });
}


    function doSave(values) {
        let fullfillment = data.fulfillment;
        let available = data.available;
        let target = data.target;

        // Add missing attributes
        if (target.child !== "YES") {
            target.childMaxAge = 0
            target.childMaxGrade = "Unselected"
            target.childMinAge = 0
            target.childMinGrade = "Unselected"
        }

        if (values.svcPeriod == "") {
            values.svcPeriod = "0"
        }

        if (values.svcFrequency == "") {
            values.svcFrequency = "0"
        }

        Object.assign(data, values);
        Object.assign(fullfillment, values.fulfillment);
        Object.assign(available, values.available);
        Object.assign(target, values.target);

        // Unpack dates into month day atttributes and place in "available" object
        Object.assign(data, unpackDates(values.fromdate, values.todate));
        data.numberItems = parseInt(data.numberItems)
        data.fulfillment = fullfillment;
        // data.available = available;
        data.target = target;

        console.log(data)
        saveSvcType(data)
        reset(values);
    }

    const submitForm = handleSubmit(doSave);
    const childSelected = watch("target.child")
    const fulfillType = watch("fulfillment.type")
    const fromDate = watch("fromdate");
    const toDate = watch("todate");
    const fromTime = watch("fulfillment.fromDateTime");
    const toTime = watch("fulfillment.toDateTime");

    const targetServices = getTargetServices()
    // console.log(targetServices)
    // console.log(svcCats)
    return (
        <Dialog maxWidth="md" open={ dialogOpen } aria-labelledby="form-dialog-title"> 
            <DialogTitle id="form-dialog-title">Service Type Record</DialogTitle>
            <DialogContent>
                <Box>
                <form>   
                    <Box mt={ 0 } display="flex" flexDirection="row" flexWrap="wrap"><Typography><strong>General Info</strong></Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
             
                    <FormTextField name="svcName" label="Service Name" fieldsize="lg" error={ errors.svcName } 
                        control={ control } rules={ {required: 'Required'}} />

                    <FormSelect name="svcCat" label="Service Category" fieldsize="md" error={ errors.svcCat } 
                        control={ control } rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        { svcCats.map((item) => (
                            <MenuItem value={ item.replace(" ", "_") } key={ item }>{ item }</MenuItem>
                        ))}
                    </FormSelect>     

                    <FormSelect name="isActive" label="Status" control={ control } fieldsize="sm" error={ errors.isActive }
                        rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value={ true }>Active</MenuItem>
                        <MenuItem value={ false }>Inactive</MenuItem>
                    </FormSelect>

                    <FormTextField name="svcDesc" label="Service Description" fieldsize="xl" error={ errors.svcDesc } 
                        control={ control } rules={ {required: 'Required'}} />

                    <FormSelect name="svcBtns" label="Buttons" control={ control } fieldsize="sm" error={ errors.svcBtns }
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

                    <FormTextField fieldsize="xs" name="svcInterval" label="Interval" error={ errors.svcInterval } 
                        control={ control } rules={ {required: 'Required'}} />

                    <FormSelect fieldsize="sm" name="svcUSDA" label="USDA" control={ control } error={ errors.svcUSDA }
                        rules={ {required: 'Required'}} >
                        <MenuItem value="">&nbsp;</MenuItem>
                        <MenuItem value="NA">N/A</MenuItem>
                        <MenuItem value="USDA">USDA</MenuItem>
                        <MenuItem value="NonUSDA">Non USDA</MenuItem>
                        <MenuItem value="Emergency">Emergency</MenuItem>
                    </FormSelect>
                    </Box>

                    <Box mt={ 0 } display="flex" flexDirection="row" flexWrap="wrap"><Typography><strong>Service Qualifications</strong></Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap" alignItems="bottom">
                        <Box py={1.9} ml={1}><Typography>Minimum food visits:</Typography></Box>
                        <FormTextField fieldsize="xs" name="svcFrequency" label="" error={ errors.svcFrequency } 
                            control={ control } />
                        <Box py={1.9}><Typography>times in</Typography></Box>
                        <FormTextField fieldsize="xs" name="svcPeriod" label="" error={ errors.svcPeriod } 
                            control={ control } />
                        <Box py={1.9}><Typography>days.</Typography></Box>
                    </Box>

                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography><strong>Service Available</strong></Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField fieldsize="md" name="fromdate" rules={{required: "Required", 
                        validate: (value) => value <= toDate || 'From date must be before or same as to date'}} label="From" type="date" error={ errors.fromdate }
                        control={ control } />
                    <FormTextField fieldsize="md" name="todate" rules={{required: "Required", validate: (value) => fromDate <= value || "To date must be after or same as from date"}} label="To" type="date" error={ errors.todate }
                        control={ control } />
                    </Box>

                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography><strong>Target Recipient</strong></Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormSelect fieldsize="sm" name="target.homeless" label="Homeless" control={ control } error={ errors.target?.homeless }
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
                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography><strong>Fulfillment</strong></Typography></Box>
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
                        <FormSelect fieldsize="lg" name="target.service" label="Voucher Service Type" control={ control } error={ errors.target?.service }
                            rules={ {required: 'Required'}} >
                                <MenuItem value="">&nbsp;</MenuItem>
                                <MenuItem value="Unselected">Unselected</MenuItem>
                                { targetServices.map((item) => (
                                    <MenuItem value={ item.svcTypeId } key={ item.svcTypeId }>{ item.svcName }</MenuItem>
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