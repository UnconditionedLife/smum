import React, { useState, useEffect } from 'react';
import { useHistory, useLocation, matchPath } from "react-router-dom";
import { ClientsMain } from '../Clients';
import { isEmpty } from '../System';

export default function ClientsMainContainer(props) {
    const handleSearchTermChange = props.handleSearchTermChange;
    const history = useHistory();
    const route = useLocation();
    const url = route.pathname;
    const searchTerm = props.searchTerm;
    const [ selectedTab, setSelectedTab ] = useState(0);

    const updateURL = (clientId, newTab) => {
        const currentClientId = clientId == null ? "" : encodeURIComponent(clientId);
        let newURL = ""
        switch (newTab) {
            case 0:
                newURL = "/clients/found/" + encodeURIComponent(searchTerm);
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
            history.push(newURL)
        }
    }

    const checkClientsURL = () => {
        console.log("Checking url: "+url)
        if (matchPath(url, { path: "/clients/found/:term", exact: true, strict: false }) || matchPath(url, { path: "/clients/found", exact: true, strict: false })) {
            const splitUrl = url.split("/");
            const term = splitUrl.length == 4 ? splitUrl[3] : "";
            if (selectedTab != 0) {
                setSelectedTab(0);
            }
            if (term != searchTerm) {
                handleSearchTermChange(term);
            }

        }
        else if (matchPath(url, { path: "/clients/services/:clientId", exact: true, strict: false }) || matchPath(url, { path: "/clients/services", exact: true, strict: false })) {
            checkClient(1);
        }
        else if (matchPath(url, { path: "/clients/client/:clientId", exact: true, strict: false }) || matchPath(url, { path: "/clients/client", exact: true, strict: false })) {
            checkClient(2);
        }
        else if (matchPath(url, { path: "/clients/history/:clientId", exact: true, strict: false }) || matchPath(url, { path: "/clients/history", exact: true, strict: false })) {
            checkClient(3);
        }
    }

    const checkClient = (tabId) => {
        const splitUrl = url.split("/");
        const clientId = splitUrl.length == 4 ? splitUrl[3] : "";
        if (isEmpty(client) || (client.clientId != clientId)) {
            handleSearchTermChange(clientId);
        }
        if (selectedTab != tabId) {
            setSelectedTab(tabId);
        }
    }

    return (
        <ClientsMain {...props}
            checkClientsURL={checkClientsURL}
            selectedTab={selectedTab} url={url}
            updateURL={updateURL} />
    );
};