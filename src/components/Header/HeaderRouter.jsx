import React from 'react';
import { BrowserRouter as Router, useLocation, useHistory, matchPath } from "react-router-dom";
import { HeaderBar } from ".";
import { getSession, isAdmin } from '../System/js/Database';

export default function SearchNavBarContainer() {
    const route = useLocation();
    const history = useHistory();
    
    const checkSectionURL = () => {
        const url = route.pathname;

        if (!getSession()) {
            // Make no navigation changes until we have a valid session set up
            return -1;
        }
        if (matchPath(url, { path: "/", exact: true, strict: false })) {
            return 0;
        }
        else if (matchPath(url, { path: "/clients", exact: true, strict: false }) || matchPath(url, { path: "/clients/*", exact: true, strict: false })) {
            return 0;
        }
        else if (matchPath(url, { path: "/admin", exact: true, strict: false }) || matchPath(url, { path: "/admin/*", exact: true, strict: false })) {
            if (isAdmin()) {
                return 1;
            } else {
                // history.push("/clients");
                return 0;
            }
        }
        else if (matchPath(url, { path: "/today", exact: true, strict: false })) {
            return 2;
        }
        else if (matchPath(url, { path: "/user", exact: true, strict: false })) {
            return 3;
        }
        else if (matchPath(url, { path: "/nextvisit", exact: true, strict: false })) {
            return 4;
        }
        else {
            // if path does not match a valid path default to /clients
            updateRoute(0)
            return 0;
        }
    }

    const handleLogout = () => {
        history.push("/clients")
    }

    const updateRoute = (newValue) => {
        const url = route.pathname;
        switch (newValue) {
          case 0:
            if (!matchPath(url, { path: "/clients", exact: false, strict: false })) {
                history.push("/clients");
            }
            break;
          case 1:
            if (isAdmin()) history.push("/admin");
            break;
          case 2:
            history.push("/today");
            break;
          case 3:
            history.push("/user");
            break;
          case 4:
            history.push("/nextvisit");
            break;
        }
    }

    return (
        <HeaderBar updateRoute={ updateRoute } checkSectionURL={ checkSectionURL } handleLogoutRoute={ handleLogout } />
    );
}