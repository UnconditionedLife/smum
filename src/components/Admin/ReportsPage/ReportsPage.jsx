import React, { useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Container, FormControl, InputLabel, MenuItem, Typography } from '@mui/material';
import { Select, TextField } from '../../System'
import { DatePicker } from '@mui/x-date-pickers' // MuiPickersUtilsProvider
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { getSvcTypes } from '../../System/js/Database.js';
// import MomentUtils from '@date-io/moment';
import moment from 'moment';
import ReportDialog from './ReportDialog.jsx';
import NewClientsReport from './Reports/NewClientsReport.jsx';
import DailyDistributionReport from './Reports/DailyDistributionReport.jsx';
import DailyFoodBankReport from './Reports/DailyFoodBankReport.jsx';
import MonthlyDistributionReport from './Reports/MonthlyDistributionReport.jsx';
import AnnualDistributionReport from './Reports/AnnualDistributionReport.jsx';
import AllMonthlyServicesReport from './Reports/AllMonthlyServicesReport.jsx';
import AllServicesByDayReport from './Reports/AllServicesByDayReport.jsx';

import { PatchSeniorCountInServiceDay } from '../../System/js/Patch';
import EthnicityReport from './Reports/EthnicityReport.jsx';
import DailyFoodBankReportNonUSDA from './Reports/DailyFoodBankReportNonUSDA.jsx';
import ThanksgivingTurkeyReport from './Reports/ThanksgivingTurkeyReport.jsx';

