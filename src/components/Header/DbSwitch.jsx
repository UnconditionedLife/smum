import React from 'react';
import { Box, Switch } from '@material-ui/core';
import { Typography, Button } from '../System';
import { dbSetUrl, dbGetSvcsBysvcTypeDateAsync } from '../System/js/Database';
import { prnTest } from '../System/js/Clients/Receipts';
import { MoveSvcsTableRecords } from "../System/js/MoveSvcsTable";

export default function DbSwitch() {
    const [switchOn, setSwitchOn] = React.useState(false);

    React.useEffect(() => {
        dbSetUrl(switchOn ? 'prod' : 'dev');
    }, [switchOn]);

    function onChange(event) {
        setSwitchOn(event.target.checked);
    }

    {/* ************************************************************* */}

    {/* Test loading a services with "begins_with" date */}
    function getSvcs(svcTypeId, date) {
        dbGetSvcsBysvcTypeDateAsync(svcTypeId, date)
        .then(svcs => {
            console.log("SVCS:", svcs)
        })
    }

    {/* ************************************************************* */}

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

            {/* ************************************************************* */}
            {/* Migrate dev-smum-services table to new dev-svcs-table */}
            <Button key="moveSvcs" m={ .5 } variant="outlined" color="error" size="small" minWidth="168px"
            style = {{ marginRight: '100px' }} 
            onClick={ () => MoveSvcsTableRecords(1000,1010) } >
                    Move Svcs
            </Button>
            {/* ************************************************************* */}

            {/* ************************************************************* */}
            {/* Test loading a services with "begins_with" date */}
            <Button key="getSvcs" m={ .5 } variant="outlined" color="error" size="small" minWidth="168px"
            style = {{ marginRight: '100px' }} 
            onClick={ () => getSvcs("cj86davnj00013k7zi3715rf4","2019-01") } >
                    Get Svcs
            </Button>

            {/* ************************************************************* */}

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