import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import dayjs from 'dayjs';
import { dbGetSingleClientAsync, dbGetValidSvcsByDateAsync } from '../../../System/js/Database';
import { useTheme } from '@mui/material/styles';
import { calcDependentsAges, utilCalcAgeGroupingAllDeps } from "../../../System/js/Clients/ClientUtils";

ChristmasToyReport.propTypes = {
    year: PropTypes.string
}

export default function ChristmasToyReport(props) {
    const defaultTotals = {"households": 0, "individuals": 0,
    "children": 0, "adults": 0,
    "seniors": 0, "pickedUp": 0}
    const [loading, setLoading] = useState(true)

    const [giftCardServices, setGiftCardServices] = useState([])
    const [giftCardTotals, setGiftCardTotals] = useState(defaultTotals)
    const [clientMap, setClientMap] = useState({})
    const [clientMapTotals, setClientMapTotals] = useState([0,0,0,0,0,0,0])

    const theme = useTheme()
    const greenBackground = { backgroundColor: theme.palette.primary.light }

    const reportYear = props.year
    // const svcTypes = getSvcTypes()
    // console.log(svcTypes)

    const christmasToyId = "3"
    const christmasToyPickupId = "4"
    
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
    
    function computeClientMapTotals(clientMapCurr) {
        let totals = [0,0,0,0,0,0,0]
        Object.keys(clientMapCurr).forEach(id => {
            clientMapCurr[id].forEach(obj => {
                totals = totals.map(function (num, idx) {
                    return num + obj[idx];
                  });
            })
        })
        return totals
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
            promises.push(dbGetValidSvcsByDateAsync(m.format('YYYY-MM'), "Christmas"))
        }
        Promise.all(promises).then(data => {
            console.log(data)
            let svcsList = []
            for (let i = 0; i < data.length; i++) {
                const svcs = data[i]
                console.log(svcs)
                svcsList = svcsList.concat(svcs)
            }
            const giftCardServicesUnsorted = svcsList.filter(svc => svc.svcTypeId == christmasToyId)
            const giftCardPickupServices = svcsList.filter(svc => svc.svcTypeId == christmasToyPickupId)
            
            const clientIdSet = new Set()
            giftCardServicesUnsorted.forEach(svc => {
                const foundPickupService = giftCardPickupServices.filter(svcPickup => svcPickup.cId == svc.cId).length > 0 ? 1 : 0
                console.log(foundPickupService)
                svc.pickedUp = foundPickupService
                svc.households = 1
                clientIdSet.add(svc.cId)
            })

            let cIdPromises = []
            clientIdSet.forEach(cid => {
                cIdPromises.push(dbGetSingleClientAsync(cid))
            })

            Promise.all(cIdPromises).then(data => {
                let cIdMap = {}
                data.forEach(client => {
                    if (!(client.clientId in cIdMap)) {
                        cIdMap[client.clientId] = []
                    }
                    cIdMap[client.clientId].push(utilCalcAgeGroupingAllDeps(calcDependentsAges(client)))
                })
                setClientMap(cIdMap)
                setClientMapTotals(computeClientMapTotals(cIdMap))
            })

            const giftCardServices = giftCardServicesUnsorted.sort((a, b) => {
                return a.cFamName.localeCompare(b.cFamName, undefined, {sensitivity: 'base'})
            })

            const giftCardTotals = computeGridTotals(giftCardServices)
            setGiftCardServices(giftCardServices)
            setGiftCardTotals(giftCardTotals)
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
                <TableCell style={ greenBackground } align="center"><strong>{clientMapTotals[0]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{clientMapTotals[1]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{clientMapTotals[2]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{clientMapTotals[3]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{clientMapTotals[4]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{clientMapTotals[5]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{clientMapTotals[6]}</strong></TableCell>
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
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {svc.cId in clientMap ? clientMap[svc.cId][0][0] : 0}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {svc.cId in clientMap ? clientMap[svc.cId][0][1] : 0}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {svc.cId in clientMap ? clientMap[svc.cId][0][2] : 0}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {svc.cId in clientMap ? clientMap[svc.cId][0][3] : 0}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {svc.cId in clientMap ? clientMap[svc.cId][0][4] : 0}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {svc.cId in clientMap ? clientMap[svc.cId][0][5] : 0}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {svc.cId in clientMap ? clientMap[svc.cId][0][6] : 0}
            </TableCell>
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
                    reportType="TOY REPORT" 
                    reportCategory="CHRISTMAS"
                    groupColumns={[{"name": "Client", "length": 4},{"name": "Age Group", "length": 7}, 
                    {"name": "Clients Served", "length": 5}, 
                    {"name":"Status", "length": 1}]}
                    columns={["ID", "Family", "Given", "Zip", "0-1", "2-3", "4-6", "7-8", "9-10", "11-12", "13-17", "Hholds", "Indiv", "Adults", "Children", "Seniors", "Picked Up?"]} />
            <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={13}>
                        <CircularProgress color="secondary" />
                    </TableCell>
                </TableRow>) : null}
            {RenderSvcList(giftCardServices)}
            <TableRow>
                <TableCell className='centerText' align="center" colSpan={20}>
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
            {RenderListTotals(giftCardTotals)}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}