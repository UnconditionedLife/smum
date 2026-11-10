import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Card, FormControl, InputLabel, MenuItem, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CalendarMonth, CardGiftcard, ChildCare, EventNote, PlayArrow, Today } from '@mui/icons-material';
import { Select, TextField, FormTextField } from '../../System'
import { DatePicker } from '@mui/x-date-pickers' // MuiPickersUtilsProvider
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getSvcTypes } from '../../System/js/Database.js';
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

    const [ days, handleDaysChange] = useState("90")
    const [ minVisits, handleMinVisitsChange] = useState("3")
    const [ maxVisits, handleMaxVisitsChange] = useState("5")
    


    
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
        // Pickers pass null or an invalid date while the user is typing
        if (event?.isValid()) handleReportDayChange(event.format('YYYYMMDD'))
    }

    const handleFoodYearMonthChangeUpdated = (event) => {
        // Pickers pass null or an invalid date while the user is typing
        if (event?.isValid()) handleFoodYearMonthChange(event.format("YYYYMM"))
    }

    const handleReportYearChangeUpdated = (event) => {
        // Pickers pass null or an invalid date while the user is typing
        if (event?.isValid()) handleReportYearChange(event.format("YYYY"))
    }

    const handleReportVoucherYearChangeUpdated = (event) => {
        // Pickers pass null or an invalid date while the user is typing
        if (event?.isValid()) handleReportVoucherYearChange(event.format("YYYY"))
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

    const fieldSx = { m: 0 }
    const datePickerProps = { slotProps: { textField: { size: 'small', fullWidth: true, sx: fieldSx } } }

    return (
        // </MuiPickersUtilsProvider>
        <Box sx={{ mt: 2, px: { xs: 1, sm: 0 } }}>
            <LocalizationProvider dateAdapter={ AdapterDayjs } >
            <Card sx={{ m: 0 }}>
                <Box sx={{ px: 2.5, py: 1.75, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant='h6'>Distribution Reports</Typography>
                </Box>
                <ReportCard icon={ <Today /> } title='Daily' onRun={ runDailyReport }>
                    <FormControl variant='outlined' size='small' fullWidth sx={ fieldSx }>
                        <InputLabel>Report</InputLabel>
                        <Select value={dayType} onChange={(event) => handleDayType(event.target.value)} name="report" label="Report">
                                <MenuItem value="FOOD">Food Only</MenuItem>
                                <MenuItem value="FOODBANK">Food Bank USDA EFA 7</MenuItem>
                                <MenuItem value="FOODBANKNONUSDA">Food Bank Non USDA</MenuItem>
                        </Select>
                    </FormControl>
                    <DatePicker 
                        label="Day" 
                        value={ dayjs(reportDay) } 
                        slotProps={{ textField: { size: 'small', fullWidth: true, sx: fieldSx,
                            slotProps: { inputLabel: { shrink: true } } } }}
                        onChange={ handleReportDayChangeUpdated }
                        minDate={dayjs("2017-01-01")}
                        maxDate={dayjs()}
                        format="MMM DD YYYY"
                        />
                </ReportCard>

                <ReportCard icon={ <CalendarMonth /> } title='Monthly' onRun={ runFoodReport }>
                    <FormControl variant='outlined' size='small' fullWidth sx={ fieldSx }>
                        <InputLabel>Report</InputLabel>
                        <Select value={foodType} onChange={(event) => handleFoodType(event.target.value)} name="report" label="Report">
                                <MenuItem value="FOOD">Food Only</MenuItem>
                                <MenuItem value="ALLTOTALS">All Services Totals</MenuItem>
                                <MenuItem value="ALLBYDAY">All Services By Day</MenuItem>
                                <MenuItem value="NEWCLIENT">New Clients By Zip</MenuItem>
                                <MenuItem value="ETHNICITY">Clients By Ethnicity</MenuItem>
                        </Select>
                    </FormControl>
                    <DatePicker 
                        label='Year and Month' name="yearMonth" views={["month", "year"]} value={ dayjs(foodYearMonth) } 
                        { ...datePickerProps }
                        onChange={ handleFoodYearMonthChangeUpdated }
                        minDate={dayjs("2017-01-01")}
                        maxDate={dayjs()} />
                </ReportCard>

                <ReportCard icon={ <EventNote /> } title='Annual' onRun={ runYearReport }>
                    <FormControl variant='outlined' size='small' fullWidth sx={ fieldSx }>
                        <InputLabel>Report</InputLabel>
                        <Select value={yearType} onChange={(event) => handleYearType(event.target.value)} name="report" label="Report" >
                                <MenuItem value="FOOD">Food Only</MenuItem>
                        </Select>
                    </FormControl>
                    <DatePicker 
                        label='Year' name="year" views={["year"]} value={ dayjs(reportYear) } 
                        { ...datePickerProps }
                        onChange={ handleReportYearChangeUpdated }
                        minDate={dayjs("2017-01-01")}
                        maxDate={dayjs()}
                         />
                </ReportCard>

                <ReportCard icon={ <CardGiftcard /> } title='Holiday Vouchers' onRun={ runVoucherReport }>
                    <FormControl variant='outlined' size='small' fullWidth sx={ fieldSx }>
                        <InputLabel>Report</InputLabel>
                        <Select value={voucherType} onChange={(event) => handleVoucherType(event.target.value)} 
                            name="report" label="Report">
                            <MenuItem value="TURKEY">Thanksgiving Turkey</MenuItem>
                            <MenuItem value="GIFTCARD">Christmas Gift Card</MenuItem>
                            <MenuItem value="TOY">Christmas Toy</MenuItem>
                        </Select>
                    </FormControl>
                    <DatePicker
                        label='Year' name="year" views={["year"]} value={ dayjs(reportVoucherYear) } 
                        { ...datePickerProps }
                        onChange={ handleReportVoucherYearChangeUpdated }
                        minDate={dayjs("2017-01-01")}
                        maxDate={dayjs()}
                         />
                </ReportCard>

                <ReportCard icon={ <ChildCare /> } title='Population' onRun={ runPopulationReport }>
                    <FormControl variant='outlined' size='small' fullWidth sx={ fieldSx }>
                        <InputLabel>Report</InputLabel>
                        <Select value={populationType} onChange={(event) => handlePopulationType(event.target.value)} 
                            name="report" label="Report">
                            <MenuItem default={ true } value="CHILDREN-BY-VISITS">Children by Food Services (Counts)</MenuItem>
                            <MenuItem default={ true } value="CHILDREN-BY-VISITS-FULL">Children by Food Services (Full)</MenuItem>
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                        <TextField sx={ fieldSx } value={ days } size="small" name="days" label="Days"
                            onChange={(event) => handleDays(event.target.value)}/>
                        <TextField sx={ fieldSx } value={ minVisits } size="small" name="minVisits" label="Min Visits"
                            onChange={(event) => handleMinVisits(event.target.value)}/>
                        <TextField sx={ fieldSx } value={ maxVisits } size="small" name="maxVisits" label="Max Visits"
                            onChange={(event) => handleMaxVisits(event.target.value)}/>
                    </Box>
                </ReportCard>
            </Card>
            </LocalizationProvider>

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
                            <TextField width={ 240 } m={ 0 } size='small' label="Year" slotProps={{ inputLabel: { shrink: true } }} type="number" />
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
                            <TextField width={ 240 } m={ 0 } size='small' label="Year" slotProps={{ inputLabel: { shrink: true } }} type="number" />
                            </FormControl>
                            <Button variant="contained" color="primary">Run</Button>
                        </Box> */}
                        <ReportDialog dialogOpen={ reportOpen } heading={ reportHeading } body={ reportBody } actions={ reportActions }  />
        </Box>
    );
}

ReportCard.propTypes = {
    icon: PropTypes.element.isRequired,
    title: PropTypes.string.isRequired,
    onRun: PropTypes.func.isRequired,
    children: PropTypes.node,
}

// One report per row: name | report + period fields | Run
function ReportCard({ icon, title, onRun, children }) {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '180px minmax(0, 1fr) minmax(0, 1fr) auto' },
            alignItems: 'center',
            gap: { xs: 1.5, md: 2 },
            px: 2.5,
            py: 2,
            '& + &': { borderTop: 1, borderColor: 'divider' },
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '8px', display: 'grid', placeItems: 'center',
                    color: 'primary.main', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    '& svg': { fontSize: 18 } }}>
                    { icon }
                </Box>
                <Typography variant='subtitle2'>{ title }</Typography>
            </Box>
            { children }
            <Button onClick={ onRun } variant="contained" color="primary" size="small" startIcon={ <PlayArrow /> }
                sx={{ m: 0, minWidth: 88 }}>Run</Button>
        </Box>
    )
}
