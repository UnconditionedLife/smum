import React from 'react';
import { Box, Switch } from '@material-ui/core';
import { Typography, Button } from '../System';
import { dbSetUrl } from '../System/js/Database';
import { prnTest } from '../System/js/Clients/Receipts';

export default function DbSwitch() {
    const [switchOn, setSwitchOn] = React.useState(false);

    React.useEffect(() => {
        dbSetUrl(switchOn ? 'prod' : 'dev');
    }, [switchOn]);

    function onChange(event) {
        setSwitchOn(event.target.checked);
    }

    return (
        <Box display="flex" flexDirection="row" justifyContent="flex-end" 
         bgcolor={ switchOn ? 'warning.main' : 'gray' }>
             <Box>
             <Button key="print1" m={ .5 } variant="outlined" color="primary" size="small" minWidth="168px" 
            onClick={ () => prnTest('minimal') } >
                    Min Printer Test
            </Button>
            <Button key="print2" m={ .5 } variant="outlined" color="primary" size="small" minWidth="168px"
            style = {{ marginRight: '100px' }} 
            onClick={ () => prnTest('full') } >
                    Full Printer Test
            </Button>
             </Box>
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