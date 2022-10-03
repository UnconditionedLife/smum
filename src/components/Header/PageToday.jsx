import React, { useRef } from 'react';
import { Box, CardActions, CardContent, Fab, Tooltip } from '@mui/material';
import { Card } from '../System';
import DailyDistributionReport from '../Admin/ReportsPage/Reports/DailyDistributionReport.jsx';
import DailyFoodBankReport from '../Admin/ReportsPage/Reports/DailyFoodBankReport.jsx';
import ReactToPrint from 'react-to-print';
import { Print } from '@mui/icons-material';

export default function PageToday() {
    const ref = useRef()
    const getPageMargins = () => {
        return `@page { margin: 20px 20px 40px 20px; }`;
      };

    return (
        <React.Fragment>
        <Card>
            <CardContent>
                <Box ref={ref}>
                    <Box mb={4}><DailyDistributionReport/></Box>
                    <style>
                        {`@media print { 
                            .break { 
                                break-before: avoid-page;
                                break-after: avoid-page;
                                page-break-before: always;
                                }
                            }`
                        }
                    </style>
                    <Box className="break">
                        <DailyFoodBankReport />
                    </Box>
                </Box>
            </CardContent>
            <CardActions style={{display:"flex", justifyContent:"flex-end"}}>
                <ReactToPrint
                    trigger={() => <Tooltip title='Print Report' placement="left-start" ><Fab size="medium" align='right'><Print /></Fab></Tooltip> }
                    content={() => ref.current}
                    copyStyles={ false }
                    pageStyle={ getPageMargins() }
                />
            </CardActions>
        </Card>
        </React.Fragment>
    );
}   