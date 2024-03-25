import React, { useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Container, FormControl, InputLabel, MenuItem, Typography } from '@mui/material';
import { Select, TextField, FormTextField } from '../../System'
import { DatePicker } from '@mui/x-date-pickers' // MuiPickersUtilsProvider
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getSvcTypes } from '../../System/js/Database.js';
// import MomentUtils from '@date-io/moment';
// import moment from 'moment';
import dayjs from 'dayjs';
import ReportDialog from './ReportDialog.jsx';
import NewClientsReport from './Reports/NewClientsReport.jsx';
import DailyDistributionReport from './Reports/DailyDistributionReport.jsx';
import DailyFoodBankReport from './Reports/DailyFoodBankReport.jsx';
import MonthlyDistributionReport from './Reports/MonthlyDistributionReport.jsx';
import AnnualDistributionReport from './Reports/AnnualDistributionReport.jsx';
import AllMonthlyServicesReport from './Reports/AllMonthlyServicesReport.jsx';
import AllServicesByDayReport from './Reports/AllServicesByDayReport.jsx';
import PopulationChildrenByAgeReport from './Reports/PopulationChildrenByAgeReport.jsx';
import PopulationChildrenByAgeReportClientInfo from './Reports/PopulationChildrenByAgeReportClientInfo.jsx';

import { PatchSeniorCountInServiceDay } from '../../System/js/Patch';
import EthnicityReport from './Reports/EthnicityReport.jsx';
import DailyFoodBankReportNonUSDA from './Reports/DailyFoodBankReportNonUSDA.jsx';
import ThanksgivingTurkeyReport from './Reports/ThanksgivingTurkeyReport.jsx';
import ChristmasGiftCardReport from './Reports/ChristmasGiftCardReport.jsx';
import ChristmasToyReport from './Reports/ChristmasToyReport.jsx';

