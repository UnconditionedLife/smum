import { Box, Table, TableContainer, TableRow, TableCell, TableBody, Typography, TableFooter, CircularProgress } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { dbGetSingleClientAsync, dbGetValidSvcsByDateAsync, SettingsZipcodes } from '../../../System/js/Database';
import moment from 'moment';
import { ReportsHeader } from "../..";

NewClientsReport.propTypes = {
    yearMonth: PropTypes.string
}

export default function NewClientsReport(props) {
    const [ counts, setCounts ] = useState([])
    const [ clientIds, setClientIds ] = useState([])
    const [ totalNewClients, setTotalNewClients ] = useState(0)
    const [ totalNewHomeless, setTotalNewHomeless ] = useState(0)
    const [loading, setLoading] = useState(true)

    let numNewClients = []


    function StartRunReport(){
        setTimeout(() => {
            RunReport();
        }, 200)
    }

    function RunReport(){
        dbGetValidSvcsByDateAsync(moment(props.yearMonth).format('YYYY-MM'), "Food_Pantry")
            .then(svcs => {
                const monthOfValidUSDASvcs = svcs.filter(item => item.isUSDA == "USDA")
                let newClients = []
                let tempList = []

                let total = 0
                let homeless = 0

                monthOfValidUSDASvcs.forEach(svc => {    
                    dbGetSingleClientAsync(svc.clientServedId)
                        .then(client => {
                            const dividedYearMonth = moment(props.yearMonth).format('YYYYMM').substring(0,4) + "-" + moment(props.yearMonth).format('YYYYMM').substring(4)
                            const firstSeen = client.firstSeenDate
                        if (firstSeen.substring(0,7) == dividedYearMonth) {
                            console.log("matching MONTH")
                            tempList.push(svc.clientServedId)
                            newClients.push(client)
                        }
                        setClientIds(tempList.sort((b, a) => { return b-a }))
                        const zipCodes = SettingsZipcodes()
                        total = 0
                        homeless = 0


                        zipCodes.forEach(zip => {
                            let zipRecord = { area: zip }
                            zipRecord.total = newClients.filter(client => client.zipcode == zip).length
                            zipRecord.homeless = newClients.filter(client => client.zipcode == zip && client.homeless == "YES").length
                            numNewClients = updateCounts(numNewClients, zipRecord.total, zipRecord.homeless, zip)
                            total += zipRecord.total
                            homeless += zipRecord.homeless
                            setCounts(numNewClients)
                        })

                        let zipRecord = { area: "Out Of Area" }
                        zipRecord.total = newClients.filter(client => !zipCodes.includes(client.zipcode)).length
                        zipRecord.homeless = newClients.filter(client => !zipCodes.includes(client.zipcode) && client.homeless == "YES").length
                        numNewClients = updateCounts(numNewClients, zipRecord.total, zipRecord.homeless, "Out Of Area")
                        setCounts(numNewClients)
                        total += zipRecord.total
                        homeless += zipRecord.homeless
                        setTotalNewClients(total)
                        setTotalNewHomeless(homeless)
                        setLoading(false)
                    })
                })
            })
    }

    function updateCounts(countsList, total, homeless, zip) {
        let foundArea = false
        for (let i = 0; i < countsList.length; i++) {
            if (countsList[i].area == zip) {
                foundArea = true
                countsList[i].homeless = homeless
                countsList[i].total = total
            }
        }

        if (!foundArea) {
            countsList.push({area: zip, total: total, homeless: homeless})
        }

        return countsList
    }

    useEffect(()=>{
        StartRunReport()
    },[])



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
                <ReportsHeader reportType="MONTHLY REPORT" 
                    reportCategory="NEW CLIENT" 
                    columns={["Zipcode", "Total", "Homeless"]} />
                <TableBody>
                    {loading ? (<TableRow>
                        <TableCell className='centerText' align="center" colSpan={13}>
                            <CircularProgress color="secondary" />
                        </TableCell>
                    </TableRow>) : null}
                    { counts.map((item) => (
                        <TableRow key={ item.area } >
                            <TableCell align="center">{ item.area }</TableCell>
                            <TableCell align="center">{ item.total }</TableCell>
                            <TableCell align="center">{ item.homeless }</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell align="center"><Typography variant='h6' align='center'>TOTAL</Typography></TableCell>
                        <TableCell align="center"><Typography variant='h6' align='center'>{ totalNewClients }</Typography></TableCell>
                        <TableCell align="center"><Typography variant='h6' align='center'>{ totalNewHomeless }</Typography></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer> 
        <Box mt={ 3 } maxWidth="100%">
            <Typography variant='h6'>NEW CLIENT IDs</Typography>
            <Box mt={ 1 } width="1000px" style={{ lineHeight: "30px" }}>
                { clientIds.map((id) =>(
                    <strong key={ id }>{ id }&nbsp;&nbsp; </strong>
                )) }
            </Box>
            </Box>
        </Box>
    )
}