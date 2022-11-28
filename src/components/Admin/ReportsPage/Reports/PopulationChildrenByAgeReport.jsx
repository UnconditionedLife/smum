import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetValidSvcsByDateAsync, dbGetAllClientsAsync } from '../../../System/js/Database';
import { arrayAddIds, calcFamilyCounts, calcDependentsAges, utilCalcAge } from '../../../System/js/Clients/ClientUtils';
import { useTheme } from '@mui/material/styles';


export default function PopulationChildrenAgeReport() {
    const defaultTotals = {"households": 0, "individuals": 0,
    "children": 0, "adults": 0,
    "seniors": 0, "pickedUp": 0}
    const [loading, setLoading] = useState(true)

    const [ageGroups, setAgeGroups] = useState([])
    const [totals, setTotals] = useState(defaultTotals)

    const theme = useTheme()
    const greenBackground = { backgroundColor: theme.palette.primary.light }

    let services = []
    const groups = [ 
        { age: "0-1", count0: 0, count3: 0, count4: 0, count5: 0 },
        { age: "2-3", count0: 0, count3: 0, count4: 0, count5: 0 },
        { age: "4-6", count0: 0, count3: 0, count4: 0, count5: 0 },
        { age: "7-8", count0: 0, count3: 0, count4: 0, count5: 0 },
        { age: "9-10", count0: 0, count3: 0, count4: 0, count5: 0 },
        { age: "11-12", count0: 0, count3: 0, count4: 0, count5: 0 },
        { age: "13-17", count0: 0, count3: 0, count4: 0, count5: 0 },
    ]
    
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
            return {"count0": svcNumberToInt(previousValue.count0) + svcNumberToInt(currentValue.count0), 
                    "count3": svcNumberToInt(previousValue.count3) + svcNumberToInt(currentValue.count3),
                    "count4": svcNumberToInt(previousValue.count4) + svcNumberToInt(currentValue.count4), 
                    "count5": svcNumberToInt(previousValue.count5) + svcNumberToInt(currentValue.count5)}
        })
    }

    function RunReport() {
        // get all all services for this month and last 3
        getMonthsSvcs(0)
    }

    function getMonthsSvcs(i){
        const months = [ 
            moment().format('YYYY-MM'),
            moment().subtract(1, "month").format('YYYY-MM'),
            moment().subtract(2, "month").format('YYYY-MM'),
            moment().subtract(3, "month").format('YYYY-MM')
        ]
        dbGetValidSvcsByDateAsync(months[i]).then(svcs => {
            const foodSvcs = svcs.filter(s => {
                return s.svcCat === "Food_Pantry"
            })
            services = services.concat(...foodSvcs)
            if (i < 3) {
                getMonthsSvcs(i+1)
            } else {
                services = services.filter(s90 => {
                    return moment().diff(s90.svcDT, "days") <= 90
                })
                // get all the clients
                getClients()
            }
        })
    }

    function getClients(){
        dbGetAllClientsAsync().then((clients) => {
            let clientsWithChildren = clients.filter((client) => {
                return client.dependents.length > 0 & client.clientId < 8888
            })
            clientsWithChildren.forEach((c) => {
                let newC = utilCalcAge(c)
                newC.dependents = calcDependentsAges(newC)
                newC.family = calcFamilyCounts(newC)
                newC.dependents.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
                newC.dependents = arrayAddIds(newC.dependents, 'depId')
                let familyCounts = [ 0, 0, 0, 0, 0, 0, 0 ]
                newC.dependents.forEach(kid => {
                    if (kid.age < 2 ) {
                        familyCounts[0] = familyCounts[0] + 1
                    }
                    if (kid.age > 1 & kid.age < 4) {
                        familyCounts[1] = familyCounts[1] + 1
                    }
                    if (kid.age > 3 & kid.age < 7) {
                        familyCounts[2] = familyCounts[2] + 1
                    }
                    if (kid.age > 6 & kid.age < 9) { 
                        familyCounts[3] = familyCounts[3] + 1
                    }
                    if (kid.age > 8 & kid.age < 11) { 
                        familyCounts[4] = familyCounts[4] + 1
                    }
                    if (kid.age > 10 & kid.age < 13) { 
                        familyCounts[5] = familyCounts[5] + 1
                    }
                    if (kid.age > 12 & kid.age < 18) {
                        familyCounts[6] = familyCounts[6] + 1
                    }
                })

                // console.log("DEPS", c.dependents);
                // console.log("# Family counts", familyCounts);

                familyCounts.forEach((c, i) => {
                    groups[i].count0 = groups[i].count0 + c
                })

                // get services that belong to this client
                const clientSvcs = services.filter(s => {
                    return s.cId === c.clientId
                })

                if (clientSvcs.length >= 3) {
                    familyCounts.forEach((c, i) => {
                        groups[i].count3 = groups[i].count3 + c
                    })
                }

                if (clientSvcs.length >= 4) {
                    familyCounts.forEach((c, i) => {
                        groups[i].count4 = groups[i].count4 + c
                    })
                }
                if (clientSvcs.length >= 5) {
                    familyCounts.forEach((c, i) => {
                        groups[i].count5 = groups[i].count5 + c
                    })
                }
            });
            setAgeGroups(groups)
            setTotals(computeGridTotals(groups))
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
                <TableCell style={ greenBackground } align="center"><strong>TOTALS</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{ totals.count0 }</strong> ({ Math.round((totals.count0/totals.count0)*100)}%)</TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.count3}</strong>({ Math.round((totals.count3/totals.count0)*100)}%)</TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.count4}</strong>({ Math.round((totals.count4/totals.count0)*100)}%)</TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals.count5}</strong>({ Math.round((totals.count5/totals.count0)*100)}%)</TableCell>
                {/* <TableCell style={ greenBackground } align="center"><strong>{totals.pickedUp} ({Math.round((totals.pickedUp/totals.households)*100)}%)</strong></TableCell> */}
            </TableRow>
        )
    }

    function RenderSvcList(svcList) {
        const jsxCode = svcList.map(g => 
            <TableRow className='rightText' key={g.age}>
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
                    {g.age}
                </TableCell>
                <TableCell className='centerText' align="center">
                    <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                    {g.count0}
                </TableCell>
                <TableCell className='centerText' align="center">
                    <style> { `@media print { .centerText { text-align: left; font-size: 14px; } }` } </style>
                    {g.count3}
                </TableCell>
                <TableCell className='centerText' align="center">
                    <style> { `@media print { .centerText { text-align: left; font-size: 14px; } }` } </style>
                    {g.count4}
                </TableCell>
                <TableCell className='centerText' align="center">
                    <style> { `@media print { .centerText { text-align: left; font-size: 14px; } }` } </style>
                    {g.count5}
                </TableCell>
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
                <ReportsHeader reportDate={ "" }
                    reportType="CURRENT POPULATION" 
                    reportCategory="CHILDREN BY AGE GROUP"
                    groupColumns={[{"name": "Age Group Totals", "length": 2}, 
                    {"name": "Food Services in Last 90 Days", "length": 3}]}
                    columns={["Age Group", "Boys/Girls", "3 Services", "4 Services", "5 Services"]} />
            <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={13}>
                        <CircularProgress color="secondary" />
                    </TableCell>
                </TableRow>) : null}
            {RenderSvcList(ageGroups)}
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
            {loading ? null :
                (RenderListTotals(totals))}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}