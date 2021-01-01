import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FoundPage, ServicesPage, ClientPage, HistoryPage } from '../';
import { useRouteMatch, Route, Switch } from "react-router-dom";
import { Container } from '../../System';

ClientsContent.propTypes = {
    clientsFound: PropTypes.array.isRequired,
    client: PropTypes.object.isRequired,
    handleClientChange: PropTypes.func.isRequired,
    svcsRendered: PropTypes.object.isRequired,
    updateSvcsRendered: PropTypes.func.isRequired,
    updateURL: PropTypes.func.isRequired,
    session: PropTypes.object.isRequired,
}

export default function ClientsContent(props) {
    const match = useRouteMatch();

    return (
        <Container maxWidth='lg' mt={0} pt={0}>
            <Switch>
                <Route path={`${match.path}/found/:term`}>
                    <FoundPage
                        clientsFound={props.clientsFound}
                        client={props.client}
                        handleClientChange={props.handleClientChange}
                        updateURL={props.updateURL}
                    />
                </Route>
                <Route path={`${match.path}/services/:clientId`}>
                    <ServicesPage 
                        client={ props.client } 
                        handleClientChange={ props.handleClientChange }
                        session={ props.session }
                        svcsRendered={ props.svcsRendered } 
                        handleSvcsRendered={ props.updateSvcsRendered } />
                </Route>
                <Route path={`${match.path}/client/:clientId`}>
                    <ClientPage client={props.client} />
                </Route>
                <Route path={`${match.path}/history/:clientId`}>
                    <HistoryPage client={props.client} session={ props.session } />
                </Route>
            </Switch>
        </Container>
    );
}