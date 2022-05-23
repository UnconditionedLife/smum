import React from "react";
import PropTypes from 'prop-types';
import { Route, Redirect } from "react-router-dom";
import Container from '@material-ui/core/Container';
import { ClientsRouter } from '../Clients';
import { AdminRouter } from '../Admin';
import UserMain from '../User/UserMain.jsx';
import PageToday from './PageToday.jsx';
import { getUserName } from '../System/js/Database';

SectionsContent.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    handleSearchTermChange: PropTypes.func.isRequired,
}

export default function SectionsContent(props) {
    const { searchTerm, handleSearchTermChange } = props
    // do not render admin content if userName is not set
    if ( !getUserName() ) return null;

    return (
        <Container ml={ 0 } style={{ overflowY: 'scroll', paddingTop: 0 }}>
            <Route exact path="/">
                <Redirect to="/clients" />
            </Route>
            <Route path="/clients">
                <ClientsRouter
                    searchTerm={ searchTerm }
                    handleSearchTermChange={ handleSearchTermChange }
                />
            </Route>
            <Route path="/admin">
                <AdminRouter />
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