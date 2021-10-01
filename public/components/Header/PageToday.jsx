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
            <Button key="print" m={ .5 } variant="outlined" color="primary" size="large" minWidth="168px" onClick={ prnTest } >
                    Printer Test
            </Button>
        </div>
    );
}   