import React, { useState, useEffect } from 'react';
import { FoundPage, ServicesPage, ClientPage, HistoryPage } from '../Clients';
import { useRouteMatch, Route, Switch } from "react-router-dom";
import { Container } from '../System';

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
                        setSelectedTab={props.setSelectedTab}
                        updateURL={props.updateURL}
                        isNewClient={props.isNewClient}
                    />
                </Route>
                <Route path={`${match.path}/services/:clientId`}>
                    <ServicesPage client={props.client} isNewClient={props.isNewClient} handleClientChange={props.handleClientChange}
                        session={props.session} />
                </Route>
                <Route path={`${match.path}/client/:clientId`}>
                    <ClientPage client={props.client} isNewClient={props.isNewClient} />
                </Route>
                <Route path={`${match.path}/history/:clientId`}>
                    <HistoryPage client={props.client} isNewClient={props.isNewClient} />
                </Route>
            </Switch>
        </Container>
    );
};