import { Box, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Typography, TableFooter, AccordionSummary } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetDaysSvcsAsync } from '../../../System/js/Database';

DailyDistributionReport.propTypes = {
    day: PropTypes.string
}

export default function DailyDistributionReport(props) {
    const defaultTotals = {"households": 0, "individuals": 0,
    "children": 0, "adults": 0,
    "seniors": 0, "homelessHouseholds": 0, "homelessSingles": 0,
    "nonClientHouseholds": 0, "nonClientSingles": 0}
    const [servicesUSDA, setServicesUSDA] = useState([])
    const [servicesNonUSDA, setServicesNonUSDA] = useState([])
    const [totalsUSDA, setTotalsUSDA] = useState(defaultTotals)
    const [totalsNonUSDA, setTotalsNonUSDA] = useState(defaultTotals)
    const [totalsDay, setTotalsDay] = useState(defaultTotals)

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

    function RunReport() {
        dbGetDaysSvcsAsync(moment(props.day).format('YYYYMMDD'))
            .then(svcs => {
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
                const dayTotals = computeGridTotals([usdaTotals, nonUsdaTotals])
                setServicesUSDA(usdaGrid)
                setServicesNonUSDA(nonUsdaGrid)
                setTotalsUSDA(usdaTotals)
                setTotalsNonUSDA(nonUsdaTotals)
                setTotalsDay(dayTotals)
            })
    }

    function RenderSvcList(svcList) {
        const jsxCode = svcList.map(svc => 
            <TableRow key={svc.serviceId}>
            <TableCell align="center">{svc.id}</TableCell>
            <TableCell align="center">{svc.given}</TableCell>
            <TableCell align="center">{svc.family}</TableCell>
            <TableCell align="center">{svc.zipcode}</TableCell>
            <TableCell align="center">{svc.households}</TableCell>
            <TableCell align="center">{svc.individuals}</TableCell>
            <TableCell align="center">{svc.adults}</TableCell>
            <TableCell align="center">{svc.children}</TableCell>
            <TableCell align="center">{svc.seniors}</TableCell>
            <TableCell align="center">{svc.homelessHouseholds}</TableCell>
            <TableCell align="center">{svc.homelessSingles}</TableCell>
            <TableCell align="center">{svc.nonClientHouseholds}</TableCell>
            <TableCell align="center">{svc.nonClientSingles}</TableCell>
            </TableRow>
        )
        return jsxCode
    }

    function RenderListTotals(totals, title) {
        return (
            <TableRow key={title}>
                <TableCell align="center" colSpan={4}>{title}</TableCell>
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

    return (
        <Box m={ 1 } maxWidth="100%">
        <TableContainer align="center"> 
            <Table size="small" align="center">
                <ReportsHeader reportType="DAILY REPORT" 
                    reportCategory="FOOD PANTRY"
                    groupColumns={[{"name": "Client", "length": 4}, 
                        {"name": "Clients Served", "length": 5}, 
                        {"name": "Homeless Served", "length": 2}, 
                        {"name":"NonClients Served", "length": 2}]}
                    columns={["ID", "Given", "Family", "Zip", "Households", "Individuals", "Adults", "Children", "Seniors", "Families", "Singles", "Families", "Singles"]} />
            <TableRow><TableCell align="center" colSpan={13}><strong>USDA Services</strong></TableCell></TableRow>
            {RenderSvcList(servicesUSDA)}
            {RenderListTotals(totalsUSDA, "USDA Totals")}
            <TableRow><TableCell align="center" colSpan={13}><strong>Non USDA Services</strong></TableCell></TableRow>
            {RenderSvcList(servicesNonUSDA)}
            {RenderListTotals(totalsNonUSDA, "Non USDA Totals")}
            <TableRow><TableCell align="center" colSpan={13}><strong>Day Total</strong></TableCell></TableRow>
            {RenderListTotals(totalsDay, "Day Grand Totals")}
            </Table>
        </TableContainer>
        </Box>
    )
}