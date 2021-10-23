import React from 'react';
// import { useEffect, useRef } from 'react';
import { Button } from '../System';
import { prnTest } from '../System/js/Clients/Receipts';

export default function PageToday() {
    // const dayReportDiv = useRef(null);

    // useEffect(() => {
    //     window.uiRefreshReport(dayReportDiv.current)  
    // })

    return (
        <div>
            TODAY PAGE<br/>
            <Button key="print1" m={ .5 } variant="outlined" color="primary" size="large" minWidth="168px" 
            onClick={ () => prnTest('minimal') } >
                    Minimal Printer Test
            </Button>
            <Button key="print2" m={ .5 } variant="outlined" color="primary" size="large" minWidth="168px" 
            onClick={ () => prnTest('full') } >
                    Full Printer Test
            </Button>
        </div>
    );
}   