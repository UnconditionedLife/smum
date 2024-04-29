import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import dayjs from 'dayjs';
import { dbGetValidSvcsByDateAsync, getSvcTypes } from '../../../System/js/Database';
import { useTheme } from '@mui/material/styles';

ThanksgivingTurkeyReport.propTypes = {
    year: PropTypes.string
}

export default function ThanksgivingTurkeyReport(props) {
    const defaultTotals = {"households": 0, "individuals": 0,
    "children": 0, "adults": 0,
    "seniors": 0, "pickedUp": 0}
    const [loading, setLoading] = useState(true)

    const [turkeyServices, setTurkeyServices] = useState([])
    const [turkeyTotals, setTurkeyTotals] = useState(defaultTotals)

    const theme = useTheme()
    const greenBackground = { backgroundColor: theme.palette.primary.light }

    const reportYear = props.year
    // const svcTypes = getSvcTypes()
    // console.log(svcTypes)

    const thanksgivingTurkeyId = "24"
    const thanksgivingTurkeyPickupId = "25"
    
    useEffect(()=>{
        RunReport()
    },[])


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
                    "pickedUp": svcNumberToInt(previousValue.pickedUp) + svcNumberToInt(currentValue.pickedUp)}
        })
    }
    
    function RunReport() {
        let start = dayjs(props.year+"/01/01", "YYYY/MM/DD")
        let end = dayjs(props.year+"/12/31", "YYYY/MM/DD")
        
        if (dayjs().isBefore(end)) {
            end = dayjs().endOf("day")
        }

        let promises = []
        for (let m = dayjs(start); m.isBefore(end); m = m.add(1, 'months')) {
            console.log(m.format('YYYY-MM'))
            promises.push(dbGetValidSvcsByDateAsync(m.format('YYYY-MM'), "Thanksgiving"))
        }
        Promise.all(promises).then(data => {
            console.log(data)
            let svcsList = []
            for (let i = 0; i < data.length; i++) {
                const svcs = data[i]
                svcsList = svcsList.concat(svcs)
            }
            const turkeyServicesUnsorted = svcsList.filter(svc => svc.svcTypeId == thanksgivingTurkeyId)
            const turkeyPickupServices = svcsList.filter(svc => svc.svcTypeId == thanksgivingTurkeyPickupId)

            turkeyServicesUnsorted.forEach(svc => {
                const foundPickupService = turkeyPickupServices.filter(svcPickup => svcPickup.cId == svc.cId).length > 0 ? 1 : 0
                console.log(foundPickupService)
                svc.pickedUp = foundPickupService
                svc.households = 1
            })

            const turkeyServices = turkeyServicesUnsorted.sort((a, b) => {
                return a.cFamName.localeCompare(b.cFamName, undefined, {sensitivity: 'base'})
            })

            const turkeyTotals = computeGridTotals(turkeyServices)
            setTurkeyServices(turkeyServices)
            setTurkeyTotals(turkeyTotals)
            setLoading(false)
        })
    }

    function RenderListTotals(totals) {
        return (
            <TableRow className='greenBackground' key="total">
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
                <TableCell style={ greenBackground } align="center" colSpan={4}></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.households}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.individuals}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.adults}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.children}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.seniors}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.pickedUp} ({Math.round((totals.pickedUp/totals.households)*100)}%)</strong></TableCell>
            </TableRow>
        )
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
                {svc.cId}
            </TableCell>
            <TableCell className='leftText' align="left">
                <style> { `@media print { .leftText { text-align: left; font-size: 14px; } }` } </style>
                {svc.cFamName}
            </TableCell>
            <TableCell className='leftText' align="left">
                <style> { `@media print { .leftText { text-align: left; font-size: 14px; } }` } </style>
                {svc.cGivName}
            </TableCell>
            <TableCell className='centerText' align="center">{svc.cZip}</TableCell>
            <TableCell className='centerText' align="center">{svc.households}</TableCell>
            <TableCell className='centerText' align="center">{svc.individuals}</TableCell>
            <TableCell className='centerText' align="center">{svc.adults}</TableCell>
            <TableCell className='centerText' align="center">{svc.children}</TableCell>
            <TableCell className='centerText' align="center">{svc.seniors}</TableCell>
            <TableCell className='centerText' align="center">{svc.pickedUp ? "YES" : "NO"}</TableCell>
            </TableRow>
        )
        return jsxCode
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
                    reportType="TURKEY REPORT" 
                    reportCategory="THANKSGIVING"
                    groupColumns={[{"name": "Client", "length": 4}, 
                    {"name": "Clients Served", "length": 5}, 
                    {"name":"Status", "length": 1}]}
                    columns={["ID", "Family", "Given", "Zip", "Hholds", "Indiv", "Adults", "Children", "Seniors", "Picked Up?"]} />
            <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={13}>
                        <CircularProgress color="secondary" />
                    </TableCell>
                </TableRow>) : null}
            {RenderSvcList(turkeyServices)}
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
                    <strong>Voucher Totals</strong>
                </TableCell>
            </TableRow>
            {RenderListTotals(turkeyTotals)}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}