export default function ReportsPage() {
    const [ dayType, handleDayType ] = useState("FOOD")
    const [ reportDay, handleReportDayChange ] = useState(moment().format('YYYYMMDD'))
    
    const [ foodYearMonth, handleFoodYearMonthChange ] = useState(moment().format('YYYYMM'))
    const [ foodType, handleFoodType ] = useState("FOOD")
    
    const [ yearType, handleYearType ] = useState("FOOD")
    const [ reportYear, handleReportYearChange ] = useState(moment().format('YYYY'))

    const [ voucherType, handleVoucherType ] = useState("TURKEY")
    const [ reportVoucherYear, handleReportVoucherYearChange ] = useState(moment().format('YYYY'))

    
    const [reportOpen, setReportOpen] = useState(false)
    const [reportHeading, setReportHeading] = useState('')
    const [reportBody, setReportBody] = useState(null)
    const [reportActions, setReportActions] = useState(null)

    const svcTypes = getSvcTypes()
    const voucherSvcTypes = svcTypes.filter(s => (s.isActive == 'Active' && s.fulfillment.type == 'Voucher'))

    const runFoodReport = () => {
        if (foodType == "NEWCLIENT") {
            setReportHeading("New Clients - Monthly Report - " + moment(foodYearMonth).format('MMM YYYY'));
            setReportOpen(true);
            setReportBody(<NewClientsReport yearMonth={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (foodType == "ALLTOTALS") {
            setReportHeading("ALL Services Totals - Monthly Report - " + moment(foodYearMonth).format('MMM YYYY') );
            setReportOpen(true);
            setReportBody(<AllMonthlyServicesReport month={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (foodType == "ALLBYDAY") {
            setReportHeading("ALL Services By Day - Monthly Report - " + moment(foodYearMonth).format('MMM YYYY') );
            setReportOpen(true);
            setReportBody(<AllServicesByDayReport month={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (foodType == "FOOD") {
            setReportHeading("Food Pantry - Monthly Report - " + moment(foodYearMonth).format('MMM YYYY'));
            setReportOpen(true);
            setReportBody(<MonthlyDistributionReport month={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (foodType == "ETHNICITY") {
            setReportHeading("Ethnicity - Monthly Report - " + moment(foodYearMonth).format('MMM YYYY'));
            setReportOpen(true);
            setReportBody(<EthnicityReport yearMonth={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
    }

    const runYearReport = () => {
        if (yearType == "FOOD") {
            setReportHeading("Food Pantry - Annual Report - " + moment(reportYear).format('YYYY'));
            setReportOpen(true);
            setReportBody(<AnnualDistributionReport year={reportYear} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
    }

    const runVoucherReport = () => {
        if (voucherType == "TURKEY") {
            setReportHeading("Thanksgiving Turkey - Annual Report - " + moment(reportVoucherYear).format('YYYY'));
            setReportOpen(true);
            setReportBody(<ThanksgivingTurkeyReport year={reportVoucherYear} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
    }

    const runDailyReport = () => {
        if (dayType == "FOOD") {
            setReportHeading("Food Pantry - Daily Report - " + moment(reportDay).format('MMM DD YYYY'));
            setReportOpen(true);
            setReportBody(<DailyDistributionReport day={ reportDay } />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (dayType == "FOODBANK") {
            setReportHeading("Food Bank EFA 7 - Daily Report - " + moment(reportDay).format('MMM DD YYYY'));
            setReportOpen(true);
            setReportBody(<DailyFoodBankReport day={ reportDay } />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (dayType == "FOODBANKNONUSDA") {
            setReportHeading("Food Bank Non USDA - Daily Report - " + moment(reportDay).format('MMM DD YYYY'));
            setReportOpen(true);
            setReportBody(<DailyFoodBankReportNonUSDA day={ reportDay } />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
    }

    const handleReportDayChangeUpdated = (event) => {
        handleReportDayChange(moment(event._d).format('YYYYMMDD'))
    }

    const handleFoodYearMonthChangeUpdated = (event) => {
        handleFoodYearMonthChange(moment(event._d).format("YYYYMM"))
    }

    const handleReportYearChangeUpdated = (event) => {
        handleReportYearChange(moment(event._d).format("YYYY"))
    }

    const handleReportVoucherYearChangeUpdated = (event) => {
        handleReportVoucherYearChange(moment(event._d).format("YYYY"))
    }

    return (
        // <MuiPickersUtilsProvider utils={MomentUtils}>
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
                                <MenuItem value="FOODBANK">Food Bank USDA EFA 7</MenuItem>
                                <MenuItem value="FOODBANKNONUSDA">Food Bank Non USDA</MenuItem>
                        </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={ AdapterMoment } >
                            <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}}  width={ 240 } m={ 0 } size='small' label="Day" 
                                InputLabelProps={{ shrink: true }} 
                                value={ reportDay } 
                                renderInput={(params) => <TextField {...params} />}
                                onChange={ handleReportDayChangeUpdated }
                                minDate={moment("2017-01-01")}
                                maxDate={moment()}
                                inputFormat="MMM DD YYYY"
                                disableMaskedInput
                                />
                        </LocalizationProvider>
                        <Button onClick={runDailyReport} variant="contained" color="primary">Run</Button>
                    </Box>

                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Monthly Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                        <InputLabel>Report</InputLabel>
                        <Select value={foodType} onChange={(event) => handleFoodType(event.target.value)} width={ 240 } name="report" label="Report">
                                <MenuItem value="FOOD">Food Only</MenuItem>
                                <MenuItem value="ALLTOTALS">All Services Totals</MenuItem>
                                <MenuItem value="ALLBYDAY">All Services By Day</MenuItem>
                                <MenuItem value="NEWCLIENT">New Clients By Zip</MenuItem>
                                <MenuItem value="ETHNICITY">Clients By Ethnicity</MenuItem>
                        </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={ AdapterMoment } >
                            <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}} label='Year and Month' name="yearMonth" views={["month", "year"]} value={ foodYearMonth } 
                                renderInput={(params) => <TextField {...params} />}
                                onChange={ handleFoodYearMonthChangeUpdated }
                                minDate={moment("2017-01-01")}
                                maxDate={moment()} />
                        </LocalizationProvider>
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
                        <LocalizationProvider dateAdapter={ AdapterMoment } >
                            <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}} label='Year' name="year" views={["year"]} value={ reportYear } 
                                renderInput={(params) => <TextField {...params} />}
                                onChange={ handleReportYearChangeUpdated }
                                minDate={moment("2017-01-01")}
                                maxDate={moment()}
                                 />
                        </LocalizationProvider>
                        <Button onClick={runYearReport} variant="contained" color="primary">Run</Button>
                    </Box>

                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Annual Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                        <InputLabel>Report</InputLabel>
                        <Select value={voucherType} onChange={(event) => handleVoucherType(event.target.value)} width={ 240 } name="report" label="Report">
                                <MenuItem value="TURKEY">Thanksgiving Turkey</MenuItem>
                        </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={ AdapterMoment } >
                            <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}} label='Year' name="year" views={["year"]} value={ reportVoucherYear } 
                                renderInput={(params) => <TextField {...params} />}
                                onChange={ handleReportVoucherYearChangeUpdated }
                                minDate={moment("2017-01-01")}
                                maxDate={moment()}
                                 />
                        </LocalizationProvider>
                        <Button onClick={runVoucherReport} variant="contained" color="primary">Run</Button>
                    </Box>

                    {/* <Box mt={ 10 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Voucher Distribution Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                        <InputLabel>Report</InputLabel>
                        <Select width={ 240 } name="report" label="Report">
                            { voucherSvcTypes.map((item) => (
                                <MenuItem value={ item.svcTypeId } key={ item.svcTypeId }>{ item.svcName }</MenuItem>
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
                                <MenuItem value={ item.svcTypeId } key={ item.svcTypeId }>{ item.svcName }</MenuItem>
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
        // </MuiPickersUtilsProvider>
)
}