import React from 'react';
import { useEffect, useRef } from 'react';

export default function PageToday() {
    const dayReportDiv = useRef(null);

    useEffect(() => {
        window.uiRefreshReport(dayReportDiv.current)  
    })

    return (
        <div>
            <div ref={ dayReportDiv }></div>
        </div>
    );
};   