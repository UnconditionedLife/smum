import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetValidSvcsByDateAsync } from '../../../System/js/Database';
import { useTheme } from '@mui/material/styles';

DailyDistributionReport.propTypes = {
    day: PropTypes.string
}

export default function DailyDistributionReport(props) {
    const defaultTotals = {"households": 0, "individuals": 0,
    "children": 0, "adults": 0,
    "seniors": 0, "homelessHouseholds": 0, "homelessSingles": 0,
    "nonClientHouseholds": 0, "nonClientSingles": 0}
    const [services, setServices] = useState([])
    // const [servicesNonUSDA, setServicesNonUSDA] = useState([])
    // const [totalsUSDA, setTotalsUSDA] = useState(defaultTotals)
    // const [totalsNonUSDA, setTotalsNonUSDA] = useState(defaultTotals)
    const [totalsDay, setTotalsDay] = useState(defaultTotals)
    const [loading, setLoading] = useState(true)

    const theme = useTheme()
    const greenBackground = { backgroundColor: theme.palette.primary.light }
    const reportDay = moment( props.day ).format("MMM DD, YYYY").toLocaleUpperCase()




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
                "children": elem.children, "adults": elem.adults,
                "seniors": elem.seniors}
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

    function computeGridTotals(gridList) {
        if (gridList.length == 0) {
            return defaultTotals
        }
        return gridList.reduce(function(previousValue, currentValue) {
            const usda = (currentValue.USDA == "YES") ? 1 : 0
            const nonusda = (currentValue.NonUSDA == "NO") ? 1 : 0
            const adults = svcNumberToInt(currentValue.adults + currentValue.seniors)

            return { "adults": svcNumberToInt(previousValue.adults) + adults, 
                    "children": svcNumberToInt(previousValue.children) + svcNumberToInt(currentValue.children), 
                    "USDA": previousValue.USDA + usda,
                    "NonUSDA": previousValue.NonUSDA + nonusda }
        }, {"adults": 0, "children": 0, "USDA": 0, "NonUSDA": 0 })
    }

    function RunReport() {
        dbGetValidSvcsByDateAsync(moment(props.day).format('YYYY-MM'), "Food_Pantry", moment(props.day).format('YYYY-MM-DD'))
            .then(svcs => {
                const servicesFood = svcs
                const foodGrid = ListToGrid(servicesFood)
                const foodTotals = computeGridTotals(foodGrid)
                setServices(foodGrid)
                setTotalsDay(foodTotals)
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
            <TableCell align="left">{svc.street}</TableCell>
            <TableCell align="left">{svc.zipcode}</TableCell>
            <TableCell align="center">{svc.adults}</TableCell>
            <TableCell align="center">{svc.children}</TableCell>
            <TableCell align="center">{svc.USDA}</TableCell>
            <TableCell align="center">{svc.NonUSDA}</TableCell>
            { console.log(svc)}
            </TableRow>
        )
        return jsxCode
    }

    function RenderListTotals(totals, title) {
        return (
            <TableRow className='greenBackground' key={title}>
                <style>
                    {`@media print { 
                        .greenBackground { 
                            background-color: rgb(104, 179, 107);
                            text-align: right;
                            -webkit-print-color-adjust: exact;
                            break-before: avoid-page;
                            break-after: avoid-page;
                            }
                        }`
                    }
                </style>
                <TableCell style={ greenBackground } align="center" colSpan={5}><strong>{title}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.adults}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.children}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.USDA}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.NonUSDA}</strong></TableCell>
            </TableRow>
        )
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
                    reportCategory="FOOD BANK"
                    groupColumns={[{"name": "Print Name (Clients)", "length": 3}, 
                        {"name": "Address (Include Zip Code)", "length": 2}, 
                        {"name": "Family Size", "length": 2}, 
                        {"name": "Is this your 1st time receiving USDA food this month", "length": 2}]}
                    columns={["ID", "Given", "Family", "Address", "Zip", "A", "C", "USDA", "NonUSDA" ]} />
            <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={9}>
                        <CircularProgress color="secondary" />
                    </TableCell>
                </TableRow>) : null}

            {RenderSvcList(services)}
            {/* {RenderListTotals(totalsUSDA, "USDA Totals")} */}
            {RenderListTotals(totalsDay, 'Total the responses from the last three columns into the last row. i.e. total family size, how many "Yes", how many "No"' )}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}