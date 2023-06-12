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
    const defaultTotals = {"households": 0, "individuals": 0,
    "children": 0, "adults": 0,
    "seniors": 0, "homelessFamilies": 0, "homelessTotal": 0}
    const [services, setServices] = useState([])
    const [totals, setTotals] = useState(defaultTotals)
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
                "adults": svcNumberToInt(elem.adults) + svcNumberToInt(elem.seniors)}

            if (elem.homeless == true) {
                if (elem.individuals == 1) {
                    item["homelessFamilies"] = "0"
                    item["homelessTotal"] = "1"
                }
                else {
                    item["homelessFamilies"] = "1"
                    item["homelessTotal"] = "1"
                }
            } else {
                item["homelessFamilies"] = "0"
                item["homelessTotal"] = "0"
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
            return { "households": svcNumberToInt(previousValue.households) + 1, 
                    "individuals": svcNumberToInt(previousValue.individuals) + svcNumberToInt(currentValue.individuals), 
                    "adults": svcNumberToInt(previousValue.adults) + svcNumberToInt(currentValue.adults), 
                    "children": svcNumberToInt(previousValue.children) + svcNumberToInt(currentValue.children), 
                    "homelessFamilies": previousValue.homelessFamilies + svcNumberToInt(currentValue.homelessFamilies),
                    "homelessTotal": previousValue.homelessTotal + svcNumberToInt(currentValue.homelessTotal)}
        }, {"households": 0, "individuals": 0, "children": 0, "adults": 0, "homelessFamilies": 0, "homelessTotal": 0 })
    }

    function RunReport() {
        dbGetValidSvcsByDateAsync(moment(props.day).format('YYYY-MM'), "Food_Pantry", moment(props.day).format('YYYY-MM-DD'))
            .then(svcs => {
                const servicesFood = svcs.filter(item => item.svcUSDA == "NonUSDA")
                const foodGrid = ListToGrid(servicesFood)

                console.log("GRID", foodGrid)

                const foodTotals = computeGridTotals(foodGrid)
                setServices(foodGrid)
                setTotals(foodTotals)
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

    function RenderListTotals(totals, title) {

        console.log("TOTALS", totals); 
        return (
            <TableRow className='greenBackground' key={title}>
                <style>
                    {`@media print { 
                        .greenBackground { 
                            background-color: rgb(104, 179, 107);
                            text-align: center;
                            -webkit-print-color-adjust: exact;
                            break-before: avoid-page;
                            break-after: avoid-page;
                            }
                        }`
                    }
                </style>
                <TableCell align="center"><strong>Households = {totals.households}</strong></TableCell>
                <TableCell align="center"><strong>Individuals = {totals.individuals}</strong></TableCell>
                <TableCell align="center"><strong>Children = {totals.children}</strong></TableCell>
                <TableCell align="center"><strong>Adults = {totals.adults}</strong></TableCell>
                <TableCell align="center"><strong>Homeless <br/> Families = {totals.homelessFamilies}</strong></TableCell>
                <TableCell align="center"colSpan={2} ><strong>Homeless <br/> Total = {totals.homelessTotal}</strong></TableCell>
                
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
                    reportCategory="FOOD BANK NON USDA"
                    groupColumns={[{"name": "Client", "length": 3}, 
                        {"name": "Address (Include Zip Code)", "length": 2}, 
                        {"name": "Family Size", "length": 2}]}
                    columns={["ID", "Given Name", "Family Name", "Address", "Zip", "A", "C"]} />
                <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell className='centerText' align="center" colSpan={7}>
                            <CircularProgress color="secondary" />
                        </TableCell>
                    </TableRow>) : null}
                    {RenderSvcList(services)}
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
                        <TableCell colSpan={7} style={{ color:"white" }}>|</TableCell>
                    </TableRow>
                    {RenderListTotals(totals,'')}
                    <TableRow>  
                        <TableCell colSpan={7} style={{ color:"white" }}>|</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}