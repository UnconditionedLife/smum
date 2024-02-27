import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useLocation, matchPath } from "react-router-dom";
import { AdminMain } from '..';
import { navigationAllowed } from '../../System/js/Database';

AdminRouter.propTypes = {

}

export default function AdminRouter(props) {
    const history = useHistory();
    const route = useLocation();
    const url = route.pathname;
    const [ selectedTab, setSelectedTab ] = useState(0);

    const updateAdminURL = (newTab) => {
        if (navigationAllowed()) {
            let newURL = ""
            switch (newTab) {
                case 0:
                    newURL = "/admin/reports";
                    break;
                case 1:
                    newURL = "/admin/calendar";
                    break;
                case 2:
                    newURL = "/admin/servicetypes";
                    break;
                case 3:
                    newURL = "/admin/users";
                    break;
                case 4:
                    newURL = "/admin/settings";
                    break;
                case 5:
                    newURL = "/admin/error";
                    break;
            }
            if (newURL !== url) history.push(newURL)
            handleTabChange(newTab)
        }
    }

    const checkAdminURL = () => {
        if (matchPath(url, { path: "/admin/reports", exact: true, strict: false }) || matchPath(url, { path: "/admin", exact: true, strict: false })) {
            history.push("/admin/reports");
            handleTabChange(0);
        }
        else if (matchPath(url, { path: "/admin/calendar", exact: true, strict: false })) {
            handleTabChange(1);
        }
        else if (matchPath(url, { path: "/admin/servicetypes", exact: true, strict: false })) {
            handleTabChange(2);
        }
        else if (matchPath(url, { path: "/admin/users", exact: true, strict: false })) {
            handleTabChange(3);
        }
        else if (matchPath(url, { path: "/admin/settings", exact: true, strict: false })) {
            handleTabChange(4);
        }
        else if (matchPath(url, { path: "/admin/error", exact: true, strict: false })) {
            handleTabChange(5);
        }
        else {
            // if path does not match a valid path default to /admin
            history.push("/admin");
        }
    }

    function handleTabChange(newValue){
        if (selectedTab !== newValue) setSelectedTab(newValue);
    }
    
    return (    
          <AdminMain {...props}
            checkAdminURL={ checkAdminURL }
            selectedTab={ selectedTab }
            url={ url }
            updateAdminURL={ updateAdminURL } />
    )
}