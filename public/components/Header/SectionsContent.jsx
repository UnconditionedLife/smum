import React from "react";
import { Route, Redirect } from "react-router-dom";
import Container from '@material-ui/core/Container';
import { ClientsRouter } from '../Clients';
import { AdminMain } from '../Admin';
import UserMain from '../User/UserMain.jsx';
import PageToday from './PageToday.jsx';
import { getSession } from '../System/js/Database';

export default function SectionsContent(props) {
    if (getSession() == null) return null;

    return (
        <Container>
            <Route exact path="/">
                <Redirect to="/clients" />
            </Route>
            {/* <SectionsHeader section = { props.section } /> */}
            <Route path="/clients">
                <ClientsRouter
                    searchTerm={props.searchTerm}
                    handleSearchTermChange={props.handleSearchTermChange}
                />
            </Route>
            <Route path="/admin">
                <AdminMain />
            </Route>
            <Route path="/user">
                <UserMain />
            </Route>
            <Route path="/today">
                <PageToday />
            </Route>
        </Container>
    );
}