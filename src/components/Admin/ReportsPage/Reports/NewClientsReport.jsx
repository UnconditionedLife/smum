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

    function RunReport() {
        const zipCodes = SettingsZipcodes();
    
        dbGetValidSvcsByDateAsync(dayjs(props.yearMonth).format('YYYY-MM'), "Food_Pantry")
            .then(svcs => {
                let firstSvcs = svcs.filter(item => item.svcFirst == true);
                let newClients = [];
                let newIds = [];
    
                const clientPromises = firstSvcs.map(svc => 
                    dbGetSingleClientAsync(svc.cId)
                        .then(c => {
                            if (dayjs(c.createdDateTime).format('YYYYMM') === props.yearMonth) {
                                newClients.push(svc);
                                newIds.push(svc.cId);
                            }
                        })
                );
    
                Promise.all(clientPromises).then(() => {
                    console.log("All clients fetched");
    
                    let sortedNewIds = [...newIds].sort((a, b) => a - b);
                    setClientIds(sortedNewIds);
    
                    let total = 0;
                    let homeless = 0;
                    let remainingClients = [...newClients];
    
                    let updatedCounts = zipCodes.map(zip => {
                        const zipTotalSvcs = newClients.filter(s => s.cZip == zip);
                        const zipRecord = {
                            area: zip,
                            total: zipTotalSvcs.length,
                            homeless: zipTotalSvcs.filter(s => s.homeless === true).length
                        };
    
                        total += zipRecord.total;
                        homeless += zipRecord.homeless;
    
                        // Remove processed clients from remaining list
                        remainingClients = remainingClients.filter(s => s.cZip !== zip);
    
                        return zipRecord;
                    });
    
                    // Process clients that do not match the zip codes (Emergency Category)
                    const emergencyRecord = {
                        area: "Emergency",
                        total: remainingClients.length,
                        homeless: remainingClients.filter(s => s.homeless === true).length
                    };
    
                    // Collect emergency client IDs
                    remainingClients.forEach(svc => {
                        if (!newIds.includes(svc.cId)) {
                            newIds.push(svc.cId);
                        }
                    });
    
                    total += emergencyRecord.total;
                    homeless += emergencyRecord.homeless;
    
                    updatedCounts.push(emergencyRecord);
                    setCounts(updatedCounts);
    
                    // Ensure all IDs (including Emergency) are printed
                    let finalIds = [...new Set(newIds)].sort((a, b) => a - b);
                    setClientIds(finalIds);
    
                    setTotalNewClients(total);
                    setTotalNewHomeless(homeless);
                    setLoading(false);
                });
            });
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