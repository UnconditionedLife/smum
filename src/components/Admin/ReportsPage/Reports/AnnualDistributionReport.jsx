import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetValidSvcsByDateAsync } from '../../../System/js/Database';
import { useTheme } from '@material-ui/core/styles';

AnnualDistributionReport.propTypes = {
    year: PropTypes.string
}

export default function AnnualDistributionReport(props) {
    const defaultTotals = {"households": 0, "individuals": 0,
    "children": 0, "adults": 0,
    "seniors": 0, "homelessHouseholds": 0, "homelessSingles": 0,
    "nonClientHouseholds": 0, "nonClientSingles": 0}
    const [monthGrid, setMonthGrid] = useState([])
    const [loading, setLoading] = useState(true)

    const [usdaTotals, setUsdaTotals] = useState(defaultTotals)
    const [nonUsdaTotals, setNonUsdaTotals] = useState(defaultTotals)
    const [yearTotals, setYearTotals] = useState(defaultTotals)
    const [uniqueTotals, setUniqueTotals] = useState(defaultTotals)

    const theme = useTheme()
    const reportYear = props.year

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
            return defaultTotals
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
        let start = moment(props.year+"/01/01", "YYYY/MM/DD")
        let end = moment(props.year+"/12/31", "YYYY/MM/DD")
        
        if (moment().isBefore(end)) {
            end = moment().endOf("day")
        }

        let promises = []
        let monthsSvc = []
        for (let m = moment(start); m.isBefore(end); m.add(1, 'months')) {
            promises.push(dbGetValidSvcsByDateAsync(m.format('YYYY-MM'), "Food_Pantry"))
            monthsSvc.push(m.format('YYYYMM'))
        }
        console.log(monthsSvc)
        Promise.all(promises).then(data => {
            console.log(data)
            let monthGrid = {}
            for (let i = 0; i < data.length; i++) {
                console.log(monthsSvc)
                let servicedMonth = moment(monthsSvc[i], "YYYYMM").format('MMMM')
                let svcs = data[i]
                const servicesUSDA = svcs.filter(item => item.svcUSDA == "USDA" || item.svcUSDA == "Emergency")
                const servicesNonUSDA = svcs.filter(item => item.svcUSDA == "NonUSDA")
                const usdaGrid = ListToGrid(servicesUSDA)
                const nonUsdaGrid = ListToGrid(servicesNonUSDA)                
                const newData = {"usdaGrid": usdaGrid, "nonUsdaGrid": nonUsdaGrid}
                monthGrid[servicedMonth] = [newData]
            }
            console.log(monthGrid)
            let months = []
            for (const month in monthGrid) {
                let usdaGridMonth = monthGrid[month].map(function (currentElement) {
                    return currentElement["usdaGrid"];
                  })
                  .flat()

                let nonUsdaGridMonth = monthGrid[month].map(function (currentElement) {
                    return currentElement["nonUsdaGrid"];
                  })
                  .flat()

                const usdaTotals = computeGridTotals(usdaGridMonth)
                const nonUsdaTotals = computeGridTotals(nonUsdaGridMonth)
                months.push({"month": month, "usdaGrid": usdaGridMonth, "nonUsdaGrid": nonUsdaGridMonth, "usdaTotals": usdaTotals, 
                 "nonUsdaTotals": nonUsdaTotals, "totals": computeGridTotals([usdaTotals, nonUsdaTotals])})
            }
            console.log(months)
            setMonthGrid(months)
            setYearTotals(computeGridTotals(months.map(month => month["totals"])))
            setUsdaTotals(computeGridTotals(months.map(month => month["usdaTotals"])))
            setNonUsdaTotals(computeGridTotals(months.map(month => month["nonUsdaTotals"])))
            computeUniqueTotals(months)
            setLoading(false)
        })
    }

    function RenderListTotals(totals, title, isTotals) {
        const newTitle = isTotals ? <strong>{title}</strong> : title
        return (
            <TableRow className={ isTotals ? 'greenBackground' : 'centerText' } 
                style={isTotals ? {backgroundColor: theme.palette.primary.light} : null} key={title}>
                <style>
                    {`@media print { 
                        .greenBackground { 
                            background-color: rgb(104, 179, 107);
                            text-align: center;
                            -webkit-print-color-adjust: exact;
                            break-before: avoid-page;
                            break-after: avoid-page;
                            }
                        },
                        .centerText {
                            text-align: center;
                            break-before: avoid-page;
                            break-after: avoid-page;
                            }
                        }`
                    }
                </style>
                <TableCell align="center">{newTitle}</TableCell>
                <TableCell align="center">{totals.households}</TableCell>
                <TableCell align="center">{totals.individuals}</TableCell>
                <TableCell align="center">{totals.adults}</TableCell>
                <TableCell align="center">{totals.children}</TableCell>
                <TableCell align="center">{totals.seniors}</TableCell>
                <TableCell align="center">{totals.homelessHouseholds}</TableCell>
                <TableCell align="center">{totals.homelessSingles}</TableCell>
                <TableCell align="center">{totals.nonClientHouseholds}</TableCell>
                <TableCell align="center">{totals.nonClientSingles}</TableCell>
            </TableRow>
        )
    }

    function RenderMonth(totals) {
        return (
            <React.Fragment>
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={13}>
                        <style>
                            {`@media print { 
                                .centerText { 
                                    text-align: center;
                                    font-size: 14px;
                                    break-after: avoid-page;
                                    }
                                }`
                            }
                        </style>
                        <box>
                            <strong>{totals["month"]}</strong>
                        </box>
                    </TableCell>
                </TableRow>
                {RenderListTotals(totals["usdaTotals"], "USDA", false)}
                {RenderListTotals(totals["nonUsdaTotals"], "Non USDA", false)}
                {RenderListTotals(totals["totals"], totals["month"], true)}
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
                <ReportsHeader reportDate={ reportYear }
                    reportType="ANNUAL REPORT" 
                    reportCategory="FOOD PANTRY"
                    groupColumns={[{"name": "Type", "length": 1}, 
                        {"name": "Clients Services", "length": 5}, 
                        {"name": "Homeless Services", "length": 2}, 
                        {"name":"NonClients Services", "length": 2}]}
                    columns={["USDA/Non USDA", "Households", "Indiv.", "Adults", "Children", "Seniors", "Families", "Indiv.", "Families", "Indiv."]} />
            <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={13}>
                        <CircularProgress color="secondary" />
                    </TableCell>
                </TableRow>) : null}
            {monthGrid.map(month => RenderMonth(month))}
            <TableRow>
                <TableCell className='centerText' align="center" colSpan={13}>
                    <style>
                        {`@media print { 
                            .centerText { 
                                text-align: center;
                                font-size: 14px;
                                }
                            }`
                        }
                    </style>
                    <strong>Annual Totals</strong>
                </TableCell>
            </TableRow>
            {RenderListTotals(usdaTotals, "USDA Totals", true)}
            {RenderListTotals(nonUsdaTotals, "Non USDA Totals", true)}
            {RenderListTotals(yearTotals, "Grand Totals", true)}
            {RenderListTotals(uniqueTotals, "Unique Totals", true)}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}