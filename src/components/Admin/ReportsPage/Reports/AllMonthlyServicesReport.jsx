import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetValidSvcsByDateAsync } from '../../../System/js/Database';
import { useTheme } from '@mui/material/styles';

AllMonthlyServicesReport.propTypes = {
    month: PropTypes.string
}

export default function AllMonthlyServicesReport(props) {
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
            let svcsCatGrid = {}

            svcs.forEach(svc => {
                if (!svcsCatGrid[svc.svcCat]) {
                    svcsCatGrid[svc.svcCat] = {}
                }
                if (!svcsCatGrid[svc.svcCat][svc.svcName]) {
                    svcsCatGrid[svc.svcCat][svc.svcName] = []
                }
                svcsCatGrid[svc.svcCat][svc.svcName].push(svc)
            })

            let aggregatedTotals = buildTotalsDict(svcsCatGrid)
            setAggregatedTotals(aggregatedTotals)
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
                    reportCategory="ALL SERVICES"
                    groupColumns={[{"name": "Category", "length": 1}, 
                        {"name": "Service", "length": 1}, 
                        {"name": "Households", "length": 1}, 
                        {"name":"Individuals", "length": 1},
                        {"name":"Items", "length": 1}
                    ]}
                    columns={["", "", "", "", ""]} />
            <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={5}>
                        <CircularProgress color="secondary" />
                    </TableCell>
                </TableRow>) : null}
            {Object.keys(aggregatedTotals).map(key => {
                return (
                <React.Fragment key={key}>
                <TableRow className="greenBackground" style={{backgroundColor: theme.palette.primary.light }}>
                    <style>
                        { `@media print { 
                                .greenBackground { 
                                    text-align: left;
                                    background-color: rgb(104, 179, 107);
                                    -webkit-print-color-adjust: exact;
                                    font-size: 14px;
                                }
                            }`
                        }
                    </style>
                    <TableCell className='centerText' align="left" colSpan={5}>
                        <strong>{ key }</strong>
                    </TableCell>
                </TableRow>
                    {Object.keys(aggregatedTotals[key]).map(key2 => {
                        return (<TableRow key={key2}>
                            <TableCell></TableCell>
                            <TableCell>{key2}</TableCell>
                            <TableCell>{aggregatedTotals[key][key2].households}</TableCell>
                            <TableCell>{aggregatedTotals[key][key2].individuals}</TableCell>
                            <TableCell>{aggregatedTotals[key][key2].itemsServed}</TableCell>
                        </TableRow>)
                    })}
                </React.Fragment>)
            })}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}