import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetValidSvcsByDateAsync } from '../../../System/js/Database';
import { useTheme } from '@mui/material/styles';

AllServicesByDayReport.propTypes = {
    month: PropTypes.string
}

export default function AllServicesByDayReport(props) {
    const [aggregatedTotals, setAggregatedTotals] = useState({})
    const [loading, setLoading] = useState(true)

    const theme = useTheme()
    const reportMonth = moment(props.month, "YYYYMM").format("MMMM YYYY").toLocaleUpperCase()

    useEffect(()=>{
        RunReport()
    },[])

    function ListToGrid(svcList) {
        let grid = []
        svcList.forEach(elem => {
            let item = {"households": "1", "individuals": elem.individuals,
                "itemsServed": elem.svcItems}
            grid.push(item)
        })
        return grid
    }
    
    function svcNumberToInt(svcNumber) {
        return isNaN(svcNumber) ? 0 :  parseInt(svcNumber)
    }

    function buildTotals(svcs) {
        return svcs.reduce(function(previousValue, currentValue) {
            return {"households": svcNumberToInt(previousValue.households) + svcNumberToInt(currentValue.households), 
                    "individuals": svcNumberToInt(previousValue.individuals) + svcNumberToInt(currentValue.individuals),
                    "itemsServed": svcNumberToInt(previousValue.itemsServed) + svcNumberToInt(currentValue.itemsServed)}
        })
    }

    function buildTotalsDict(catDict) {
        let totalsCatDict = {}
        for (let key in catDict) {
            totalsCatDict[key] = {}
            for (let cat in catDict[key]) {
                totalsCatDict[key][cat] = buildTotals(ListToGrid(catDict[key][cat]))
            }
        }
        return totalsCatDict
    }

    function RunReport() {
        dbGetValidSvcsByDateAsync(moment(props.month).format('YYYY-MM')) .then(svcs => {
            const svcsGroupBy = svcs.reduce(function (r, a) {
                const key = a.svcDT.substring(0 ,10)
                r[key] = r[key] || [];
                r[key].push(a);
                return r;
            }, Object.create(null));
            console.log(svcsGroupBy)
            let svcsDayGrid = {}

            for (const [servicedDay, svcs] of Object.entries(svcsGroupBy)) {
                svcs.forEach(svc => {
                    console.log(servicedDay)
                    console.log(svc)
                    if (!svcsDayGrid[servicedDay]) {
                        svcsDayGrid[servicedDay] = {}
                    }
                    if (!svcsDayGrid[servicedDay][svc.svcName]) {
                        svcsDayGrid[servicedDay][svc.svcName] = []
                    }
                    svcsDayGrid[servicedDay][svc.svcName].push(svc)
                })
            }

            let aggregatedTotals = buildTotalsDict(svcsDayGrid)
            setAggregatedTotals(aggregatedTotals)
            console.log(aggregatedTotals)
            setLoading(false)
        })
    }

    return (
        <Box m={ 1 } maxWidth="100%">
        <TableContainer align="center"> 
            <Table className='fontFamily' size="small" align="center">
                <style>
                    {`@media print { 
                        .fontFamily {
                            font-family: Arial, Helvetica, sans-serif;
                            }
                        }`
                    }
                </style>
                <ReportsHeader reportDate={ reportMonth }
                    reportType="MONTHLY REPORT"
                    reportCategory="ALL SERVICES BY DAY"
                    groupColumns={[{"name": "Service", "length": 1}, 
                    {"name": "Households", "length": 1}, 
                    {"name":"Individuals", "length": 1},
                    {"name":"Items", "length": 1}]}
                    columns={["", "", "", ""]} />
            <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={13}>
                        <CircularProgress color="secondary" />
                    </TableCell>
                </TableRow>) : null}
            {Object.keys(aggregatedTotals).map(day => {
                return (
                    <React.Fragment key={day}>
                        <TableRow>
                            <TableCell className='centerText' align="center" colSpan={4}>
                                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }}` } </style>
                                <strong>{ moment(day).format('MMM DD YYYY') }</strong>
                            </TableCell>
                        </TableRow>
                        {Object.keys(aggregatedTotals[day]).map(svcName => {
                        return (
                            <TableRow key={svcName+day}>
                                <TableCell>{svcName}</TableCell>
                                <TableCell align="right">{aggregatedTotals[day][svcName].households}</TableCell>
                                <TableCell align="right">{aggregatedTotals[day][svcName].individuals}</TableCell>
                                <TableCell align="right">{aggregatedTotals[day][svcName].itemsServed}</TableCell>
                            </TableRow>
                        )})}
                    </React.Fragment>
                )
            })}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}