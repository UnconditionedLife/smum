import React from "react";
import PropTypes from 'prop-types';
import { Route, Redirect } from "react-router-dom";
import Container from '@material-ui/core/Container';
import { ClientsRouter } from '../Clients';
import { AdminMain } from '../Admin';
import UserMain from '../User/UserMain.jsx';
import PageToday from './PageToday.jsx';
import { getSession } from '../System/js/Database';

SectionsContent.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    handleSearchTermChange: PropTypes.func.isRequired,
}

export default function SectionsContent(props) {
    if (getSession() == null) return null;

    return (
        <Container ml={ 0 } style={{ overflowY: 'scroll', paddingTop: 0 }}>
            <Route exact path="/">
                <Redirect to="/clients" />
            </Route>
            <Route path="/clients">
                <ClientsRouter
                    searchTerm={ props.searchTerm }
                    handleSearchTermChange={ props.handleSearchTermChange }
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