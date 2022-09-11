import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { Box, CardContent, CardHeader, Fab, Tooltip } from '@mui/material';
import { Card } from '../System';
import DailyDistributionReport from '../Admin/ReportsPage/Reports/DailyDistributionReport.jsx';
import ReactToPrint from 'react-to-print';
import { Print } from '@mui/icons-material';

export default function PageToday() {
    const [ reportDay ] = useState(moment().format('YYYYMMDD'))
    const [ reportHeading, setReportHeading ] = useState('')
    const [ reportBody, setReportBody ] = useState(null)

    useEffect(() => {
        setReportHeading("Today " + moment(reportDay).format('MMM, DD, YYYY') + " Report");
        setReportBody(<DailyDistributionReport/>);
    }, [reportDay])
    const ref = useRef()
    const getPageMargins = () => {
        return `@page { margin: 20px 20px 40px 20px; }`;
      };

    return (
        <React.Fragment>
        <Card>
            <CardHeader>{ reportHeading }</CardHeader>
            <CardContent>
                <Box ref={ref}>{ reportBody }</Box>
                <Box display='flex' justifyContent="right">
                    <ReactToPrint
                        trigger={() => <Tooltip title='Print Report' placement="left-start" ><Fab size="medium" align='right'><Print /></Fab></Tooltip> }
                        content={() => ref.current}
                        copyStyles={ false }
                        pageStyle={ getPageMargins() }
                    />
                </Box>
            </CardContent>
        </Card>
  
        </React.Fragment>
    );
}   