import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { CardContent, CardHeader } from '@material-ui/core';
import { Card } from '../System';
import DailyDistributionReport from '../Admin/ReportsPage/Reports/DailyDistributionReport.jsx';

export default function PageToday() {
    const [ reportDay, setReportDay ] = useState(moment().format('YYYYMMDD'))
    const [ reportHeading, setReportHeading ] = useState('')
    const [ reportBody, setReportBody ] = useState(null)

    useEffect(() => {
        setReportHeading("Today " + moment(reportDay).format('MMM, DD, YYYY') + " Report");
        setReportBody(<DailyDistributionReport />);
    }, [reportDay])
 
    return (
        <Card>
            <CardHeader>{ reportHeading }</CardHeader>
            <CardContent>{ reportBody }</CardContent>
        </Card>
    );
}   