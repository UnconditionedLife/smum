import { Box, Table, TableContainer, TableRow, TableCell, TableBody, Typography, TableFooter, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { dbGetSingleClientAsync, dbGetValidSvcsByDateAsync, SettingsZipcodes } from '../../../System/js/Database';
import moment from 'moment';
import { ReportsHeader } from "../..";

EthnicityReport.propTypes = {
    yearMonth: PropTypes.string
}

export default function EthnicityReport(props) {
    const [ counts, setCounts ] = useState([])
    const [ totalClients, setTotalClients ] = useState(0)
    const [ totalHomeless, setTotalHomeless ] = useState(0)
    const [loading, setLoading] = useState(true)

    let numNewClients = []
    const reportMonth = moment(props.yearMonth, "YYYYMM").format("MMMM YYYY").toLocaleUpperCase()

    function StartRunReport(){
        setTimeout(() => {
            RunReport();
        }, 200)
    }

    function RunReport(){
        dbGetValidSvcsByDateAsync(moment(props.yearMonth).format('YYYY-MM'), "Food_Pantry")
            .then(svcs => {
                const ids = new Set()
                const ethnicityGroups = {}
                let totalHomeless = 0
                let totalClients = 0
                svcs.forEach(svc => {
                    if (svc.cEthnicGrp != "" && !ids.has(svc.cId)) {
                        const ethnicity = svc.cEthnicGrp
                        if (!(ethnicity in ethnicityGroups)) {
                            ethnicityGroups[ethnicity] = {total: 0, homeless: 0}
                        }
                        if (svc.homeless) {
                            ethnicityGroups[ethnicity].homeless += 1 
                            totalHomeless += 1
                        }
                        else {
                            ethnicityGroups[ethnicity].total += 1
                            totalClients += 1
                        }
                    }
                })
                setCounts(ethnicityGroups)
                setTotalClients(totalClients)
                setTotalHomeless(totalHomeless)
                setLoading(false)
            })
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
                    reportDate={ reportMonth }
                    reportCategory="CLIENTS BY ETHNICITY" 
                    columns={["Ethnicity", "Total", "Homeless"]} />
                <TableBody>
                    {loading ? (<TableRow>
                        <TableCell className='centerText' align="center" colSpan={13}>
                            <CircularProgress color="secondary" />
                        </TableCell>
                    </TableRow>) : null}
                    {Object.keys(counts).map(key => {
                        return (
                            <TableRow key={ key } >
                                <TableCell align="center">{ key }</TableCell>
                                <TableCell align="center"><strong>{ counts[key].total }</strong> { "  (" + Math.round(counts[key].total / totalClients * 100) + "%)" }</TableCell>
                                <TableCell align="center"><strong>{ counts[key].homeless }</strong> { "  (" + Math.round(counts[key].homeless / totalHomeless * 100) + "%)" }</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell align="center"><Typography variant='h6' align='center'>TOTAL</Typography></TableCell>
                        <TableCell align="center"><Typography variant='h6' align='center'><strong>{ totalClients }</strong>  (100%)</Typography></TableCell>
                        <TableCell align="center"><Typography variant='h6' align='center'><strong>{ totalHomeless }</strong> {"  (" + Math.round(totalHomeless / totalClients * 100) + "%)" }</Typography></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer> 
        </Box>
    )
}