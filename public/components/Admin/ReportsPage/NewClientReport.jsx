import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Typography, TableFooter, Snackbar } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers'
import Button from '../../System/Core/Button.jsx';
import { SettingsZipcodes, dbGetSvcsInMonthAsync, dbSearchClientsAsync } from '../../System/js/Database'
import { NodeBaseExport } from 'readable-stream';

export default function NewClientReport(props) {
    const [ counts, setCounts ] = useState([])
    const [ clientIds, setClientIds ] = useState([])
    const [ yearMonth, handleYearMonthChange ] = useState(moment().subtract(1, 'month').format('YYYYMM'))
    const [ totalNewClients, setTotalNewClients ] = useState(0)
    const [ totalNewHomeless, setTotalNewHomeless ] = useState(0)
    const [ openMsg, setOpenMsg ] = useState(false);
    const [ msg, setMsg ] = useState(false);
    
    let numNewClients = []

    const zipCodes = SettingsZipcodes()
    const USDAServiceTypeId = "cj86davnj00013k7zi3715rf4"

    function handleMsgClose(){ setOpenMsg(false) }

    function displayMsg(text){


        if (msg !== text) setMsg(text)
        if (!openMsg) setOpenMsg(true)
    }

    function StartRunReport(){
        displayMsg("Loading " + moment(yearMonth).format('MMMM YYYY') + " services...")
        setTimeout(() => {
            RunReport();
        }, 200)
    }

    function RunReport(){
        dbGetSvcsInMonthAsync(moment(yearMonth).format('YYYYMM'))
            .then(svcs => {
                const monthOfValidSvcs = svcs.filter(item => item.serviceValid == 'true')
                const monthOfValidUSDASvcs = monthOfValidSvcs.filter(item => item.serviceTypeId == USDAServiceTypeId)
                let newClients = []
                let tempList = []

                displayMsg("Loading clients services...")
                monthOfValidUSDASvcs.forEach(svc => {    
                    dbSearchClientsAsync(svc.clientServedId)
                        .then(clients => {
                            const client = clients[0]
                            const dividedYearMonth = moment(yearMonth).format('YYYYMM').substring(0,4) + "-" + moment(yearMonth).format('YYYYMM').substring(4)
                            const firstSeen = client.firstSeenDate
                        if (firstSeen.substring(0,7) == dividedYearMonth) {
                            console.log("matching MONTH")
                            tempList.push(svc.clientServedId)
                            newClients.push(client)
                        }
                        setClientIds(tempList.sort((b, a) => { return b-a }))

                        displayMsg("Calculating...")
                        zipCodes.forEach(zip => {
                            let zipRecord = { area: zip }
                            zipRecord.total = newClients.filter(client => client.zipcode == zip).length
                            zipRecord.homeless = newClients.filter(client => client.zipcode == zip && client.homeless == "YES").length
                            numNewClients.push(zipRecord)
                            setCounts(numNewClients)
                        })

                        let zipRecord = { area: "Out Of Area" }
                        zipRecord.total = newClients.filter(client => !zipCodes.includes(client.zipcode)).length
                        zipRecord.homeless = newClients.filter(client => !zipCodes.includes(client.zipcode) && client.homeless == "YES").length
                        numNewClients.push(zipRecord)
                        setCounts(numNewClients)
                        let total = 0
                        let homeless = 0
                        numNewClients.forEach( item => {
                            total += item.total
                            homeless += item.homeless
                        })
                        setTotalNewClients(total)
                        setTotalNewHomeless(homeless)
                        
                        displayMsg("Report Complete...")
                    })
                })
            })
    }

    return (
        <Box m={ 8 } maxWidth="100%">
            <Typography>New Clients Report</Typography>
            <DatePicker lable='Year and Month' name="yearMonth" views={["year", "month"]} value={ yearMonth } onChange={ handleYearMonthChange } />
            <Button variant='contained' onClick={ () => StartRunReport() }>Run { moment(yearMonth).format('MMM, YYYY') } Report</Button>

            <TableContainer align="center"> 
                <Table align="center">
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan="3" style={{ alignContent: "center" }}>
                                <Typography variant='h5' align='center'>New Clients - { moment(yearMonth).format('MMMM YYYY')}</Typography>
                                <Typography variant='button' align='center'>Generated { moment().format("MMM DD, YYYY, HH:MM a") }</Typography>
                            </TableCell>
                        </TableRow>
                         <TableRow>
                            {/* <TableCell>ID #</TableCell> */}
                            <TableCell align="center">Zipcode</TableCell>
                            <TableCell align="center">Total</TableCell>
                            <TableCell align="center">Homeless</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
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