import { Box, Table, TableContainer, TableRow, TableCell, TableBody } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetDaysSvcsAsync } from '../../../System/js/Database';
import { useTheme } from '@material-ui/core/styles';

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

    const theme = useTheme()
    const greenBackground = { backgroundColor: theme.palette.primary.light }

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
            <TableRow className='centerText' key={svc.serviceId}>
                <style>
                    {`@media print { 
                        .centerText { 
                            text-align: center;
                            font-size: 14px;
                            }
                        }`
                    }
                </style>
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
                <TableCell style={ greenBackground } align="center" colSpan={4}><strong>{title}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.households}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.individuals}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.adults}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.children}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.seniors}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.homelessHouseholds}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.homelessSingles}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.nonClientHouseholds}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.nonClientSingles}</strong></TableCell>
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
                <ReportsHeader reportType="DAILY REPORT" 
                    reportCategory="FOOD PANTRY"
                    groupColumns={[{"name": "Client", "length": 4}, 
                        {"name": "Clients Served", "length": 5}, 
                        {"name": "Homeless Served", "length": 2}, 
                        {"name":"NonClients Served", "length": 2}]}
                    columns={["ID", "Given", "Family", "Zip", "Households", "Individuals", "Adults", "Children", "Seniors", "Families", "Singles", "Families", "Singles"]} />
            <TableBody>
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
                    <strong>USDA Services</strong>
                </TableCell>
            </TableRow>
            {RenderSvcList(servicesUSDA)}
            {RenderListTotals(totalsUSDA, "USDA Totals")}
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
                    <strong>Non USDA Services</strong>
                </TableCell>
            </TableRow>
            {RenderSvcList(servicesNonUSDA)}
            {RenderListTotals(totalsNonUSDA, "Non USDA Totals")}
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
                    <strong>Day Total</strong>
                </TableCell>
            </TableRow>
            {RenderListTotals(totalsDay, "Day Grand Totals")}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}