import React from 'react';
import { Box, Switch } from '@material-ui/core';
import { Typography } from '../System';
import { dbSetUrl } from '../System/js/Database';

export default function DbSwitch() {
    const [switchOn, setSwitchOn] = React.useState(false);

    function onChange(event) {
        setSwitchOn(event.target.checked);
    }

    dbSetUrl(switchOn ? 'prod' : 'dev');

    return (
        <Box display="flex" flexDirection="row" justifyContent="flex-end" 
         bgcolor={ switchOn ? 'warning.main' : 'gray' }>
            { switchOn ? <Typography ml={ 1 } mr={ 1 }>WARNING: Production database selected</Typography> : null }
            <Typography ml={ 1 } mr={ 1 }>Database Access:</Typography>
            <Box display="flex" flexDirection="row" ml={ 1 } mr={ 1 }>
                <Typography>Dev</Typography>
                <Switch checked={ switchOn } onChange={ onChange } />
                <Typography>Prod</Typography>
            </Box>
        </Box>
    )
}