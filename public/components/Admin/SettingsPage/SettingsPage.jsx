import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import ChipInput from 'material-ui-chip-input';
import { Box, Card, CardContent, CardHeader, Container, MenuItem, Typography } from '@material-ui/core';
import { FormSelect, FormTextField, SaveCancel } from '../../System';
import { dbGetSettingsAsync, dbSaveSettingsAsync, dbSetModifiedTime, setEditingState } from '../../System/js/Database';
import { validBaseZipcode } from '../../System/js/Forms';
import { beepError } from '../../System/js/GlobalUtils';
import SettingsSched from './SettingsSched.jsx';
import { calClone } from '../../System/js/Calendar';

export default function SettingsPage() {
    const [ settings, setSettings ] = useState(null);

    useEffect(() => { 
        dbGetSettingsAsync().then( stgs => { setSettings(stgs); });
    }, []);

    if (settings)
        return (
            <Container maxWidth='md'>
                <Card>
                    <CardHeader title="Application Settings" />
                    <CardContent>
                        <SettingsForm settings={settings} />
                    </CardContent>
                </Card>
            </Container>
        );
    else
        return null;
}

SettingsForm.propTypes = {
    settings: PropTypes.object,     // app settings object
}

function SettingsForm(props) {
    const [initValues, setInitValues] = useState(props.settings);
    const [serviceZip, setServiceZip] = useState(initValues.serviceZip);
    const [serviceCat, setServiceCat] = useState(initValues.serviceCat);
    const [calRules, setCalRules] = useState(calClone(initValues));
    const [saveMessage, setSaveMessage] = useState({result: 'success', time: initValues.updatedDateTime});
    const [fieldsDirty, setFieldsDirty] = useState(false);
    const { handleSubmit, reset, control, errors, formState } = useForm({
        mode: 'onBlur',
        defaultValues: initValues,
    });

    if (formState.isDirty || fieldsDirty) 
        setEditingState(true);

    function doSave(formValues) {
        let settingsData = { ... initValues };

        // Load values from form fields and other controls
        Object.assign(settingsData, formValues);
        settingsData.serviceZip = serviceZip;
        settingsData.serviceCat = serviceCat;
        Object.assign(settingsData, calClone(calRules));

        // Save user data and reset initial state to new values
        dbSetModifiedTime(settingsData, false);
        setSaveMessage({ result: 'working' });
        dbSaveSettingsAsync(settingsData)
            .then( () => {
                setSaveMessage({ result: 'success', time: settingsData.updatedDateTime });
                reset(formValues);
                setInitValues(settingsData);
                setFieldsDirty(false);
                setEditingState(false);
            })
            .catch( message => {
                setSaveMessage({ result: 'error', text: message });
            });
    }
    const submitForm = handleSubmit(doSave);

    function doCancel() {
        reset();
        setServiceZip(initValues.serviceZip);
        setServiceCat(initValues.serviceCat);
        setCalRules(calClone(initValues));
        setFieldsDirty(false);
        setEditingState(false);
    }

    function addZipcode(zip) {
        if (validBaseZipcode(zip)) {
            setServiceZip(serviceZip.concat(zip).sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'})));
            setFieldsDirty(true);
        } else {
            beepError();
        }
    }

    function deleteZipcode(zip) {
        setServiceZip(serviceZip.filter(x => x != zip));
        setFieldsDirty(true);
    }
    
    function addServiceCat(cat) {
        setServiceCat(serviceCat.concat(cat).sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'})));
        setFieldsDirty(true);
    }

    function deleteServiceCat(cat) {
        setServiceCat(serviceCat.filter(x => x != cat));
        setFieldsDirty(true);
    }

    function updateCalRules(rules) {
        setCalRules(rules);
        setFieldsDirty(true);
    }

    return (
        <>
            <form>
                <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Interface</Typography></Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormSelect name="sounds" label="Enable Sounds" error={ errors.sounds } 
                        control={ control } rules={ {required: 'Required'}} >
                            <MenuItem value="YES">Yes</MenuItem>
                            <MenuItem value="NO">No</MenuItem>
                    </FormSelect>
                    <FormTextField name="printerIP" label="Printer Address" error={ errors.printerIP } 
                        control={ control } rules={ {required: 'Required'}} />
                </Box>

                <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Services</Typography></Box>
                <ChipInput label='Service Zip Codes' value={ serviceZip } variant='outlined'
                    blurBehavior='clear' onAdd={ addZipcode } onDelete={ deleteZipcode } />
                <ChipInput label='Service Categories' value={ serviceCat } variant='outlined'
                    blurBehavior='clear' onAdd={ addServiceCat } onDelete={ deleteServiceCat } />

                <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Clients</Typography></Box>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <FormTextField name="seniorAge" label="Senior Age" error={ errors.seniorAge } 
                            control={ control } rules={ {required: 'Required'}} />
                </Box>

                <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Schedule</Typography></Box>
                <SettingsSched rules={ calRules } onUpdate={ updateCalRules } />
            </form>
            <SaveCancel disabled={ !(formState.isDirty || fieldsDirty) } message={ saveMessage }
                onClick={ (isSave) => { isSave ? submitForm() : doCancel() } } />
        </>
    );
}