export default function ReportsPage() {
    const [ dayType, handleDayType ] = useState("FOOD")
    const [ reportDay, handleReportDayChange ] = useState(dayjs().format('YYYYMMDD'))
    
    const [ foodYearMonth, handleFoodYearMonthChange ] = useState(dayjs().format('YYYYMM'))
    const [ foodType, handleFoodType ] = useState("FOOD")
    
    const [ yearType, handleYearType ] = useState("FOOD")
    const [ reportYear, handleReportYearChange ] = useState(dayjs().format('YYYY'))

    const [ voucherType, handleVoucherType ] = useState("TURKEY")
    const [ reportVoucherYear, handleReportVoucherYearChange ] = useState(dayjs().format('YYYY'))

    const [ populationType, handlePopulationType ] = useState("CHILDREN-BY-VISITS")

    const [ days, handleDaysChange] = useState(90)
    const [ minVisits, handleMinVisitsChange] = useState(3)
    const [ maxVisits, handleMaxVisitsChange] = useState(5)
    


    
    const [reportOpen, setReportOpen] = useState(false)
    const [reportHeading, setReportHeading] = useState('')
    const [reportBody, setReportBody] = useState(null)
    const [reportActions, setReportActions] = useState(null)

    const svcTypes = getSvcTypes()
    const voucherSvcTypes = svcTypes.filter(s => (s.isActive == 'Active' && s.fulfillment.type == 'Voucher'))

    const runFoodReport = () => {
        if (foodType == "NEWCLIENT") {
            setReportHeading("New Clients - Monthly Report - " + dayjs(foodYearMonth).format('MMM YYYY'));
            setReportOpen(true);
            setReportBody(<NewClientsReport yearMonth={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (foodType == "ALLTOTALS") {
            setReportHeading("ALL Services Totals - Monthly Report - " + dayjs(foodYearMonth).format('MMM YYYY') );
            setReportOpen(true);
            setReportBody(<AllMonthlyServicesReport month={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (foodType == "ALLBYDAY") {
            setReportHeading("ALL Services By Day - Monthly Report - " + dayjs(foodYearMonth).format('MMM YYYY') );
            setReportOpen(true);
            setReportBody(<AllServicesByDayReport month={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (foodType == "FOOD") {
            setReportHeading("Food Pantry - Monthly Report - " + dayjs(foodYearMonth).format('MMM YYYY'));
            setReportOpen(true);
            setReportBody(<MonthlyDistributionReport month={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (foodType == "ETHNICITY") {
            setReportHeading("Ethnicity - Monthly Report - " + dayjs(foodYearMonth).format('MMM YYYY'));
            setReportOpen(true);
            setReportBody(<EthnicityReport yearMonth={foodYearMonth} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
    }

    const runYearReport = () => {
        if (yearType == "FOOD") {
            setReportHeading("Food Pantry - Annual Report - " + dayjs(reportYear).format('YYYY'));
            setReportOpen(true);
            setReportBody(<AnnualDistributionReport year={reportYear} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
    }

    const runVoucherReport = () => {
        if (voucherType == "TURKEY") {
            setReportHeading("Thanksgiving Turkey - Annual Report - " + dayjs(reportVoucherYear).format('YYYY'));
            setReportOpen(true);
            setReportBody(<ThanksgivingTurkeyReport year={reportVoucherYear} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (voucherType == "GIFTCARD") {
            setReportHeading("Christmas Gift Card - Annual Report - " + dayjs(reportVoucherYear).format('YYYY'));
            setReportOpen(true);
            setReportBody(<ChristmasGiftCardReport year={reportVoucherYear} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (voucherType == "TOY") {
            setReportHeading("Christmas Toy Card - Annual Report - " + dayjs(reportVoucherYear).format('YYYY'));
            setReportOpen(true);
            setReportBody(<ChristmasToyReport year={reportVoucherYear} />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
    }

    const runDailyReport = () => {
        if (dayType == "FOOD") {
            setReportHeading("Food Pantry - Daily Report - " + dayjs(reportDay).format('MMM DD YYYY'));
            setReportOpen(true);
            setReportBody(<DailyDistributionReport day={ reportDay } />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (dayType == "FOODBANK") {
            setReportHeading("Food Bank EFA 7 - Daily Report - " + dayjs(reportDay).format('MMM DD YYYY'));
            setReportOpen(true);
            setReportBody(<DailyFoodBankReport day={ reportDay } />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
        if (dayType == "FOODBANKNONUSDA") {
            setReportHeading("Food Bank Non USDA - Daily Report - " + dayjs(reportDay).format('MMM DD YYYY'));
            setReportOpen(true);
            setReportBody(<DailyFoodBankReportNonUSDA day={ reportDay } />);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }
    }

    const runPopulationReport = () => {
        if (populationType == "CHILDREN-BY-VISITS") {
            setReportHeading("Children in Population by Food Services in " + days + " Days");
            setReportOpen(true);
            setReportBody(<PopulationChildrenByAgeReport days={ days } minVisits={ minVisits } maxVisits={ maxVisits }/>);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }

        if (populationType == "CHILDREN-BY-VISITS-FULL") {
            setReportHeading("Children in Population by Food Services in " + days + " Days Between " + minVisits + "-" + maxVisits + " Visits");
            setReportOpen(true);
            setReportBody(<PopulationChildrenByAgeReportClientInfo days={ days } minVisits={ minVisits } maxVisits={ maxVisits }/>);
            const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
            setReportActions(buttonCode);
        }

        // if (populationType == "ALL-CHILDREN-BY-VISITS") {
        //     setReportHeading("All Children in Population - Visits");
        //     setReportOpen(true);
        //     setReportBody(<PopulationChildrenByAgeByVisitsReport day={ reportDay } />);
        //     const buttonCode = (<Button variant="outlined" color="secondary" onClick={ () => setReportOpen(false) }>Close Report</Button>)
        //     setReportActions(buttonCode);
        // }
    }

    const handleReportDayChangeUpdated = (event) => {
        handleReportDayChange(dayjs(event.$d).format('YYYYMMDD'))
    }

    const handleFoodYearMonthChangeUpdated = (event) => {
        handleFoodYearMonthChange(dayjs(event.$d).format("YYYYMM"))
    }

    const handleReportYearChangeUpdated = (event) => {
        handleReportYearChange(dayjs(event.$d).format("YYYY"))
    }

    const handleReportVoucherYearChangeUpdated = (event) => {
        handleReportVoucherYearChange(dayjs(event.$d).format("YYYY"))
    }

    const handleDays = (value) => {
        handleDaysChange(value)
    }

    const handleMinVisits = (value) => {
        handleMinVisitsChange(value)
    }

    const handleMaxVisits = (value) => {
        handleMaxVisitsChange(value)
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
                        <LocalizationProvider dateAdapter={ AdapterDayjs } >
                            <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}}  width={ 240 } m={ 0 } size='small' label="Day" 
                                InputLabelProps={{ shrink: true }} 
                                value={ reportDay } 
                                renderInput={(params) => <TextField {...params} />}
                                onChange={ handleReportDayChangeUpdated }
                                minDate={dayjs("2017-01-01")}
                                maxDate={dayjs()}
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
                        <LocalizationProvider dateAdapter={ AdapterDayjs } >
                            <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}} label='Year and Month' name="yearMonth" views={["month", "year"]} value={ foodYearMonth } 
                                renderInput={(params) => <TextField {...params} />}
                                onChange={ handleFoodYearMonthChangeUpdated }
                                minDate={dayjs("2017-01-01")}
                                maxDate={dayjs()} />
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
                        <LocalizationProvider dateAdapter={ AdapterDayjs } >
                            <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}} label='Year' name="year" views={["year"]} value={ reportYear } 
                                renderInput={(params) => <TextField {...params} />}
                                onChange={ handleReportYearChangeUpdated }
                                minDate={dayjs("2017-01-01")}
                                maxDate={dayjs()}
                                 />
                        </LocalizationProvider>
                        <Button onClick={runYearReport} variant="contained" color="primary">Run</Button>
                    </Box>

                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Annual Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                        <InputLabel style={{ marginTop:"8px", marginLeft:"4px" }}>Report</InputLabel>
                        <Box>
                            <Select value={voucherType} onChange={(event) => handleVoucherType(event.target.value)} 
                                width={ 240 } name="report" label="Report"
                                style={{ marginTop:"8px", marginLeft:"4px", marginRight:"0px" }}>
                                <MenuItem value="TURKEY">Thanksgiving Turkey</MenuItem>
                                <MenuItem value="GIFTCARD">Christmas Gift Card</MenuItem>
                                <MenuItem value="TOY">Christmas Toy</MenuItem>
                            </Select>
                        </Box>
                        </FormControl>
                        <LocalizationProvider dateAdapter={ AdapterDayjs } >
                            <DatePicker inputProps={{style: { paddingTop: '10px', paddingBottom:'10px'}}} label='Year' name="year" views={["year"]} value={ reportVoucherYear } 
                                renderInput={(params) => <TextField {...params} />}
                                onChange={ handleReportVoucherYearChangeUpdated }
                                minDate={dayjs("2017-01-01")}
                                maxDate={dayjs()}
                                 />
                        </LocalizationProvider>
                        </Box>
                        <Box style={{ marginTop:"8px" }}>
                            <Button onClick={runVoucherReport} variant="contained" color="primary"
                                style={{ marginTop:"8px", marginLeft:"8px", marginRight:"8px" }} 
                            >Run</Button>

                        </Box>
                    </Box>
                    <Box mt={ 2 } display="flex" flexDirection="row" flexWrap="wrap"><Typography>Population Reports</Typography></Box>
                    <Box display="flex" flexDirection="row" flexWrap="wrap">
                        <FormControl variant='outlined' size='small'>
                            <InputLabel style={{ marginTop:"8px", marginLeft:"4px" }}>Report</InputLabel>
                            <Box display='flex' flexDirection="row" flexWrap="wrap" >
                                <Box>
                                    <Select value={populationType} onChange={(event) => handlePopulationType(event.target.value)} 
                                        width={ 240 } name="report" label="Report" 
                                        style={{ marginTop:"8px", marginLeft:"4px", marginRight:"4px" }}>
                                        <MenuItem default={ true } value="CHILDREN-BY-VISITS">Children by Food Services (Counts)</MenuItem>
                                        <MenuItem default={ true } value="CHILDREN-BY-VISITS-FULL">Children by Food Services (Full)</MenuItem>
                                    </Select>
                                </Box>
                                <Box>
                                    <TextField style={{ width: "60px", marginTop:"8px", marginLeft:"4px", marginRight:"4px" }} 
                                        value={ days } size="small" name="days" label="Days"
                                        onChange={(event) => handleDays(event.target.value)}/>
                                </Box>
                                <Box>
                                    <TextField style={{ width: "75px", marginTop:"8px", marginLeft:"4px", marginRight:"4px" }} 
                                        value={ minVisits } size="small" name="minVisits" label="Min Visits"
                                        onChange={(event) => handleMinVisits(event.target.value)}/>
                                </Box>
                                <Box >
                                    <TextField style={{ width: "80px", marginTop:"8px", marginLeft:"4px", marginRight:"4px" }} 
                                        value={ maxVisits } size="small" name="maxVisits" label="Max Visits"
                                        onChange={(event) => handleMaxVisits(event.target.value)}/>
                                </Box>
                            </Box>
                        </FormControl>
                        <Box style={{ marginTop:"8px" }}>
                            <Button onClick={runPopulationReport} variant="contained" color="primary"
                                style={{ marginTop:"8px", marginLeft:"8px", marginRight:"8px" }} 
                            >Run</Button>
                        </Box>
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