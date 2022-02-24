import { Box, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Typography, TableFooter, AccordionSummary } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetDaysSvcsAsync } from '../../../System/js/Database';
import { useTheme } from '@material-ui/core/styles';

MonthlyDistributionReport.propTypes = {
    month: PropTypes.string
}

export default function MonthlyDistributionReport(props) {
    const defaultTotals = {"households": 0, "individuals": 0,
    "children": 0, "adults": 0,
    "seniors": 0, "homelessHouseholds": 0, "homelessSingles": 0,
    "nonClientHouseholds": 0, "nonClientSingles": 0}
    const [daysGrid, setDaysGrid] = useState([])
    const [monthTotals, setMonthTotals] = useState(defaultTotals)
    const [uniqueTotals, setUniqueTotals] = useState(defaultTotals)

    const theme = useTheme()

    useEffect(()=>{
        RunReport()
    },[])
    function ListToGrid(svcList) {
        let grid = []
        svcList.forEach(elem => {
            let item = {"serviceId": elem.serviceId,
                "id": elem.clientServedId, "given": elem.clientGivenName,
                "family": elem.clientFamilyName, "zipcode": elem.clientZipcode, 
                "households": "1", "individuals": elem.totalIndividualsServed,
                "children": elem.totalChildrenServed, "adults": elem.totalAdultsServed,
                "seniors": elem.totalSeniorsServed}
            if (elem.homeless == "YES") {
                if (elem.totalIndividualsServed == 1) {
                    item["homelessHouseholds"] = "-"
                    item["homelessSingles"] = "1"
                }
                else {
                    item["homelessHouseholds"] = "1"
                    item["homelessSingles"] = elem.totalIndividualsServed
                }
            } else {
                item["homelessHouseholds"] = "-"
                item["homelessSingles"] = "-"
            }

            if (elem.clientStatus == "Client") {
                item["nonClientHouseholds"] = "-"
                item["nonClientSingles"] = "-"
            } else {
                if (elem.totalIndividualsServed == 1) {
                    item["nonClientHouseholds"] = "-"
                    item["nonClientSingles"] = "1"
                }
                else {
                    item["nonClientHouseholds"] = "1"
                    item["nonClientSingles"] = elem.totalIndividualsServed
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
            console.log(day)
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
        let numDays = moment(props.month, "YYYYMM").endOf("month").format("DD")
        numDays = parseInt(numDays) + 1
        let promises = []

        for (let i = 1; i < numDays; i++) {
            let servicedDay = String(i)
            if (servicedDay.length < 2) servicedDay = "0"+servicedDay
            servicedDay = props.month + servicedDay
            promises.push(dbGetDaysSvcsAsync(moment(servicedDay).format('YYYYMMDD')))
        }

        Promise.all(promises).then(data => {
            let newDaysGrid = []
            for (let i=0; i<data.length; i++) {
                let svcs = data[i]
                let servicedDay = String(i+1)
                if (servicedDay.length < 2) servicedDay = "0"+servicedDay
                servicedDay = props.month + servicedDay
                servicedDay = moment(servicedDay).format('MM/DD/YYYY')
                const servicesFood = svcs
                    .filter(item => item.serviceValid == 'true')
                    .filter(item => item.serviceCategory == "Food_Pantry")
                    .sort((a, b) => moment.utc(a.servicedDateTime).diff(moment.utc(b.servicedDateTime)))
                const servicesUSDA = servicesFood.filter(item => item.isUSDA == "USDA" || item.isUSDA == "Emergency")
                const servicesNonUSDA = servicesFood.filter(item => item.isUSDA == "NonUSDA")
                const usdaGrid = ListToGrid(servicesUSDA)
                const nonUsdaGrid = ListToGrid(servicesNonUSDA)
                const usdaTotals = computeGridTotals(usdaGrid)
                const nonUsdaTotals = computeGridTotals(nonUsdaGrid)
                newDaysGrid.push({"day": servicedDay, "usdaGrid": usdaGrid, "nonUsdaGrid": nonUsdaGrid, "usdaTotals": usdaTotals, 
                "nonUsdaTotals": nonUsdaTotals, "totals": computeGridTotals([usdaTotals, nonUsdaTotals])})
            }
            setDaysGrid(newDaysGrid)
            setMonthTotals(computeGridTotals(newDaysGrid.map(day => day["totals"])))
            computeUniqueTotals(newDaysGrid)
        })
    }

    function RenderListTotals(totals, title, isTotals) {
        const newTitle = isTotals ? <strong>{title}</strong> : title
        return (
            <TableRow style={isTotals ? {backgroundColor: theme.palette.primary.light} : null} key={title}>
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

    function RenderDay(totals) {
        return (
            <React.Fragment>
            <TableRow><TableCell align="center" colSpan={13}><Box width="100%" justifyItems="center"><strong>{totals["day"]}</strong></Box></TableCell></TableRow>
            {RenderListTotals(totals["usdaTotals"], "USDA", false)}
            {RenderListTotals(totals["nonUsdaTotals"], "Non USDA", false)}
            {RenderListTotals(totals["totals"], totals["day"], true)}
            </React.Fragment>
        )
    }

    return (
        <Box m={ 1 } maxWidth="100%">
        <TableContainer align="center"> 
            <Table size="small" align="center">
                <ReportsHeader reportType="MONTHLY REPORT" 
                    reportCategory="FOOD PANTRY"
                    groupColumns={[{"name": "Type", "length": 1}, 
                        {"name": "Clients Services", "length": 5}, 
                        {"name": "Homeless Services", "length": 2}, 
                        {"name":"NonClients Services", "length": 2}]}
                    columns={["USDA/Non USDA", "Households", "Individuals", "Adults", "Children", "Seniors", "Families", "Singles", "Families", "Singles"]} />
            <TableBody>
            {daysGrid.map(day => RenderDay(day))}
            <TableRow><TableCell align="center" colSpan={13}><strong>Monthly Totals</strong></TableCell></TableRow>
            {RenderListTotals(monthTotals, "Grand Totals", true)}
            {RenderListTotals(uniqueTotals, "Unique Totals", true)}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}