import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { isEmpty } from '../js/Utils.js';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles((theme) => ({
    container: {
        width: "100%",
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: '50px auto',
        lineHeight: '50px',
        color: theme.palette.primary.dark,
        paddingBottom: '8px'
    },
    pageTitle: {
        gridColumn: 1,
        gridRow: 1,
        fontSize: '1.75em',
        fontWeight: 'bold',
        textAlign: 'left',
        marginLeft: '20px',
        lineHeight: '50px',
        display: 'grid',
        gridTemplateColumns: '1fr 7fr',
    },
    sectionName: {
        gridColumn: 2,
        gridRow: 1,
        fontSize: '40px',
        fontWeight: 'bold',
        color: theme.palette.primary.light,
        textAlign: 'right',
        marginRight: '15px',
        lineHeight: '50px'
    },
    clientNumber: {
        gridColumn: 1,
        gridRow: 1,
        color: 'white',
        backgroundColor: theme.palette.primary.dark,
        borderRadius: '5px',
        padding: '8px',
        maxWidth: 'fit-content',
        lineHeight: '20px',
        maxHeight: 'fit-content',
        margin: '8px'
    },
    clientName: {
        gridColumn: 2,
        gridRow: 1,
        color: theme.palette.primary.dark,
        padding: '8px',
        maxWidth:  'fit-content',
        lineHeight: '34px',
        maxHeight:  'fit-content',
    },
    twoColumns: {
        gridColumn: '1 / span 2',
        gridRow: 1
    },
    roundButton: {
        margingTop: '-8px',
        marginRight: '15px'
    }
}));

export default function SectionsHeader(props) {
    const client = props.client
    const clientsFounds = props.clientsFound
    const isNewClient = props.isNewClient
    const handleIsNewClientChange = props.handleIsNewClientChange
    const todaysDate = window.moment().format("dddd, MMM DD YYYY")
    const [ headerMessage, setHeaderMessage ] = useState(todaysDate)
    const classes = useStyles();
    let titleType = 'nonclient';

    function handleNewClient() {
        handleIsNewClientChange(true)
    }


    if (!isEmpty(client)) {
        titleType = 'client'
        const parsed = parseInt(client.clientId)
        if (parsed !== headerMessage) setHeaderMessage(parsed)
    } else {
        titleType = 'nonclient'
        if (isNewClient) {
            if (headerMessage !== 'New Client') setHeaderMessage('New Client');
        } else {
            if (!isEmpty(clientsFounds)) {
                const count = clientsFounds.length;
                if (count === 1) {
                    if (headerMessage !== '1 Client Found') setHeaderMessage('1 Client Found');
                } else {
                    const msg = count + ' Clients Found'
                    if (headerMessage !== msg ) setHeaderMessage(msg);
                }
            } else {
                if (headerMessage !== todaysDate ) setHeaderMessage(todaysDate);
            }
        }
    }; 

    return (
        <div className = { classes.container }>
            { titleType === 'nonclient' && 
                <div className={ classes.pageTitle }>
                    <div className={ classes.twoColumns }>
                    { headerMessage }
                    </div>
                </div> 
            }
            {/* { headerState === 'new-client' && { "NEW CLIENT" } } //TODO WIRE TO NEW CLIENT PAGE */}
            { titleType === 'client' && 
                <div className={ classes.pageTitle }>
                    <div className= { classes.clientNumber }>{ headerMessage }</div>
                    <div className= { classes.clientName }>{ client.givenName } { client.familyName }</div>
                </div> 
            }
            <div className={ classes.sectionName }>
                <Fab onClick={() => handleNewClient()}  size="medium" className={ classes.roundButton } color='default' >
                    <AddIcon />
                </Fab>
                Clients
            </div>
        </div>
    
    )
};