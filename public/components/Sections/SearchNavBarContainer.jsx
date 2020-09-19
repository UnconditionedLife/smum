import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, Switch, Redirect, Route, Link, useHistory, matchPath, useRouteMatch, useParams } from "react-router-dom";

import SearchNavBar from "./SearchNavBar.jsx";

export default function SearchNavBarContainer(props) {
    const route = useLocation();
    const history = useHistory();

    const checkSectionURL = (selectedSection) => {
        const url = route.pathname;
        if (matchPath(url, { path: "/clients", exact: false, strict: false })) {
            if (selectedSection != 0) {
                return 0;
            }
        }
        else if (matchPath(url, { path: "/admin", exact: false, strict: false })) {
            if (selectedSection != 1) {
                console.log("Switching to admin...");
                return 1;
            }
        }
        else if (matchPath(url, { path: "/user", exact: false, strict: false })) {
            if (selectedSection != 2) {
                return 2;
            }
        }
        console.log("returning -1");

        return -1;
    }

    const updateRoute = (newValue) => {
        switch (newValue) {
          case 0:
            history.push("/clients");
            break;
          case 1:
            history.push("/admin");
            break;
          case 2:
            history.push("/user");
            break;
        }
    }

    return (
        <SearchNavBar updateRoute={updateRoute} checkSectionURL={checkSectionURL} version="Version 1.0" />
    );
};