import React, { useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Container, FormControl, InputLabel, MenuItem, Typography } from '@material-ui/core';
import { Select, TextField } from '../../System'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { getSvcTypes } from '../../System/js/Database.js';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import ReportDialog from './ReportDialog.jsx';
import NewClientsReport from './Reports/NewClientsReport.jsx';
import DailyDistributionReport from './Reports/DailyDistributionReport.jsx';
import MonthlyDistributionReport from './Reports/MonthlyDistributionReport.jsx';
import AnnualDistributionReport from './Reports/AnnualDistributionReport.jsx';

export default function ReportsPage() {
    const [ dayType, handleDayType ] = useState("FOOD")
    const [ reportDay, handleReportDayChange ] = useState(moment().format('YYYYMMDD'))
    
    const [ foodYearMonth, handleFoodYearMonthChange ] = useState(moment().format('YYYYMM'))
    const [ foodType, handleFoodType ] = useState("FOOD")
    
    const [ yearType, handleYearType ] = useState("FOOD")
    const [ reportYear, handleReportYearChange ] = useState(moment().format('YYYY'))

    
    const [reportOpen, setReportOpen] = useState(false)
    const [reportHeading, setReportHeading] = useState('')
    const [reportBody, setReportBody] = useState(null)
    const [reportActions, setReportActions] = useState(null)

    const svcTypes = getSvcTypes()
    const voucherSvcTypes = svcTypes.filter(s => (s.isActive == 'Active' && s.fulfillment.type == 'Voucher'))

    const runFoodReport = () => {
        if (foodType == "NEWCLIENT") {
            setReportHeading("New Clients " + moment(foodYearMonth).format('MMM, YYYY') + " Report");
            setReportOpen(true);
            setReportBody(<NewClientsReport yearMonth={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (foodType == "FOOD") {
            setReportHeading("Distribution " + moment(reportYear).format('MMM, YYYY') + " Report");
            setReportOpen(true);
            console.log(foodYearMonth)
            setReportBody(<MonthlyDistributionReport month={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
    }

    const runYearReport = () => {
        if (yearType == "FOOD") {
            setReportHeading("Distribution " + moment(reportYear).format('YYYY') + " Report");
            setReportOpen(true);
            console.log(reportYear)
            setReportBody(<AnnualDistributionReport year={reportYear} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
    }

    const runDailyReport = () => {
        if (dayType == "FOOD") {
            setReportHeading("Distribution " + moment(reportDay).format('MMM, DD, YYYY') + " Report");
            setReportOpen(true);
            setReportBody(<DailyDistributionReport />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
    }

    const handleFoodYearMonthChangeUpdated = (event) => {
        handleFoodYearMonthChange(moment(event._d).format("YYYYMM"))
    }

    const handleReportYearChangeUpdated = (event) => {
        console.log(event)
        handleReportYearChange(moment(event._d).format("YYYY"))
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
                        <Select value={dayType} onChange={(event) => handleDayType(event.target.value)} width={ 240 } name="report" label="Report">
                                <MenuItem value="FOOD">Food Only</MenuItem>
                        </Select>
                        </FormControl>
                        <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}}  width={ 240 } m={ 0 } size='small' label="Day" InputLabelProps={{ shrink: true }} value={ reportDay } onChange={ handleReportDayChange } />
                        <Button onClick={runDailyReport} variant="contained" color="primary">Run</Button>
                    </Box>

                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Monthly Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                        <InputLabel>Report</InputLabel>
                        <Select value={foodType} onChange={(event) => handleFoodType(event.target.value)} width={ 240 } name="report" label="Report">
                                <MenuItem value="FOOD">Food Only</MenuItem>
                                <MenuItem value="NEWCLIENT">New Client</MenuItem>
                        </Select>
                        </FormControl>
                        <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}} label='Year and Month' name="yearMonth" views={["year", "month"]} value={ foodYearMonth } onChange={ handleFoodYearMonthChangeUpdated } />
                        <Button onClick={runFoodReport} variant="contained" color="primary">Run</Button>
                    </Box>

                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Annual Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                        <InputLabel>Report</InputLabel>
                        <Select value={yearType} onChange={(event) => handleYearType(event.target.value)} width={ 240 } name="report" label="Report">
                                <MenuItem value="FOOD">Food Only</MenuItem>
                        </Select>
                        </FormControl>
                        <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}} label='Year' name="year" views={["year"]} value={ reportYear } onChange={ handleReportYearChangeUpdated } />
                        <Button onClick={runYearReport} variant="contained" color="primary">Run</Button>
                    </Box>
                    {/* <Box mt={ 10 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Voucher Distribution Reports</Typography></Box>
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
                    </Box> */}
                    <ReportDialog dialogOpen={ reportOpen } heading={ reportHeading } body={ reportBody } actions={ reportActions }  />
                </Box>
            </CardContent>
        </Card>
        </Container>
        </MuiPickersUtilsProvider>
)
}