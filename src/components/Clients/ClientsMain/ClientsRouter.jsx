import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation, matchPath } from "react-router";
import { ClientsMain } from '..';
import { navigationAllowed } from '../../System/js/Database';

ClientsRouter.propTypes = {
    handleSearchTermChange: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired,
    client: PropTypes.object,
}

export default function ClientsRouter(props) {
    const { searchTerm, handleSearchTermChange } = props;
    const navigate = useNavigate();
    const route = useLocation();
    const url = route.pathname;
    const [ selectedTab, setSelectedTab ] = useState(0);

    const updateClientsURL = (clientId, newTab) => {
        if (navigationAllowed()) {
            const currentClientId = clientId == null ? "" : encodeURIComponent(clientId);
            let newURL = ""
            const urlSearchTerm = searchTerm.replaceAll(/[/.]/g, "-") // replace all "/" and "." with "-"

            switch (newTab) {
                case 0:
                    newURL = "/clients/found/" + encodeURIComponent(urlSearchTerm);
                    break;
                case 1:
                    newURL = "/clients/services/" + currentClientId;
                    break;
                case 2:
                    newURL = "/clients/client/" + currentClientId;
                    break;
                case 3:
                    newURL = "/clients/history/" + currentClientId;
                    break;
            }
            if (newURL != url) {
                navigate(newURL)
            }
            handleTabChange(newTab)
        }
    }

    const checkClientsURL = (client) => {
        if (matchPath({ path: "/clients/found/:term", end: true }, url) || matchPath({ path: "/clients/found", end: true }, url)) {
            const splitUrl = url.split("/");
            const term = splitUrl.length == 4 ? splitUrl[3] : "";
            if (selectedTab != 0) {
                setSelectedTab(0);
            }
            if (term != searchTerm) {
                handleSearchTermChange(decodeURIComponent(term));
            }

        }
        else if (matchPath({ path: "/clients/services/:clientId", end: true }, url) || matchPath({ path: "/clients/services", end: true }, url)) {
            checkClient(client, 1);
        }
        else if (matchPath({ path: "/clients/client/:clientId", end: true }, url) || matchPath({ path: "/clients/client", end: true }, url)) {
            checkClient(client, 2);
        }
        else if (matchPath({ path: "/clients/history/:clientId", end: true }, url) || matchPath({ path: "/clients/history", end: true }, url)) {
            checkClient(client, 3);
        }
        else {
            // if path does not match a valid path default to /clients
            navigate("/clients");
        }
    }

    const checkClient = (client, tabId) => {
        const splitUrl = url.split("/");
        const clientId = splitUrl.length == 4 ? splitUrl[3] : "";
        if (client.clientId !== clientId) {
            handleSearchTermChange(clientId);
        }
        if (selectedTab != tabId) {
            setSelectedTab(tabId);
        }
    }

    const handleTabChange = (newValue) => {
        setSelectedTab(newValue);
    };
    
    return (    
          <ClientsMain {...props}
            checkClientsURL={ checkClientsURL }
            selectedTab={ selectedTab }
            url={ url }
            updateClientsURL={ updateClientsURL } />
    )
}