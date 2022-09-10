import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetValidSvcsByDateAsync } from '../../../System/js/Database';
import { useTheme } from '@material-ui/core/styles';

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
                    "itemsServed": svcNumberToInt(previousValue.items) + svcNumberToInt(currentValue.items)}
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
            console.log(svcs)
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
            console.log(aggregatedTotals)
            setAggregatedTotals(aggregatedTotals)
            setLoading(false)
        })
    }

    function RenderListTotals(totals, title, isTotals) {
        const newTitle = isTotals ? <strong>{title}</strong> : title
        return (
            <TableRow className={ isTotals ? 'greenBackground' : 'rightText' } 
                style={isTotals ? { backgroundColor: theme.palette.primary.light } : null} key={title}>
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
                <TableCell className='leftText' align="left">
                    <style> { `@media print { .leftText { text-align: left; font-size: 14px; } }` } </style>
                    {newTitle}
                </TableCell>
                <TableCell className='rightText' align="right">
                    <style> { `@media print { .rightText { text-align: right; font-size: 14px; } }` } </style>
                    {totals.households}
                </TableCell>
                <TableCell align="right">{totals.individuals}</TableCell>
                <TableCell align="right">{totals.adults}</TableCell>
                <TableCell align="right">{totals.children}</TableCell>
                <TableCell align="right">{totals.seniors}</TableCell>
                <TableCell align="right">{totals.homelessHouseholds}</TableCell>
                <TableCell align="right">{totals.homelessSingles}</TableCell>
                <TableCell align="right">{totals.nonClientHouseholds}</TableCell>
                <TableCell align="right">{totals.nonClientSingles}</TableCell>
            </TableRow>
        )
    }

    function RenderDay(totals) {
        return (
            <React.Fragment>
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={13}>
                        <style> { `@media print { .centerText { text-align: center; font-size: 14px; }}` } </style>
                        <strong>{ totals["day"] }</strong>
                    </TableCell>
                </TableRow>
                {RenderListTotals(totals["usdaTotals"], "USDA", false)}
                {RenderListTotals(totals["nonUsdaTotals"], "Non USDA", false)}
                {RenderListTotals(totals["totals"], totals["day"], true)}
            </React.Fragment>
        )
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
                <>
                <TableRow className="greenBackground" style={{backgroundColor: theme.palette.primary.light }} key={key}>
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
                        <TableCell>{aggregatedTotals[key][key2].svcItems}</TableCell>
                    </TableRow>)
                })}
                </>)
            })}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}