import React from "react";
// import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import ClientsMainContainer from '../Clients/ClientsMainContainer.jsx';
import AdminMain from '../Admin/AdminMain.jsx';
import UserMain from '../User/UserMain.jsx';
import PageToday from '../Sections/PageToday.jsx';

// import SectionsHeader from './SectionsHeader.jsx';
import { Route } from "react-router-dom";

// const useStyles = makeStyles((theme) => ({
//     container: {
//         width: '100vw',
//         backgroundColor: 'white',
//         padding: '15px',
//         overflowX: 'none'
//     }
// }));

export default function SectionsContent(props) {
    if (props.session == null) {
        return null;
    } else {
        return (
            <Container>
                {/* <SectionsHeader section = { props.section } /> */}
                <Route path="/clients">
                    <ClientsMainContainer
                        searchTerm={props.searchTerm}
                        handleSearchTermChange={props.handleSearchTermChange}
                        session={props.session}
                    />
                </Route>

                <Route path="/admin">
                    <AdminMain />
                </Route>
                <Route path="/user">
                    <UserMain session={props.session}/>
                </Route>
                <Route path="/today">
                    <PageToday session={props.session}/>
                </Route>
            </Container>
        );
    }
};