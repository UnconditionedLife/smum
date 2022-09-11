import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetValidSvcsByDateAsync } from '../../../System/js/Database';
import { useTheme } from '@mui/material/styles';

MonthlyDistributionReport.propTypes = {
    month: PropTypes.string
}

export default function MonthlyDistributionReport(props) {
    const defaultTotals = {"households": 0, "individuals": 0,
    "children": 0, "adults": 0,
    "seniors": 0, "homelessHouseholds": 0, "homelessSingles": 0,
    "nonClientHouseholds": 0, "nonClientSingles": 0}
    const defaultTotalsDash = {"households": "-", "individuals": "-",
    "children": "-", "adults": "-",
    "seniors": "-", "homelessHouseholds": "-", "homelessSingles": "-",
    "nonClientHouseholds": "-", "nonClientSingles": "-"}
    const [daysGrid, setDaysGrid] = useState([])
    const [monthTotals, setMonthTotals] = useState(defaultTotals)
    const [usdaTotals, setUsdaTotals] = useState(defaultTotals)
    const [nonUsdaTotals, setNonUsdaTotals] = useState(defaultTotals)
    const [uniqueTotals, setUniqueTotals] = useState(defaultTotals)
    const [loading, setLoading] = useState(true)

    const theme = useTheme()
    const reportMonth = moment(props.month, "YYYYMM").format("MMMM YYYY").toLocaleUpperCase()

    useEffect(()=>{
        RunReport()
    },[])

    function ListToGrid(svcList) {
        let grid = []
        svcList.forEach(elem => {
            let item = {"svcId": elem.svcId,
                "id": elem.cId, "given": elem.cGivName,
                "family": elem.cFamName, "zipcode": elem.cZip, 
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
            grid.push(item)
        })
        return grid
    }

    function svcNumberToInt(svcNumber) {
        return isNaN(svcNumber) ? 0 :  parseInt(svcNumber)
    }

    function computeGridTotals(gridList) {
        if (gridList.length == 0) {
            return defaultTotalsDash
        }
        return gridList.reduce(function(previousValue, currentValue) {
            return {"households": svcNumberToInt(previousValue.households) + svcNumberToInt(currentValue.households), 
                    "individuals": svcNumberToInt(previousValue.individuals) + svcNumberToInt(currentValue.individuals),
                    "adults": svcNumberToInt(previousValue.adults) + svcNumberToInt(currentValue.adults), 
                    "seniors": svcNumberToInt(previousValue.seniors) + svcNumberToInt(currentValue.seniors), 
                    "children": svcNumberToInt(previousValue.children) + svcNumberToInt(currentValue.children), 
                    "homelessHouseholds": svcNumberToInt(previousValue.homelessHouseholds) + svcNumberToInt(currentValue.homelessHouseholds),
                    "homelessSingles": svcNumberToInt(previousValue.homelessSingles) + svcNumberToInt(currentValue.homelessSingles),
                    "nonClientHouseholds": svcNumberToInt(previousValue.nonClientHouseholds) + svcNumberToInt(currentValue.nonClientHouseholds),
                    "nonClientSingles": svcNumberToInt(previousValue.nonClientSingles) + svcNumberToInt(currentValue.nonClientSingles)}
        })
    }

    function computeUniqueTotals(gridList) {
        const uniqueIds = []
        const uniqueSvcs = []

        for (let dayIndex=0; dayIndex<gridList.length; dayIndex++) {
            let day = gridList[dayIndex]
            day["usdaGrid"].forEach(item => {
                if (!uniqueIds.includes(item.id)) {
                    uniqueIds.push(item.id);
                    uniqueSvcs.push(item);
                }
            });
            day["nonUsdaGrid"].forEach(item => {
                if (!uniqueIds.includes(item.id)) {
                    uniqueIds.push(item.id);
                    uniqueSvcs.push(item);
                }
            });
        }
        setUniqueTotals(computeGridTotals(uniqueSvcs))
    }

    function RunReport() {
        dbGetValidSvcsByDateAsync(moment(props.month).format('YYYY-MM'), "Food_Pantry") .then(svcs => {
            const svcsGroupBy = svcs.reduce(function (r, a) {
                const key = a.svcDT.substring(0 ,10)
                r[key] = r[key] || [];
                r[key].push(a);
                return r;
            }, Object.create(null));
              
            const newDaysGrid = []
            for (const [servicedDay, svcs] of Object.entries(svcsGroupBy)) {
                const servicedDate = moment(servicedDay).format('MM/DD/YYYY')
                const servicesFood = svcs
                    .filter(item => item.svcValid == true)
                    .filter(item => item.svcCat == "Food_Pantry")
                const servicesUSDA = servicesFood.filter(item => item.svcUSDA == "USDA" || item.svcUSDA == "Emergency")
                const servicesNonUSDA = servicesFood.filter(item => item.svcUSDA == "NonUSDA")
                const usdaGrid = ListToGrid(servicesUSDA)
                const nonUsdaGrid = ListToGrid(servicesNonUSDA)
                const usdaTotals = computeGridTotals(usdaGrid)
                const nonUsdaTotals = computeGridTotals(nonUsdaGrid)
                newDaysGrid.push({"day": servicedDate, "usdaGrid": usdaGrid, "nonUsdaGrid": nonUsdaGrid, "usdaTotals": usdaTotals, 
                "nonUsdaTotals": nonUsdaTotals, "totals": computeGridTotals([usdaTotals, nonUsdaTotals])})
            }
            console.log(newDaysGrid)
            setDaysGrid(newDaysGrid)
            setUsdaTotals(computeGridTotals(newDaysGrid.map(day => day["usdaTotals"])))
            setNonUsdaTotals(computeGridTotals(newDaysGrid.map(day => day["nonUsdaTotals"])))
            setMonthTotals(computeGridTotals(newDaysGrid.map(day => day["totals"])))
            computeUniqueTotals(newDaysGrid)
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
                    reportCategory="FOOD PANTRY"
                    groupColumns={[{"name": "Type", "length": 1}, 
                        {"name": "Clients Serviced", "length": 5}, 
                        {"name": "Homeless", "length": 2}, 
                        {"name":"NonClients", "length": 2}]}
                    columns={["USDA/Non USDA", "Hholds", "Indiv", "Adults", "Children", "Seniors", "Hholds", "Indiv", "Hholds", "Indiv"]} />
            <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={13}>
                        <CircularProgress color="secondary" />
                    </TableCell>
                </TableRow>) : null}
            {daysGrid.map(day => {
                if (day["totals"]["households"] > 0) { 
                    return RenderDay(day)
                }
            })}
            <TableRow>
                <TableCell className='centerText' align="center" colSpan={13}>
                    <style> { `@media print { .centerText { text-align: center; font-size: 14px; } }` } </style>
                    <strong>Monthly Totals</strong>
                </TableCell>
            </TableRow>
            {RenderListTotals(usdaTotals, "USDA Totals", true)}
            {RenderListTotals(nonUsdaTotals, "Non USDA Totals", true)}
            {RenderListTotals(monthTotals, "Grand Totals", true)}
            {RenderListTotals(uniqueTotals, "Unique Totals", true)}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}