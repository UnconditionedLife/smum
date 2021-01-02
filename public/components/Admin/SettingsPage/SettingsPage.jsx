import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { Typography } from '../../System';
import { dbGetSettings, SettingsSound, SettingsPrinter, SettingsSeniorAge,
    SettingsZipcodes, SettingsServiceCats, SettingsSchedule } from '../../System/js/Database';

SettingsPage.propTypes = {
    session: PropTypes.object.isRequired,
}

export default function SettingsPage(props) {
    const settings = dbGetSettings(props.session);

    return (
        <Box mt={ 7 }>
            <Typography variant="h5">SettingsSound() - Is sound enabled?</Typography>
                <pre>{ JSON.stringify(SettingsSound(), undefined, 4) }</pre>
            <Typography variant="h5">SettingsPrinter() - Printer IP address</Typography>
                <pre>{ JSON.stringify(SettingsPrinter(), undefined, 4) }</pre>
            <Typography variant="h5">SettingsSeniorAge() - Age threshold for senior</Typography>
                <pre>{ JSON.stringify(SettingsSeniorAge(), undefined, 4) }</pre>
            <Typography variant="h5">SettingsServiceCats() - Service categories</Typography>
                <pre>{ JSON.stringify(SettingsServiceCats(), undefined, 4) }</pre>
            <Typography variant="h5">SettingsZipcodes() - Service area zipcodes</Typography>
                <pre>{ JSON.stringify(SettingsZipcodes(), undefined, 4) }</pre>
            <Typography variant="h5">SettingsSchedule() - Open/closed dates</Typography>
                <pre>{ JSON.stringify(SettingsSchedule(), undefined, 4) }</pre>
            <Typography variant="h5">dbGetSettings() - All Settings</Typography>
                <pre>{ JSON.stringify(settings, undefined, 4) }</pre>
        </Box>
    );
}