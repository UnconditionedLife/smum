import React, { useRef } from 'react';
import { Box, CardActions, CardContent, Fab, Tooltip } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { reportTheme } from '../Theme.jsx';
import { Card } from '../System';
import DailyDistributionReport from '../Admin/ReportsPage/Reports/DailyDistributionReport.jsx';
import DailyFoodBankReport from '../Admin/ReportsPage/Reports/DailyFoodBankReport.jsx';
import { useReactToPrint } from 'react-to-print';
import { Print } from '@mui/icons-material';
import DailyFoodBankReportNonUSDA from '../Admin/ReportsPage/Reports/DailyFoodBankReportNonUSDA.jsx';

export default function PageToday() {
    const ref = useRef()
    const getPageMargins = () => {
        return `@page { margin: 20px 20px 40px 20px; }`;
      };
    const printReport = useReactToPrint({
        contentRef: ref,
        ignoreGlobalStyles: true,
        pageStyle: getPageMargins(),
    })

    return (
        <React.Fragment>
            <Card>
                <CardContent>
                    <ThemeProvider theme={ reportTheme }>
                    <Box ref={ref}>
                        <Box sx={{
                            mb: 4
                        }}><DailyDistributionReport/></Box>
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
                        <Box className="break" sx={{
                            mb: 4
                        }}>
                            <DailyFoodBankReport />
                        </Box>
                        <Box className="break">
                            <DailyFoodBankReportNonUSDA />
                        </Box>
                    </Box>
                    </ThemeProvider>
                </CardContent>
                <CardActions style={{display:"flex", justifyContent:"flex-end"}}>
                    <Tooltip title='Print Report' placement="left-start" ><Fab size="medium" align='right' onClick={ () => printReport() }><Print /></Fab></Tooltip>
                </CardActions>
            </Card>
        </React.Fragment>
    );
}   