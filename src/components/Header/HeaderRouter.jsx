import React from 'react';
import { BrowserRouter as Router, useLocation, useNavigate, matchPath } from "react-router";
import { HeaderBar } from ".";
import { getSession, isAdmin } from '../System/js/Database';

export default function SearchNavBarContainer() {
    const route = useLocation();
    const navigate = useNavigate();
    
    const checkSectionURL = () => {
        const url = route.pathname;

        if (!getSession()) {
            // Make no navigation changes until we have a valid session set up
            return -1;
        }
        if (matchPath({ path: "/", end: true }, url)) {
            return 0;
        }
        else if (matchPath({ path: "/clients", end: true }, url) || matchPath({ path: "/clients/*", end: true }, url)) {
            return 0;
        }
        else if (matchPath({ path: "/admin", end: true }, url) || matchPath({ path: "/admin/*", end: true }, url)) {
            if (isAdmin()) {
                return 1;
            } else {
                // navigate("/clients");
                return 0;
            }
        }
        else if (matchPath({ path: "/today", end: true }, url)) {
            return 2;
        }
        else if (matchPath({ path: "/user", end: true }, url)) {
            return 3;
        }
        else if (matchPath({ path: "/nextvisit", end: true }, url)) {
            return 4;
        }
        else {
            // if path does not match a valid path default to /clients
            updateRoute(0)
            return 0;
        }
    }

    const handleLogout = () => {
        navigate("/clients")
    }

    const updateRoute = (newValue) => {
        const url = route.pathname;
        switch (newValue) {
          case 0:
            if (!matchPath({ path: "/clients", end: false }, url)) {
                navigate("/clients");
            }
            break;
          case 1:
            if (isAdmin()) navigate("/admin");
            break;
          case 2:
            navigate("/today");
            break;
          case 3:
            navigate("/user");
            break;
          case 4:
            navigate("/nextvisit");
            break;
        }
    }

    return (
        <HeaderBar updateRoute={ updateRoute } checkSectionURL={ checkSectionURL } handleLogoutRoute={ handleLogout } />
    );
}