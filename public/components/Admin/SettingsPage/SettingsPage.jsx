import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { Typography } from '../../System';
import { dbGetSettings, SettingsSchedule } from '../../System/js/Database';
import SettingsSched from './SettingsSched.jsx';

SettingsPage.propTypes = {
    session: PropTypes.object.isRequired,
}

export default function SettingsPage(props) {
    const settings = dbGetSettings(props.session);

    return (
        <Box mt={ 7 }>
            <SettingsSched />
            <Typography variant="h5">SettingsSchedule() - Open/closed dates</Typography>
                <pre>{ JSON.stringify(SettingsSchedule(), undefined, 4) }</pre>
            <Typography variant="h5">dbGetSettings() - All Settings</Typography>
                <pre>{ JSON.stringify(settings, undefined, 4) }</pre>
        </Box>
    );
}