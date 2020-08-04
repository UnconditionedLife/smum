import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import ClientsMain from '../Clients/ClientsMain.jsx';
import AdminMain from '../Admin/AdminMain.jsx';
import UserMain from '../User/UserMain.jsx';
import SectionsHeader from './SectionsHeader.jsx';

const useStyles = makeStyles((theme) => ({
    container: {
        width: '100vw',
        backgroundColor: 'white',
        padding: '15px',
        overflowX: 'none'
    }
}));

export default function SectionsContent(props) {
    const classes = useStyles();

console.log(props)

    return (
        <div className={ classes.container }>
            <SectionsHeader section = { props.section } />
            {props.section === 0 && <ClientsMain />}
            {props.section === 1 && <AdminMain />}
            {props.section === 2 && <UserMain/>}
      </div>
    );
};