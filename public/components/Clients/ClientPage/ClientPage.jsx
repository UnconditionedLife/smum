import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { DependentsDisplay, SelectTestForm } from '../';
import { PrintClientInfo } from '../../Clients';
import { isEmpty } from '../../System/js/GlobalUtils.js';

ClientPage.propTypes = {
    client: PropTypes.object.isRequired,
}

export default function ClientPage(props) {
    const client = props.client;
    const clientFormDiv = useRef(null);
    const [expanded, setExpanded] = useState(false);
  
    const handleChange = (panel) => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    };

    useEffect(() => {
        if (!isEmpty(client)) {
            uiShowClientEdit(clientFormDiv.current, false)
        } else {
            uiShowClientEdit(clientFormDiv.current, true)
        }
    })

    return (
        <Box mt={ 7 } width={ 1 }>
            <PrintClientInfo client={ client } />
            <Accordion defaultExpanded={ true } onChange={handleChange('panel1')}>
                <AccordionSummary expandIcon={ <ExpandMore /> } id="panel1bh-header" >
                    <Typography variant='button' >Client Info</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box id="clientFormWrap">
                        <div ref={ clientFormDiv }></div>
                    </Box>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                <AccordionSummary expandIcon={ <ExpandMore /> } id="panel2bh-header">
                    <Typography variant='button' ><b>Dependents</b></Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <DependentsDisplay client= { client } />
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                <AccordionSummary expandIcon={ <ExpandMore /> } id="panel3bh-header">
                    <Typography variant='button' ><b>Family Totals</b></Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        This will show the family totals section (calculated counts)
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
                <AccordionSummary expandIcon={ <ExpandMore /> } id="panel4bh-header">
                    <Typography variant='button' ><b>Financial Information</b></Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        This will show the financial info that currently only displays on edit
                        <SelectTestForm client={ client }/>
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}


        // <div>
            // <div className="topFormButtonsDiv">

                {/* <input id="newClientButton" className="solidButton viewOnly" onclick="clickShowNewClientForm()" type="button" value="New Client"> */}
                {/* <input id="clientLeftSlider" className="leftSlider sliderActive" onclick="clickToggleClientViewEdit('view')" type="button" value="View">
                <input id="clientRightSlider" className="rightSlider" onclick="clickToggleClientViewEdit('edit')" type="button" value="Edit"> */}
            // </div>

            // <DependentsDisplay client= { client } />
        // </div>