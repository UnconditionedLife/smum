import React from "react";
import PropTypes from 'prop-types';
import { Routes, Route, Navigate } from "react-router";
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
            <Routes>
                <Route path="/" element={ <Navigate to="/clients" replace /> } />
                <Route path="/clients/*" element={
                    <ClientsRouter
                        searchTerm={ searchTerm }
                        handleSearchTermChange={ handleSearchTermChange }
                    />
                } />
                <Route path="/admin/*" element={ <AdminMain /> } />
                <Route path="/user/*" element={ <UserMain /> } />
                <Route path="/today/*" element={ <PageToday /> } />
                <Route path="/nextvisit/*" element={ <NextVisit /> } />
            </Routes>
        </Container>
    );
}