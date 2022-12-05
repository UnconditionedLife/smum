import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetValidSvcsByDateAsync, dbGetAllClientsAsync, globalMsgFunc } from '../../../System/js/Database';
import { arrayAddIds, calcFamilyCounts, calcDependentsAges, utilCalcAge, utilCalcAgeGroupingAllDeps } from '../../../System/js/Clients/ClientUtils';
import { useTheme } from '@mui/material/styles';

PopulationChildrenAgeReport.propTypes = {
    days: PropTypes.number,
    minVisits: PropTypes.number,
    maxVisits: PropTypes.number
}

export default function PopulationChildrenAgeReport(props) {
    const { days, minVisits, maxVisits } = props

    if (minVisits < 1) {
        globalMsgFunc('error', "Min Visits must be at least 1.")
        return null
    }

    if (minVisits > maxVisits) {
        globalMsgFunc('error', "Max Visits must be greater than Min Visits.")
        return null
    }

    if ((maxVisits - minVisits) +1 > 8) {
        globalMsgFunc('error', "Number of visits must be 8 or less.")
        return null
    }

    const defaultTotals = {"households": 0, "individuals": 0,
    "children": 0, "adults": 0,
    "seniors": 0, "pickedUp": 0}
    const [loading, setLoading] = useState(true)

    const [ageGroups, setAgeGroups] = useState([])
    const [totals, setTotals] = useState(defaultTotals)

    const theme = useTheme()
    const greenBackground = { backgroundColor: theme.palette.primary.light }

    const oldestMonth = moment().subtract(days, "days")
    const currentMonth = moment()
    const months = []
    while (currentMonth > oldestMonth || oldestMonth.format('M') === currentMonth.format('M')) {
        months.push(oldestMonth.format('YYYY-MM'))
        oldestMonth.add(1,'month')
    }

    let mVisits = minVisits
    const counts = []
    while (maxVisits >= mVisits) {
        counts.push("count" + mVisits)
        mVisits = parseInt(mVisits) + 1
    } 

    let services = []
    const groups = [ 
        { age: "0-1", count0: 0 },
        { age: "2-3", count0: 0 },
        { age: "4-6", count0: 0 },
        { age: "7-8", count0: 0 },
        { age: "9-10", count0: 0 },
        { age: "11-12", count0: 0 },
        { age: "13-17", count0: 0 },
    ]

    groups.forEach((e, i) => {
        counts.forEach((c) => {
            groups[i][c] = 0
        })
    })
    
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
        const numCounts = {}
        groups.forEach((item) => {
            for (const [key, value] of Object.entries(item)) {
                if (key !== "age") {
                    if (numCounts[key]) {
                        numCounts[key] = svcNumberToInt(numCounts[key]) + svcNumberToInt(value)
                    } else {
                        numCounts[key] = svcNumberToInt(value)
                    }
                }
            }
        })
        const tots = Object.values(numCounts);
        return tots
    }

    function RunReport() {
        // get all all services for this month and last 3
        getMonthsSvcs(0)
    }

    function getMonthsSvcs(i){
        dbGetValidSvcsByDateAsync(months[i]).then(svcs => {
            const foodSvcs = svcs.filter(s => {
                return s.svcCat === "Food_Pantry"
            })
            services = services.concat(...foodSvcs)
            if (i < (months.length - 1)) {
                getMonthsSvcs(i+1)
            } else {
                services = services.filter(svcDays => {
                    return moment().diff(svcDays.svcDT, "days") <= days
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
                const familyCounts = utilCalcAgeGroupingAllDeps(newC.dependents)
                familyCounts.forEach((c, i) => {
                    groups[i].count0 = groups[i].count0 + c
                })

                // get services that belong to this client
                const clientSvcs = services.filter(s => {
                    return s.cId === c.clientId
                })
                
                familyCounts.forEach((c, i) => {
                    counts.forEach((count) => {
                        const num = count.slice(5)
                        if (clientSvcs.length >= num) {
                            groups[i][count] = groups[i][count] + c
                        }
                    })
                })
            });
            setAgeGroups(groups)
            setTotals(computeGridTotals(groups))
            setLoading(false)
        })
    }
    const columnTitles = [ "Age Group", "Boys/Girls"]
    counts.forEach(c => {
        columnTitles.push(c.slice(5) + " Services")
    })
 
    function RenderCountTotals(totals){
        const jsxCode = totals.map(c => 
            <TableCell key={ c } style={ greenBackground } align="center">
                <strong>{ c }&nbsp;</strong>({ Math.round((c/totals[0])*100)}%)
            </TableCell>
        )
        return jsxCode
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
                {/* <TableCell style={ greenBackground } align="center"><strong>{ totals.count0 }</strong> ({ Math.round((totals.count0/totals.count0)*100)}%)</TableCell> */}
                { RenderCountTotals(totals) }
            </TableRow>
        )
    }


    // <TableCell style={ greenBackground } align="center"><strong>{totals.count3}</strong>({ Math.round((totals.count3/totals.count0)*100)}%)</TableCell>
    // <TableCell style={ greenBackground } align="center"><strong>{totals.count4}</strong>({ Math.round((totals.count4/totals.count0)*100)}%)</TableCell>
    // <TableCell style={ greenBackground } align="center"><strong>{totals.count5}</strong>({ Math.round((totals.count5/totals.count0)*100)}%)</TableCell>

    function RenderCountColumns(g){
        const jsxCode = counts.map(c => 
            <TableCell className='centerText' align="center" key={ c }>
                <style> { `@media print { .centerText { text-align: left; font-size: 14px; } }` } </style>
                { g[c] }
            </TableCell>
        )
        return jsxCode
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
                { RenderCountColumns(g) }
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
                    {"name": "Food Services in Last " + days + " Days", "length": counts.length}]}
                    columns={ columnTitles } />
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