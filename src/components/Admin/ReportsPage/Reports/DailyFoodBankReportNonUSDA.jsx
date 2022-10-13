import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetValidSvcsByDateAsync } from '../../../System/js/Database';
import { useTheme } from '@mui/material/styles';

DailyFoodBankReportNonUSDA.propTypes = {
    day: PropTypes.string
}

export default function DailyFoodBankReportNonUSDA(props) {
    const [services, setServices] = useState([])
    // const [servicesNonUSDA, setServicesNonUSDA] = useState([])
    // const [totalsUSDA, setTotalsUSDA] = useState(defaultTotals)
    // const [totalsNonUSDA, setTotalsNonUSDA] = useState(defaultTotals)
    const [loading, setLoading] = useState(true)

    const reportDay = moment( props.day ).format("MMM DD, YYYY").toLocaleUpperCase()

    const theme = useTheme()


    useEffect(()=>{
        RunReport()
    },[])

    function ListToGrid(svcList) {
        let grid = []
        svcList.forEach(elem => {
            let item = {"svcId": elem.svcId,
                "id": elem.cId, "given": elem.cGivName,
                "family": elem.cFamName, "zipcode": elem.cZip, 
                "street": (elem.cStreet == "(8)") ? "(homeless)": elem.cStreet,
                
                "households": "1", "individuals": elem.individuals,
                "children": elem.children, 
                "adults": svcNumberToInt(elem.adults) + svcNumberToInt(elem.seniors) }
            if (elem.homeless == "YES") {
                if (elem.individuals == 1) {
                    item["homelessHouseholds"] = "-"
                    item["homelessSingles"] = "1"
                }
                else {
                    item["homelessHouseholds"] = "1"
                    item["homelessSingles"] = elem.individuals
                }
            } else {
                item["homelessHouseholds"] = "-"
                item["homelessSingles"] = "-"
            }

            if (elem.cStatus == "Client") {
                item["nonClientHouseholds"] = "-"
                item["nonClientSingles"] = "-"
            } else {
                if (elem.individuals == 1) {
                    item["nonClientHouseholds"] = "-"
                    item["nonClientSingles"] = "1"
                }
                else {
                    item["nonClientHouseholds"] = "1"
                    item["nonClientSingles"] = elem.individuals
                }
            }
            if (elem.svcUSDA == "USDA") {
                item["USDA"] = "YES"
                item["NonUSDA"] = ""
            } else {
                item["USDA"] = ""
                item["NonUSDA"] = "NO"
            }
            grid.push(item)
        })
        return grid
    }

    function svcNumberToInt(svcNumber) {
        return isNaN(svcNumber) ? 0 :  parseInt(svcNumber)
    }

    function RunReport() {
        dbGetValidSvcsByDateAsync(moment(props.day).format('YYYY-MM'), "Food_Pantry", moment(props.day).format('YYYY-MM-DD'))
            .then(svcs => {
                const servicesFood = svcs.filter(item => item.svcUSDA == "NonUSDA")
                const foodGrid = ListToGrid(servicesFood)
                setServices(foodGrid)
                setLoading(false)
            })
    }

    function RenderSvcList(svcList) {
        const jsxCode = svcList.map(svc => 
            <TableRow className='rightText' key={svc.svcId}>
                <style>
                    {   `@media print { 
                            .rightText { 
                                text-align: right;
                                font-size: 14px;
                            },
                            .leftText { 
                                text-align: left;
                                font-size: 14px;
                            },
                            .centerText { 
                                text-align: center;
                                font-size: 14px;
                            }
                        }`
                    }
                </style>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {svc.id}
            </TableCell>
            <TableCell className='leftText' align="left">
                <style> { `@media print { .leftText { text-align: left; font-size: 14px; } }` } </style>
                {svc.given}
            </TableCell>
            <TableCell className='leftText' align="left">
                <style> { `@media print { .leftText { text-align: left; font-size: 14px; } }` } </style>
                {svc.family}
            </TableCell>
            <TableCell className='leftText' align="left">
                <style> {  `@media print { .leftText { text-align: left; font-size: 14px; } }` } </style>
                {svc.street}
            </TableCell>
            <TableCell className='leftText' align="left">
                <style> { `@media print { .leftText { text-align: left; font-size: 14px; } }` } </style>
                {svc.zipcode}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {svc.adults}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {svc.children}
            </TableCell>
            </TableRow>
        )
        return jsxCode
    }

    return (
        <Box m={ 1 }>
        <TableContainer align="center">
            <Table className='fontFamily' padding="checkbox" size="small" align="center">
                <style>
                    {`@media print { 
                        .fontFamily {
                            font-family: Arial, Helvetica, sans-serif;
                            }
                        }`
                    }
                </style>
                <ReportsHeader reportDate={ reportDay }
                    reportType="DAILY REPORT" 
                    reportCategory="FOOD BANK NON USDA"
                    groupColumns={[{"name": "Print Name (Clients)", "length": 3}, 
                        {"name": "Address (Include Zip Code)", "length": 2}, 
                        {"name": "Family Size", "length": 2}]}
                    columns={["ID", "Given", "Family", "Address", "Zip", "A", "C"]} />
            <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={7}>
                        <CircularProgress color="secondary" />
                    </TableCell>
                </TableRow>) : null}

            {RenderSvcList(services)}
            {/* {RenderListTotals(totalsUSDA, "USDA Totals")} */}
            <TableRow className="greenBackground centerText" style={{ backgroundColor: theme.palette.primary.light }}>
                <style>
                    { `@media print { 
                            .greenBackground { 
                                text-align: right;
                                background-color: rgb(104, 179, 107);
                                -webkit-print-color-adjust: exact;
                                font-size: 14px;
                            },
                            .rightText { text-align: right; font-size: 14px; }
                        }`
                    }
                </style>
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }}` } </style>
                <TableCell className='centerText' align="center" colSpan={7}>
                    <strong>Office Use Only</strong>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{borderBottom:"none"}} className='centerText' align="center">Households = _____</TableCell>
                <TableCell style={{borderBottom:"none"}} className='centerText' align="center">Individuals = _____</TableCell>
                <TableCell style={{borderBottom:"none"}} className='centerText' align="center">Children = _____</TableCell>
                <TableCell style={{borderBottom:"none"}} className='centerText' align="center">Adults = _____</TableCell>
                <TableCell style={{borderBottom:"none"}} className='rightText' align="right" colSpan={3}>Homeless: F = _____</TableCell>
            </TableRow>
            <TableRow>
                <TableCell colspan={4}></TableCell>
                <TableCell className='rightText' align="right" colSpan={3}>T = _____</TableCell>
            </TableRow>
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}