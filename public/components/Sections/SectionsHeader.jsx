import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import ClientsMain from '../Clients/ClientsMain.jsx';
import AdminMain from '../Admin/AdminMain.jsx';
import UserMain from '../User/UserMain.jsx';

const useStyles = makeStyles((theme) => ({
    wrapper: {
        width: '100vw',
        padding: '15px'
    },
    container: {
        width: "100%",
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: '50px auto',
        lineHeight: '50px',
        color: theme.palette.primary.dark,
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
    }
}));

export default function SectionsHeader(props) {
    const sectionNames = [ "Clients", "Admin", "User" ]
    const name = sectionNames[ props.section ]
    const client = props.client
    const clientData = props.clientData
    const [ headerState, setHeaderState ] = useState('date');
    const classes = useStyles();
    const todaysDate = window.moment().format("dddd, MMM DD YYYY")
    
    if (client !== null) {
        const parsed = parseInt(client.clientId)
        if (parsed !== headerState) {
            setHeaderState(parsed)
        }
    };

    return (
        <div className={ classes.wrapper }>
            <div className = { classes.container }>
                    { headerState === 'date' && 
                        <div className={ classes.pageTitle }>
                            <div className={ classes.twoColumns }>
                            { todaysDate }
                            </div>
                        </div> 
                    }
                    {/* { headerState === 'new-client' && { "NEW CLIENT" } } //TODO WIRE TO NEW CLIENT PAGE */}
                    { (Number.isInteger(headerState) && parseInt(client.clientId) === headerState ) && 
                        <div className={ classes.pageTitle }>
                            <div className= { classes.clientNumber }>{ client.clientId }</div>
                            <div className= { classes.clientName }>{ client.givenName } { client.familyName }</div>
                        </div> 
                    }
                    <div className={ classes.sectionName }>{ name }</div>
            </div>
            {props.section === 0 && <ClientsMain client={ client } clientData={ clientData } />}
            {props.section === 1 && <AdminMain />}
            {props.section === 2 && <UserMain/>}
        </div> 
    )
};