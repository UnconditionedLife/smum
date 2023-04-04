import React, { useRef, useState } from 'react';
import { Box, CardActions, CardContent, Fab, TextField, Tooltip } from '@mui/material';
import { Card } from '../System';
import DailyDistributionReport from '../Admin/ReportsPage/Reports/DailyDistributionReport.jsx';
import DailyFoodBankReport from '../Admin/ReportsPage/Reports/DailyFoodBankReport.jsx';
import ReactToPrint from 'react-to-print';
import { Print } from '@mui/icons-material';
import DailyFoodBankReportNonUSDA from '../Admin/ReportsPage/Reports/DailyFoodBankReportNonUSDA.jsx';
import { FormTextField, Button, SaveCancel, FormSelect } from '../System';
import { useForm } from "react-hook-form";

export default function NextVisit() {
    
    const {clientId, setClientId} = useState("");
    
    const submit = () => {alert("hello")}

    return (
        <React.Fragment>
            <Box display="flex" flexDirection="row" flexWrap="wrap">
                {/* <FormTextField name="clientId" label="Client Id" fieldsize="lg" control={ control } error={ errors.street } rules={ {required: 'Required'}} /> */}
                <TextField name="clientId" label="Client Id" onChange={(event) => setClientId(event.value)}/>
            </Box>
            <Button onClick={submit}>Submit</Button>
        {/* <Card>
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
                    <Box mb={4} className="break">
                        <DailyFoodBankReport />
                    </Box>
                    <Box className="break">
                        <DailyFoodBankReportNonUSDA />
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
        </Card> */}
        
        <h1>Test if routing works</h1>
        </React.Fragment>
    );
}   