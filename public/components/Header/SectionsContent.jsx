import React from "react";
import { Route } from "react-router-dom";
import Container from '@material-ui/core/Container';
import { ClientsRouter } from '../Clients';
import { AdminMain } from '../Admin';
import UserMain from '../User/UserMain.jsx';
import PageToday from './PageToday.jsx';


export default function SectionsContent(props) {
    if (props.session == null) {
        return null;
    } else {
        return (
            <Container>
                {/* <SectionsHeader section = { props.section } /> */}
                <Route path="/clients">
                    <ClientsRouter
                        searchTerm={props.searchTerm}
                        handleSearchTermChange={props.handleSearchTermChange}
                        session={props.session}
                    />
                </Route>
                <Route path="/admin">
                    <AdminMain session={props.session}/>
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
}