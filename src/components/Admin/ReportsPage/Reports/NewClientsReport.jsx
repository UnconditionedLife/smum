import { Box, Table, TableContainer, TableRow, TableCell, TableBody, Typography, TableFooter, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { dbGetSingleClientAsync, dbGetValidSvcsByDateAsync, SettingsZipcodes } from '../../../System/js/Database';
import dayjs from 'dayjs';
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
    const reportMonth = dayjs(props.yearMonth, "YYYYMM").format("MMMM YYYY").toLocaleUpperCase()


    function StartRunReport(){
        setTimeout(() => {
            RunReport();
        }, 200)
    }

    function RunReport(){
        const zipCodes = SettingsZipcodes()

        dbGetValidSvcsByDateAsync(dayjs(props.yearMonth).format('YYYY-MM'), "Food_Pantry")
            .then(svcs => {

                let firstSvcs = svcs.filter(item => item.svcFirst == true)

                let newIds = []
                let newClients = []

                let total = 0
                let homeless = 0

                const numSvcs = firstSvcs.length
                firstSvcs.forEach((svc, i )=> {    
                    dbGetSingleClientAsync(svc.cId)
                        .then(c => {

                            console.log("client", c);
                            // const dividedYearMonth = dayjs(props.yearMonth).format('YYYYMM').substring(0,4) + "-" + dayjs(props.yearMonth).format('YYYYMM').substring(4)
                            // const created = c.firstSeenDate

                            console.log("CREATED", c.createdDateTime);
                            console.log("REPORT MONTH", props.yearMonth);
                            console.log("DIFF", dayjs(c.createdDateTime).format('YYYYMM'))


                            if (dayjs(c.createdDateTime).format('YYYYMM') === props.yearMonth ){
                                newClients.push(svc)
                                newIds.push(svc.cId)
                            }
                            if (i === (numSvcs -1)) {

                                console.log("FINISHED");
                                let sortedNewIds = newIds.sort((b, a) => { return b-a })

                                setClientIds(sortedNewIds)

                                zipCodes.forEach(zip => {

                                    console.log("ZIP", zip);

                                    const zipRecord = { area: zip }
                                    const zipTotalSvcs = newClients.filter(s => s.cZip == zip)
                                    
                                    zipRecord.total = zipTotalSvcs.length
                                    zipRecord.homeless = zipTotalSvcs.filter(s => s.homeless == true).length
                                    numNewClients = updateCounts(numNewClients, zipRecord.total, zipRecord.homeless, zip)
                                    total += zipRecord.total
                                    homeless += zipRecord.homeless
                                    setCounts(numNewClients)

                                    // remove these svcs with this zip from list
                                    newClients = newClients.filter(s => s.cZip != zip)
                                })
                                let zipRecord = { area: "Emergency" }
                                zipRecord.total = newClients.length
                                zipRecord.homeless = newClients.filter(svc => svc.homeless == true).length
                                numNewClients = updateCounts(numNewClients, zipRecord.total, zipRecord.homeless, "Emergency")
                                setCounts(numNewClients)
                                total += zipRecord.total
                                homeless += zipRecord.homeless
                                setTotalNewClients(total)
                                setTotalNewHomeless(homeless)
                                setLoading(false)
                            }
                        })
                //         if (firstSeen.substring(0,7) == dividedYearMonth) {
                //             console.log("matching MONTH")
                //             tempList.push(svc.cId)
                //             newClients.push(client)
                //         }

                    
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

    console.log("COUNTS", counts);
    console.log("IDs", clientIds);

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
                    reportDate={ reportMonth }
                    reportCategory="NEW CLIENTS BY ZIP" 
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
                            <TableCell align="center"><strong>{ item.total }</strong> { " (" + Math.round(item.total/totalNewClients * 100) + "%)" }</TableCell>
                            <TableCell align="center"><strong>{ item.homeless }</strong> { " (" + Math.round(item.homeless/totalNewHomeless * 100)  + "%)" }</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell align="center"><Typography variant='h6' align='center'>TOTAL</Typography></TableCell>
                        <TableCell align="center"><Typography variant='h6' align='center'><strong>{ totalNewClients }</strong> { " (100%)" }</Typography></TableCell>
                        <TableCell align="center"><Typography variant='h6' align='center'><strong>{ totalNewHomeless }</strong> { " (" + Math.round(totalNewHomeless/totalNewClients * 100)  + "%)" }</Typography></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer> 
        <Box mt={ 3 } maxWidth="100%">
            <Typography variant='h6'>NEW CLIENT IDs</Typography>
            <Box mt={ 1 } style={{ fontSize: "15px", lineHeight: "25px" }}>
                { clientIds.map((id) =>(
                    <strong key={ id }>{ id }&nbsp;&nbsp; </strong>
                )) }
            </Box>
            </Box>
        </Box> 
    )
}