import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { FoundPage, ServicesPage, ClientPage, HistoryPage } from '..';
import { useRouteMatch, Route, Switch } from "react-router-dom";
import SmumLogo from "../../Assets/SmumLogo";

ClientsContent.propTypes = {
    clientsFound: PropTypes.array.isRequired,
    client: PropTypes.object.isRequired, 
    changeClient: PropTypes.func.isRequired,
    updateClient: PropTypes.func.isRequired,
    updateClientsURL: PropTypes.func.isRequired,
    showFound: PropTypes.bool.isRequired,
    showServices: PropTypes.bool.isRequired,
    showClient: PropTypes.bool.isRequired,
    showAlert: PropTypes.func.isRequired,
    lastServedDays: PropTypes.object,
    lastServedFoodDate: PropTypes.object,
    clientInactive: PropTypes.bool,
}

export default function ClientsContent(props) {
    const { clientsFound, client, showFound, showServices, showClient, lastServedDays, 
        lastServedFoodDate, clientInactive, changeClient, updateClient, updateClientsURL, showAlert } = props
    const match = useRouteMatch();

    const logoBox = (
        <Box display="flex" width="100%" height="100%" justifyContent="center" paddingLeft="0px">
            <SmumLogo width='20vh' display="watermark" 
                style={{ marginTop: '27vh', paddingLeft:'0px' }}/>
        </Box>
    )

    return (
        <Box maxWidth='lg' mt={0} pt={0}>
            <Switch>
                <Route path={`${match.path}/found/:term`}>
                    { showFound && 
                        <FoundPage
                            clientsFound={ clientsFound }
                            client={ client } changeClient={ changeClient }
                            updateClientsURL={ updateClientsURL } showAlert={ showAlert } />
                    }
                    { !showFound && logoBox }
                </Route>              
                <Route path={`${match.path}/services/:clientId`}>
                    { showServices && 
                        <ServicesPage 
                            clientsFound={ clientsFound }
                            client={ client } updateClient={ updateClient }
                            showAlert={ showAlert } lastServedFoodDate={ lastServedFoodDate }
                            lastServedDays={ lastServedDays } clientInactive={ clientInactive }/>
                    }
                    { !showServices && logoBox }
                </Route>
                <Route path={`${match.path}/client/:clientId`}>
                    { showClient && 
                        <ClientPage client={client} updateClient={ updateClient }
                        updateClientsURL={ updateClientsURL } showAlert={ showAlert } />
                    }
                    { !showClient && logoBox }
                </Route>
                <Route path={`${match.path}/history/:clientId`}>
                    { showClient && 
                        <HistoryPage client={client} updateClient={ updateClient }
                            showAlert={ showAlert } lastServedFoodDate={ lastServedFoodDate } />
                    }
                    { !showClient && logoBox }
                </Route>
            </Switch>

            { !showClient && !showServices && !showFound && logoBox }
        </Box>
    );
}