import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
// import { Alert } from '@material-ui/lab';
import { Accordion, AccordionDetails, AccordionSummary, Box, Snackbar, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { DependentsDisplay } from '..';
import { calcFamilyCounts, calcDependentsAges, utilCalcAge } from '../../System/js/Clients/ClientUtils';
import { ClientInfoForm, FamilyTotalsForm, FinancialInfoForm, PrintClientInfo } from '..';
import { dbSaveClientAsync, setEditingState } from '../../System/js/Database';

ClientPage.propTypes = {
    client: PropTypes.object.isRequired,
    updateClient: PropTypes.func.isRequired,
    showAlert: PropTypes.func.isRequired,
    updateClientsURL: PropTypes.func.isRequired,
}

export default function ClientPage(props) {
    const { client, updateClient, updateClientsURL } = props
    const [ expanded, setExpanded ] = useState(false);
    const [ saveMessage, setSaveMessage ] = useState({ result: 'success', time: client.updatedDateTime });
  
    const handleChange = (panel) => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    };

    function saveAndUpdateClient(data){
        setSaveMessage({ result: 'working' });
        dbSaveClientAsync(data)
            .then( (result) => {
                setEditingState(false)
                if (result.clientId) data.clientId = result.clientId
                setSaveMessage({ result: 'success', time: data.updatedDateTime });
                data = utilCalcAge(data)
                data.dependents = calcDependentsAges(data)
                data.family = calcFamilyCounts(data)
                updateClient(data);
                updateClientsURL(data.clientId, 1)
            })
            .catch( message => {
                setSaveMessage({ result: 'error', text: message });
            });
    }

    const clientLable = (client.clientId == 0) ? "New Client" : "Client #" + client.clientId

    return (
        <Fragment>
            <Snackbar  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={ true } style={{ marginBottom: "60px" }}>
                <PrintClientInfo client={ client } />
            </Snackbar>

            <Box mt={ 6 } width={ 1 } style={{ overflowY: 'scroll' }}>
                <Accordion key="ClientInfo" defaultExpanded={ true } onChange={handleChange('panel1')}>
                    <AccordionSummary style={{justifyContent: "center"}} expandIcon={<ExpandMore />} id="panel1bh-header" >
                        {/* <Typography  variant='button'>Client #{client.clientId}</Typography> */}
                        <Typography  variant='button'>{ clientLable }</Typography>
                    </AccordionSummary>
                    <AccordionDetails style={{justifyContent: "center"}}> 
                        <Box ml={ 3 } mr={ 3 }>
                            <ClientInfoForm client={ client } saveAndUpdateClient={ saveAndUpdateClient } 
                                saveMessage={ saveMessage } />
                        </Box>
                    </AccordionDetails>
                </Accordion>

                <Accordion key="Dependents" expanded={expanded === 'panel2'} onChange={ handleChange('panel2') }>

                    <AccordionSummary expandIcon={ <ExpandMore /> } id="panel2bh-header">
                        <Box style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
                            <Box style={{ justifyContent: "flex-start" }}>
                                <Typography variant='button' ><b>Dependents</b></Typography>
                            </Box>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails  style={{ justifyContent: "center" }} >
                        <Box display="flex" flexDirection="column" alignItems="flex-end">
                            {/* <Box mb={ 2 }>
                                <Tooltip title= 'Add Dependent' placement="left-end">
                                    <Fab  float='right' onClick={() => handleNewDependent()} size='small' color='primary' ><Add /></Fab> 
                                </Tooltip>
                            </Box> */}
                            <DependentsDisplay client= { client } saveAndUpdateClient={ saveAndUpdateClient } 
                                saveMessage={ saveMessage }/>
                        </Box>
                    </AccordionDetails>
                </Accordion>

                <Accordion key="FamilyTotals" expanded={expanded === 'panel3'} onChange={ handleChange('panel3') }>
                    <AccordionSummary expandIcon={ <ExpandMore /> } id="panel3bh-header">
                        <Typography variant='button' ><b>Family Totals</b></Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FamilyTotalsForm client={ client }/>
                    </AccordionDetails>
                </Accordion>

                <Accordion key="FinancialInfo" expanded={expanded === 'panel4'} onChange={ handleChange('panel4') }>
                    <AccordionSummary expandIcon={ <ExpandMore /> } id="panel4bh-header">
                        <Typography variant='button' ><b>Financial Information</b></Typography>
                    </AccordionSummary>
                        <Box ml={ 3 } mr={ 3 } mb={ 2 }>
                            <FinancialInfoForm client = { client } saveAndUpdateClient={ saveAndUpdateClient } 
                            saveMessage={ saveMessage }/>
                        </Box>
                </Accordion>
            </Box>
        </Fragment>
    );
}
