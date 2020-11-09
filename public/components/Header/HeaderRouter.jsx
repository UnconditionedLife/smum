import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, Switch, Redirect, Route, Link, useHistory, matchPath, useRouteMatch, useParams } from "react-router-dom";
import { HeaderBar } from "./";

export default function SearchNavBarContainer(props) {
    const route = useLocation();
    const history = useHistory();
    const checkSectionURL = (selectedSection) => {
        const url = route.pathname;
        console.log(url)

        if (matchPath(url, { path: "/", exact: false, strict: false })) {
            if (selectedSection != 0) {
                return 0;
            }
        }
        else if (matchPath(url, { path: "/clients", exact: false, strict: false })) {
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
        else if (matchPath(url, { path: "/today", exact: false, strict: false })) {
            if (selectedSection != 2) {
                return 2;
            }
        }
        else if (matchPath(url, { path: "/user", exact: false, strict: false })) {
            if (selectedSection != 3) {
                return 3;
            }
        }
        return -1;
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
            history.push("/admin");
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
        <HeaderBar updateRoute={ updateRoute } checkSectionURL={ checkSectionURL } version="Version 1.0" />
    );
}