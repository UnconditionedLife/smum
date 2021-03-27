import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Accordion, AccordionDetails, AccordionSummary, Box, Fab, Snackbar,
    Tooltip, Typography } from '@material-ui/core';
import { ExpandMore, Add } from '@material-ui/icons';
import { DependentsDisplay, SelectTestForm } from '../';
import { isEmpty } from '../../System/js/GlobalUtils.js';
import { ClientInfoForm, FamilyTotalsForm, FinancialInfoForm, PrintClientInfo } 
    from '../../Clients';
// import { saveClient } from '../../System/js/Clients/Clients';
import { dbSaveClient } from '../../System/js/Database';

ClientPage.propTypes = {
    client: PropTypes.object.isRequired,
    updateClient: PropTypes.func.isRequired,
    session: PropTypes.object.isRequired,
    showAlert: PropTypes.func.isRequired,
}

export default function ClientPage(props) {
    const client = props.client;
    const updateClient = props.updateClient;
    const clientFormDiv = useRef(null);
    // const clientFormDiv2 = useRef(null);
    const [ expanded, setExpanded ] = useState(false);
    const [ saveMessage, setSaveMessage ] = useState({})
  
    const handleChange = (panel) => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    };

    useEffect(() => { 
        updateMessage({ result: 'success', time: client.updatedDateTime })
    }, [ client ])

    useEffect(() => {
        if (!isEmpty(client)) {
            uiShowClientEdit(clientFormDiv.current, false)
        } else {
            uiShowClientEdit(clientFormDiv.current, true)
        }
    })

    function updateMessage(msg){
        if (saveMessage !== msg) setSaveMessage(msg)
    }

    function saveAndUpdateClient(data){
        const callback = (result, text) => {
            //console.log(result)
            //console.log(text)
            updateMessage({ result: result, text: text, time: data.updatedDateTime })
            if (result === 'success') updateClient(data)
        }
        dbSaveClient(data, callback)
    }

    return (
        <Fragment>
            <Snackbar  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={ true } style={{ marginBottom: "60px" }}>
                <PrintClientInfo client={ client } />
            </Snackbar>

            <Box mt={ 6 } width={ 1 }>
                <Accordion key="ClientInfo" defaultExpanded={ true } onChange={handleChange('panel1')}>
                    <AccordionSummary style={{justifyContent: "center"}} expandIcon={<ExpandMore />} id="panel1bh-header" >
                        <Typography  variant='button'>Client Info</Typography>
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
                        <Typography variant='button' ><b>Dependents</b></Typography>
                    </AccordionSummary>
                    <AccordionDetails  style={{ justifyContent: "center" }} >
                        <DependentsDisplay client= { client } saveAndUpdateClient={ saveAndUpdateClient } 
                            session={ props.session } saveMessage={ saveMessage }/>
                    </AccordionDetails>
                </Accordion>

                <Accordion key="FamilyTotals" expanded={expanded === 'panel3'} onChange={ handleChange('panel3') }>
                    <AccordionSummary expandIcon={ <ExpandMore /> } id="panel3bh-header">
                        <Typography variant='button' ><b>Family Totals</b></Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FamilyTotalsForm client={client}/>
                    </AccordionDetails>
                </Accordion>

                <Accordion key="FinancialInfo" expanded={expanded === 'panel4'} onChange={ handleChange('panel4') }>
                    <AccordionSummary expandIcon={ <ExpandMore /> } id="panel4bh-header">
                        <Typography variant='button' ><b>Financial Information</b></Typography>
                    </AccordionSummary>
                        {/* This will show the financial info that currently only displays on edit */}
                        {/*  <SelectTestForm client={ client }/>*/}
                        <Box ml={ 3 } mr={ 3 } mb={ 2 }>
                            <FinancialInfoForm client = { client } saveAndUpdateClient={ saveAndUpdateClient } 
                            session={ props.session } saveMessage={ saveMessage }/>
                        </Box>
                </Accordion>
            </Box>
        </Fragment>
    );
}
