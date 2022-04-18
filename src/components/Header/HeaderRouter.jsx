import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, Switch, Redirect, Route, Link, useHistory, matchPath, useRouteMatch, useParams } from "react-router-dom";
import { HeaderBar } from ".";
import { isAdmin } from '../System/js/Database';

export default function SearchNavBarContainer(props) {
    const route = useLocation();
    const history = useHistory();
    const checkSectionURL = () => {
        const url = route.pathname;
        console.log(url)

        if (matchPath(url, { path: "/", exact: false, strict: false })) {
            return 0;
        }
        else if (matchPath(url, { path: "/clients", exact: false, strict: false })) {
            return 0;
        }
        else if (matchPath(url, { path: "/admin", exact: false, strict: false })) {
            return 1;
        }
        else if (matchPath(url, { path: "/today", exact: false, strict: false })) {
            return 2;
        }
        else {
            return 3;
        }
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
            if (isAdmin) history.push("/admin");
            break;
          case 2:
            history.push("/today");
            break;
          case 3:
            history.push("/user");
            break;
        }
    }

    return (
        <HeaderBar updateRoute={ updateRoute } checkSectionURL={ checkSectionURL } />
    );
}