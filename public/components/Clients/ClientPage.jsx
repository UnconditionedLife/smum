import React, { useEffect, useRef, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import { ExpandMore } from '@material-ui/icons';
import { DependentsDisplay } from '../Clients';
import { isEmpty } from '../System/js/Utils.js';

const useStyles = makeStyles((theme) => ({
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: '33.33%',
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
}));

export default function ClientPage(props) {
    const client = props.client;
    const isNewClient = props.isNewClient;
    const clientFormDiv = useRef(null);
    const classes = useStyles();
    const [expanded, setExpanded] = useState(false);
  
    const handleChange = (panel) => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    };

    useEffect(() => {
        if (!isEmpty(client)) {
            uiShowClientEdit(clientFormDiv.current, false)
        } else if (isNewClient) {
            uiShowClientEdit(clientFormDiv.current, true)
        }
    })

    return (
        <Box mt={ 4 } width={ 1 }>
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                <AccordionSummary expandIcon={<ExpandMore />} id="panel1bh-header" >
                    <Typography className={classes.heading}><b>Client Info</b></Typography>
                    <Typography className={classes.secondaryHeading}>Name, Gender, DOB, etc.</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div id="clientFormWrap">
                        <div ref={ clientFormDiv }></div>
                    </div>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                <AccordionSummary expandIcon={<ExpandMore />} id="panel2bh-header" >
                    <Typography className={classes.heading}><b>Address {'&'} Contact Info</b></Typography>
                    <Typography className={classes.secondaryHeading}>Street Address, Telephone, and Email</Typography>
                </AccordionSummary>
        <AccordionDetails>
        <Typography>
            This will show the address and contact parts of the client form
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
        >
          <Typography className={classes.heading}><b>Dependents</b></Typography>
          <Typography className={classes.secondaryHeading}>List of dependents (spouse, children, other dependents)</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <DependentsDisplay client= { client } />
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel4bh-content"
          id="panel4bh-header"
        >
          <Typography className={classes.heading}>Family Totals</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            This will show the family totals section (calculated counts)
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel4bh-content"
          id="panel4bh-header"
        >
          <Typography className={classes.heading}>Financial Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            This will show the financial info that currently only displays on edit
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

        // <div>
            // <div className="topFormButtonsDiv">

                {/* <input id="newClientButton" className="solidButton viewOnly" onclick="clickShowNewClientForm()" type="button" value="New Client"> */}
                {/* <input id="clientLeftSlider" className="leftSlider sliderActive" onclick="clickToggleClientViewEdit('view')" type="button" value="View">
                <input id="clientRightSlider" className="rightSlider" onclick="clickToggleClientViewEdit('edit')" type="button" value="Edit"> */}
            // </div>

            // <DependentsDisplay client= { client } />
        // </div>