import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Box, Button, Card, CardContent, CardHeader, Container, FormControl, InputLabel, MenuItem, Typography } from '@material-ui/core';
import { Select, TextField } from '../../System'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { getSvcTypes } from '../../System/js/Database.js';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import ReportDialog from './ReportDialog.jsx';
import NewClientsReport from './Reports/NewClientsReport.jsx';

export default function ReportsPage() {
    const [ foodYearMonth, handleFoodYearMonthChange ] = useState(moment().subtract(1, 'month').format('YYYYMM'))
    const [ foodType, handleFoodType ] = useState("FOOD")
    const [reportOpen, setReportOpen] = useState(false)
    const [reportHeading, setReportHeading] = useState('')
    const [reportBody, setReportBody] = useState(null)
    const [reportActions, setReportActions] = useState(null)

    const svcTypes = getSvcTypes()
    const voucherSvcTypes = svcTypes.filter(s => (s.isActive == 'Active' && s.fulfillment.type == 'Voucher'))

    const runFoodReport = () => {
        setReportHeading("New Clients " + moment(foodYearMonth).format('MMM, YYYY') + " Report");
        setReportOpen(true);
        setReportBody(<NewClientsReport yearMonth={foodYearMonth} />);
        const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
        setReportActions(buttonCode);
    }

    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
        <Container maxWidth='md'>
        <Card>
            <CardHeader title="Distribution Reports" />
            <CardContent>
                <Box>
                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Daily Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                        <InputLabel>Report</InputLabel>
                        <Select value={foodType} onChange={handleFoodType} width={ 240 } name="report" label="Report">
                                <MenuItem value="FOOD">Food Only</MenuItem>
                        </Select>
                        </FormControl>
                        <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}} label='Year and Month' name="yearMonth" views={["year", "month"]} value={ foodYearMonth } onChange={ handleFoodYearMonthChange } />
                        <Button onClick={runFoodReport} variant="contained" color="primary">Run</Button>
                    </Box>

                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Monthly Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                        <InputLabel>Report</InputLabel>
                        <Select width={ 240 } name="report" label="Report">
                                <MenuItem value="ALL">All Services</MenuItem>
                                <MenuItem value="FOOD">Food Only</MenuItem>
                        </Select>
                        </FormControl>
                        <FormControl variant='outlined'>
                        <TextField width={ 240 } m={ 0 } size='small' label="Month" InputLabelProps={{ shrink: true }} type="month" />
                        </FormControl>
                        <Button variant="contained" color="primary">Run</Button>
                    </Box>

                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Annual Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                        <InputLabel>Report</InputLabel>
                        <Select width={ 240 } name="report" label="Report">
                                <MenuItem value="FOOD">Food Only</MenuItem>
                        </Select>
                        </FormControl>
                        <FormControl variant='outlined'>
                        <TextField width={ 240 } m={ 0 } size='small' label="Year" InputLabelProps={{ shrink: true }} type="number" />
                        </FormControl>
                        <Button variant="contained" color="primary">Run</Button>
                    </Box>
                    <Box mt={ 10 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Voucher Distribution Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                        <InputLabel>Report</InputLabel>
                        <Select width={ 240 } name="report" label="Report">
                            { voucherSvcTypes.map((item) => (
                                <MenuItem value={ item.serviceTypeId } key={ item.serviceTypeId }>{ item.serviceName }</MenuItem>
                            ))}                          
                        </Select>
                        </FormControl>
                        <FormControl variant='outlined'>
                        <TextField width={ 240 } m={ 0 } size='small' label="Year" InputLabelProps={{ shrink: true }} type="number" />
                        </FormControl>
                        <Button variant="contained" color="primary">Run</Button>
                    </Box>
                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Voucher Final Count Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                        <InputLabel>Report</InputLabel>
                        <Select width={ 240 } name="report" label="Report">
                            { voucherSvcTypes.map((item) => (
                                <MenuItem value={ item.serviceTypeId } key={ item.serviceTypeId }>{ item.serviceName }</MenuItem>
                            ))} 
                        </Select>
                        </FormControl>
                        <FormControl variant='outlined'>
                        <TextField width={ 240 } m={ 0 } size='small' label="Year" InputLabelProps={{ shrink: true }} type="number" />
                        </FormControl>
                        <Button variant="contained" color="primary">Run</Button>
                    </Box>
                    <ReportDialog dialogOpen={ reportOpen } heading={ reportHeading } body={ reportBody } actions={ reportActions }  />
                </Box>
            </CardContent>
        </Card>
        </Container>
        </MuiPickersUtilsProvider>
)
}