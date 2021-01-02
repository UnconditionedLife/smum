import React from 'react';
import PropTypes from 'prop-types';
import { FoundPage, ServicesPage, ClientPage, HistoryPage } from '../';
import { useRouteMatch, Route, Switch } from "react-router-dom";
import { Container } from '../../System';

ClientsContent.propTypes = {
    clientsFound: PropTypes.array.isRequired,
    client: PropTypes.object.isRequired, changeClient: PropTypes.func.isRequired,
    updateClient: PropTypes.func.isRequired,
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
                        clientsFound={ props.clientsFound }
                        client={ props.client } changeClient={ props.changeClient }
                        updateURL={ props.updateURL }
                    />
                </Route>
                <Route path={`${match.path}/services/:clientId`}>
                    <ServicesPage 
                        client={ props.client } updateClient={ props.updateClient }
                        session={ props.session } />
                </Route>
                <Route path={`${match.path}/client/:clientId`}>
                    <ClientPage client={props.client} updateClient={ props.updateClient }
                        session={ props.session } />
                </Route>
                <Route path={`${match.path}/history/:clientId`}>
                    <HistoryPage client={props.client} updateClient={ props.updateClient }
                        session={ props.session } />
                </Route>
            </Switch>
        </Container>
    );
}