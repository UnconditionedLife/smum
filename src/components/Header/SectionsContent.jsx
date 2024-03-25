import React from "react";
import PropTypes from 'prop-types';
import { Route, Redirect } from "react-router-dom";
import Container from '@mui/material/Container';
import { ClientsRouter } from '../Clients';
import { AdminMain } from '../Admin';
import UserMain from '../User/UserMain.jsx';
import PageToday from './PageToday.jsx';
import { getUserName } from '../System/js/Database';
import NextVisit from '../NextVisit/NextVisit.jsx';

SectionsContent.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    handleSearchTermChange: PropTypes.func.isRequired,
}

export default function SectionsContent(props) {
    const { searchTerm, handleSearchTermChange } = props
    // do not render admin content if userName is not set
    if ( !getUserName() ) return null;

    return (
        <Container ml={ 0 } style={{ overflowY: 'visible', margin:0, padding:0, maxWidth:'100%' }}>
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
                <AdminMain />
            </Route>
            <Route path="/user">
                <UserMain />
            </Route>
            <Route path="/today">
                <PageToday />
            </Route>
            <Route path="/nextvisit">
                <NextVisit />
            </Route>
        </Container>
    );
}