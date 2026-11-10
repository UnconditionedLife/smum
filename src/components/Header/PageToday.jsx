import React, { useRef } from 'react';
import { Box, Button, CardActions, CardContent, Fab, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
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
            <Card sx={{ mt: 2 }}>
                <Box sx={{ px: 2.5, py: 1.75, borderBottom: 1, borderColor: 'divider', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant='h6'>Today&apos;s Reports</Typography>
                        <Typography variant='body2' sx={{ color: 'text.secondary' }}>{ dayjs().format('dddd, MMMM D, YYYY') }</Typography>
                    </Box>
                    <Button variant='contained' size='small' startIcon={ <Print /> } onClick={ () => printReport() } sx={{ m: 0 }}>
                        Print
                    </Button>
                </Box>
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