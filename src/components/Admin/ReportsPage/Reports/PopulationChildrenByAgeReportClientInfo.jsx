import { Box, Table, TableContainer, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";
import moment from 'moment';
import { dbGetValidSvcsByDateAsync, dbGetAllClientsAsync, globalMsgFunc } from '../../../System/js/Database';
import { arrayAddIds, calcFamilyCounts, calcDependentsAges, utilCalcAge, utilCalcAgeGroupingAllDeps } from '../../../System/js/Clients/ClientUtils';
import { useTheme } from '@mui/material/styles';

PopulationChildrenByAgeReportClientInfo.propTypes = {
    days: PropTypes.number,
    minVisits: PropTypes.number,
    maxVisits: PropTypes.number
}

export default function PopulationChildrenByAgeReportClientInfo(props) {
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

    const [loading, setLoading] = useState(true)

    const [clients, setClients] = useState([])
    const [totals, setTotals] = useState([0,0,0,0,0,0,0])

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
    useEffect(()=>{
        RunReport()
    },[])

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
                console.log(services)
                getClients()
            }
        })
    }

    function getClients(){
        dbGetAllClientsAsync().then((clients) => {
            console.log(clients)
            let clientsWithChildren = clients.filter((client) => {
                return client.dependents.length > 0 & client.clientId < 8888
            })

            let clientsWithChildrenFiltered = clientsWithChildren.filter((c) => {
                const clientSvcs = services.filter(s => {
                    return s.cId === c.clientId
                })
                return clientSvcs.length >= minVisits
            })

            console.log(clientsWithChildrenFiltered)

            let newClients = []
            clientsWithChildrenFiltered.forEach((c) => {
                let newC = utilCalcAge(c)
                newC.dependents = calcDependentsAges(newC)
                newC.family = calcFamilyCounts(newC)
                newC.dependents.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
                newC.dependents = arrayAddIds(newC.dependents, 'depId')
                newC.ageGroups = utilCalcAgeGroupingAllDeps(newC.dependents)
                newClients.push(newC)
            });

            console.log(newClients)

            const clientsSorted = newClients.sort((a, b) => {
                return a.familyName.localeCompare(b.familyName, undefined, {sensitivity: 'base'})
            })

            setClients(clientsSorted)
            setTotals(computeClientTotals(clientsSorted))
            setLoading(false)
        })
    }

    function computeClientTotals(clients) {
        let totals = [0,0,0,0,0,0,0]
        clients.forEach(client => {
            totals = totals.map(function (num, idx) {
                return num + client.ageGroups[idx];
            });
        })
        return totals
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
                <TableCell style={ greenBackground } align="center" colSpan={5}></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals[0]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals[1]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals[2]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals[3]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals[4]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals[5]}</strong></TableCell>
                <TableCell style={ greenBackground } align="center"><strong>{totals[6]}</strong></TableCell>
            </TableRow>
        )
    }

 
    function RenderClientsList(clients) {
        const jsxCode = clients.map(client => 
            <TableRow className='rightText' key={client.clientId}>
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
                {client.clientId}
            </TableCell>
            <TableCell className='leftText' align="left">
                <style> { `@media print { .leftText { text-align: left; font-size: 14px; } }` } </style>
                {client.familyName}
            </TableCell>
            <TableCell className='leftText' align="left">
                <style> { `@media print { .leftText { text-align: left; font-size: 14px; } }` } </style>
                {client.givenName}
            </TableCell>
            <TableCell className='centerText' align="center">{client.zipcode}</TableCell>
            <TableCell className='centerText' align="center">{client.telephone}</TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {client.ageGroups[0]}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {client.ageGroups[1]}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {client.ageGroups[2]}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {client.ageGroups[3]}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {client.ageGroups[4]}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {client.ageGroups[5]}
            </TableCell>
            <TableCell className='centerText' align="center">
                <style> { `@media print { .centerText { text-align: center; font-size: 14px; }` } </style>
                {client.ageGroups[6]}
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
                    reportCategory="CHILDREN BY AGE GROUP (FULL)"
                    groupColumns={[{"name": "Client", "length": 5},{"name": "Age Group", "length": 7}]}
                    columns={["ID", "Family", "Given", "Zip", "Phone #", "0-1", "2-3", "4-6", "7-8", "9-10", "11-12", "13-17"]} />
            <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell className='centerText' align="center" colSpan={13}>
                        <CircularProgress color="secondary" />
                    </TableCell>
                </TableRow>) : null}
            {RenderClientsList(clients)}
            <TableRow>
                <TableCell className='centerText' align="center" colSpan={11}>
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
            {RenderListTotals(totals)}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    )
}