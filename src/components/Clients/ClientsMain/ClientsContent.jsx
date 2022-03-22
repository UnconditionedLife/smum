import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { FoundPage, ServicesPage, ClientPage, HistoryPage } from '..';
import { useRouteMatch, Route, Switch } from "react-router-dom";
import SmumLogo from "../../Assets/SmumLogo";

ClientsContent.propTypes = {
    clientsFound: PropTypes.array.isRequired,
    client: PropTypes.object.isRequired, changeClient: PropTypes.func.isRequired,
    updateClient: PropTypes.func.isRequired,
    updateURL: PropTypes.func.isRequired,
    showFound: PropTypes.bool.isRequired,
    showServices: PropTypes.bool.isRequired,
    showClient: PropTypes.bool.isRequired,
    showAlert: PropTypes.func.isRequired,
    lastServedDays: PropTypes.object,
    lastServedFoodDate: PropTypes.object,
}

export default function ClientsContent(props) {
    const { showFound, showServices, showClient, lastServedDays, lastServedFoodDate  } = props
    const match = useRouteMatch();

    const logoBox = (
        <Box display="flex" width="100%" height="100%" justifyContent="center" p='30%' pt='4%'>
            <SmumLogo width='90%' />
        </Box>
    )

    return (
        <Box maxWidth='lg' mt={0} pt={0}>
            <Switch>
                <Route path={`${match.path}/found/:term`}>
                    { showFound && 
                        <FoundPage
                            clientsFound={ props.clientsFound }
                            client={ props.client } changeClient={ props.changeClient }
                            updateURL={ props.updateURL } showAlert={ props.showAlert } />
                    }
                    { !showFound && logoBox }
                </Route>              
                <Route path={`${match.path}/services/:clientId`}>
                    { showServices && 
                        <ServicesPage 
                            clientsFound={ props.clientsFound }
                            client={ props.client } updateClient={ props.updateClient }
                            showAlert={ props.showAlert } lastServedFoodDate={ lastServedFoodDate }
                            lastServedDays={ lastServedDays }/>
                    }
                    { !showServices && logoBox }
                </Route>
                <Route path={`${match.path}/client/:clientId`}>
                    { showClient && 
                        <ClientPage client={props.client} updateClient={ props.updateClient }
                        updateURL={ props.updateURL } showAlert={ props.showAlert } />
                    }
                    { !showClient && logoBox }
                </Route>
                <Route path={`${match.path}/history/:clientId`}>
                    { showClient && 
                        <HistoryPage client={props.client} updateClient={ props.updateClient }
                            showAlert={ props.showAlert } lastServedFoodDate={ lastServedFoodDate } />
                    }
                    { !showClient && logoBox }
                </Route>
                
                { !showClient && !showServices && !showFound && logoBox }
                
            </Switch>
        </Box>
    );
}